"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const body_parser_1 = require("body-parser");
const cookie_session_1 = __importDefault(require("cookie-session"));
const common_1 = require("@jimm9tran/common");
const create_payment_1 = require("./routes/create-payment");
const create_cod_payment_1 = require("./routes/create-cod-payment");
const confirm_cod_payment_1 = require("./routes/confirm-cod-payment");
const vnpay_callback_1 = require("./routes/vnpay-callback");
const get_payment_1 = require("./routes/get-payment");
const process_payment_1 = require("./routes/process-payment");
const health_1 = require("./routes/health");
const app = (0, express_1.default)();
exports.app = app;
app.set('trust proxy', true);
app.use((0, body_parser_1.json)());
// Health check first (no auth required)
app.use(health_1.healthRouter);
app.use((0, cookie_session_1.default)({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));
app.use(common_1.currentUser);
// Routes
app.use(create_payment_1.createPaymentRouter);
app.use(create_cod_payment_1.createCODPaymentRouter);
app.use(confirm_cod_payment_1.confirmCODPaymentRouter);
app.use(vnpay_callback_1.vnpayCallbackRouter);
app.use(get_payment_1.getPaymentRouter);
app.use(process_payment_1.processPaymentRouter);
app.use(health_1.healthRouter);
app.all('*', async (req, res) => {
    throw new common_1.NotFoundError();
});
app.use(common_1.errorHandler);
