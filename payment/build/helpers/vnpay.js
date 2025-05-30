"use strict";
// src/helpers/vnpay.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VNPayHelper = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qs_1 = __importDefault(require("qs"));
class VNPayHelper {
    constructor(config) {
        this.config = config;
    }
    // Tạo URL thanh toán VNPay
    createPaymentUrl(paymentData) {
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.config.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: this.generateTxnRef(paymentData.orderId),
            vnp_OrderInfo: paymentData.orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: (paymentData.amount * 100).toString(), // VNPay yêu cầu nhân 100
            vnp_ReturnUrl: this.config.vnp_ReturnUrl,
            vnp_IpAddr: paymentData.ipAddr,
            vnp_CreateDate: this.formatDate(new Date())
        };
        // Thêm mã ngân hàng nếu có
        if (paymentData.bankCode) {
            vnp_Params.vnp_BankCode = paymentData.bankCode;
        }
        // Sắp xếp tham số theo thứ tự alphabet
        const sortedParams = this.sortObject(vnp_Params);
        // Tạo query string
        const signData = qs_1.default.stringify(sortedParams, { encode: false });
        // Tạo secure hash
        const hmac = crypto_1.default.createHmac('sha512', this.config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        // Thêm secure hash vào params
        sortedParams.vnp_SecureHash = signed;
        // Tạo URL cuối cùng
        return this.config.vnp_Url + '?' + qs_1.default.stringify(sortedParams, { encode: false });
    }
    // Xác thực callback từ VNPay
    verifyCallback(vnpayData) {
        const { vnp_SecureHash, ...params } = vnpayData;
        // Sắp xếp tham số
        const sortedParams = this.sortObject(params);
        // Tạo signData
        const signData = qs_1.default.stringify(sortedParams, { encode: false });
        // Tạo secure hash để so sánh
        const hmac = crypto_1.default.createHmac('sha512', this.config.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        return signed === vnp_SecureHash;
    }
    // Kiểm tra trạng thái thanh toán
    isPaymentSuccess(responseCode) {
        return responseCode === '00';
    }
    // Tạo mã giao dịch duy nhất
    generateTxnRef(orderId) {
        const timestamp = Date.now();
        return `${orderId}_${timestamp}`;
    }
    // Format ngày theo định dạng VNPay
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
    // Sắp xếp object theo key
    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach(key => {
            sorted[key] = obj[key];
        });
        return sorted;
    }
}
exports.VNPayHelper = VNPayHelper;
