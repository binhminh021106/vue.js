import 'dotenv/config'; // Giúp đọc file .env
import express from 'express';
import { VNPay } from '@lehuygiang/vnpay'; // Dùng import thay cho require

const app = express();
const port = 8000;

// Khởi tạo VNPay
const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
});

app.use(express.json());

// API tạo URL thanh toán
app.post('/create-payment-url', (req, res) => {
    const { amount, orderInfo, orderId } = req.body;
    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: `http://localhost:8080/payment-return`, // URL của frontend Vue.js
    });
    res.json({ paymentUrl });
});

// API xử lý IPN
app.get('/vnpay-ipn', (req, res) => {
    try {
        const verify = vnpay.verifyIpnCall({ ...req.query });
        if (!verify.isVerified) {
            return res.json({ RspCode: '97', Message: 'Fail checksum' });
        }
        // Logic cập nhật đơn hàng
        return res.json({ RspCode: '00', Message: 'Success' });
    } catch (error) {
        console.error('IPN Error:', error);
        return res.json({ RspCode: '99', Message: 'Unknown error' });
    }
});

// API xử lý Return URL
app.get('/vnpay-return', (req, res) => {
     try {
        const verify = vnpay.verifyReturnUrl({ ...req.query });
        return res.json(verify);
    } catch (error) {
        console.error('Return URL Error:', error);
        return res.json({ isSuccess: false, message: 'Verification failed' });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});