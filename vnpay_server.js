// File: vnpay_server.js

import 'dotenv/config';
import express from 'express';
import { VNPay } from '@lehuygiang/vnpay';
import cors from 'cors'; // Thêm cors để cho phép frontend gọi API

const app = express();
const port = 8000; // Cổng cho server backend

// Cấu hình CORS để cho phép request từ Vue app (chạy ở cổng 5173)
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

// === CẤU HÌNH VNPAY ===
// TODO: Thay thế các giá trị này bằng thông tin của bạn
const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE || '2QXUI4B4', // Lấy từ .env hoặc dùng mặc định
    secureSecret: process.env.VNPAY_SECURE_SECRET || 'secret', // Lấy từ .env hoặc dùng mặc định
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
});

// === API TẠO URL THANH TOÁN ===
app.post('/create_payment_url', (req, res) => {
    const { amount, orderInfo, orderId } = req.body;
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan cho ma don hang: ${orderId}`,
        vnp_OrderType: 'other',
        // URL trả về phía frontend sau khi thanh toán
        vnp_ReturnUrl: `http://localhost:5173/payment-return`,
    });

    res.json({ paymentUrl });
});

// === API XỬ LÝ KẾT QUẢ VNPAY TRẢ VỀ (RETURN URL) ===
app.get('/vnpay_return', (req, res) => {
    try {
        const verify = vnpay.verifyReturnUrl({ ...req.query });
        // Trả về kết quả xác thực cho frontend
        return res.json({ ...verify });
    } catch (error) {
        console.error('Lỗi khi xác thực VNPay return:', error);
        return res.status(500).json({ isSuccess: false, message: 'Lỗi server khi xác thực' });
    }
});


app.listen(port, () => {
    console.log(`[VNPAY SERVER] Đang chạy tại http://localhost:${port}`);
});