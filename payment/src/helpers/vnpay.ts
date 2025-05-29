// src/helpers/vnpay.ts

import crypto from 'crypto';
import qs from 'qs';

export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
}

export interface VNPayPaymentData {
  orderId: string;
  amount: number;
  bankCode?: string;
  orderInfo: string;
  ipAddr: string;
}

export interface VNPayReturnData {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export class VNPayHelper {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  // Tạo URL thanh toán VNPay
  createPaymentUrl(paymentData: VNPayPaymentData): string {
    const vnp_Params: Record<string, string> = {
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
    const signData = qs.stringify(sortedParams, { encode: false });
    
    // Tạo secure hash
    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Thêm secure hash vào params
    sortedParams.vnp_SecureHash = signed;
    
    // Tạo URL cuối cùng
    return this.config.vnp_Url + '?' + qs.stringify(sortedParams, { encode: false });
  }

  // Xác thực callback từ VNPay
  verifyCallback(vnpayData: VNPayReturnData): boolean {
    const { vnp_SecureHash, ...params } = vnpayData;
    
    // Sắp xếp tham số
    const sortedParams = this.sortObject(params);
    
    // Tạo signData
    const signData = qs.stringify(sortedParams, { encode: false });
    
    // Tạo secure hash để so sánh
    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    return signed === vnp_SecureHash;
  }

  // Kiểm tra trạng thái thanh toán
  isPaymentSuccess(responseCode: string): boolean {
    return responseCode === '00';
  }

  // Tạo mã giao dịch duy nhất
  private generateTxnRef(orderId: string): string {
    const timestamp = Date.now();
    return `${orderId}_${timestamp}`;
  }

  // Format ngày theo định dạng VNPay
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Sắp xếp object theo key
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    
    return sorted;
  }
}
