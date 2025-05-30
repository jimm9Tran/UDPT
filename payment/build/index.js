"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const NatsWrapper_1 = require("./NatsWrapper");
const OrderCreatedListener_1 = require("./events/listeners/OrderCreatedListener");
const OrderUpdatedListener_1 = require("./events/listeners/OrderUpdatedListener");
const start = async () => {
    console.log('Khởi động Payment Service...');
    // Kiểm tra các biến môi trường bắt buộc
    if (process.env.JWT_KEY == null) {
        throw new Error('JWT_KEY must be defined');
    }
    if (process.env.MONGO_URI == null) {
        throw new Error('MONGO_URI must be defined');
    }
    if (process.env.NATS_CLIENT_ID == null) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }
    if (process.env.NATS_URL == null) {
        throw new Error('NATS_URL must be defined');
    }
    if (process.env.NATS_CLUSTER_ID == null) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }
    if (process.env.VNPAY_TMN_CODE == null) {
        throw new Error('VNPAY_TMN_CODE must be defined');
    }
    if (process.env.VNPAY_HASH_SECRET == null) {
        throw new Error('VNPAY_HASH_SECRET must be defined');
    }
    if (process.env.VNPAY_URL == null) {
        throw new Error('VNPAY_URL must be defined');
    }
    if (process.env.VNPAY_RETURN_URL == null) {
        throw new Error('VNPAY_RETURN_URL must be defined');
    }
    try {
        // Kết nối tới NATS Streaming Server
        await NatsWrapper_1.natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
        // Xử lý graceful shutdown cho NATS
        NatsWrapper_1.natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => { NatsWrapper_1.natsWrapper.client.close(); });
        process.on('SIGTERM', () => { NatsWrapper_1.natsWrapper.client.close(); });
        // Khởi tạo các event listeners
        new OrderCreatedListener_1.OrderCreatedListener(NatsWrapper_1.natsWrapper.client).listen();
        new OrderUpdatedListener_1.OrderUpdatedListener(NatsWrapper_1.natsWrapper.client).listen();
        // Kết nối tới MongoDB
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Đã kết nối tới MongoDB');
    }
    catch (err) {
        console.error(err);
    }
    // Khởi động server trên port 3000
    app_1.app.listen(3000, () => {
        console.log('Payment Service đang chạy trên port 3000!!!!!');
    });
};
void start();
