sever.js // File: vnpay_server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qs = require('qs');
const { format } = require('date-fns');

const app = express();
const port = 3001; // Cổng cho server backend, khác với cổng 5173 của Vue

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Dán thông tin cấu hình VNPay của bạn vào đây ---
const vnp_TmnCode = 'B2KJSVEG';
const vnp_HashSecret = '1BVEV6VE0RNMSCR6E5D1WJFWPBBTEZ3W';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
// URL trả về của bạn sau khi thanh toán. Sẽ tạo ở Bước 3
const vnp_ReturnUrl = 'http://localhost:5173/payment-return'; 

// Endpoint để tạo URL thanh toán
app.post('/create_payment_url', (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = format(date, 'yyyyMMddHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let orderId = req.body.orderId || format(date, 'HHmmss'); // Lấy orderId từ request
    let amount = req.body.amount;
    let bankCode = req.body.bankCode || '';
    
    let orderInfo = req.body.orderDescription || `Thanh toan don hang ${orderId}`;
    let orderType = req.body.orderType || 'billpayment';
    let locale = req.body.language || 'vn';
    
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    
    let final_vnp_Url = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    // Trả về URL cho frontend
    res.json({ url: final_vnp_Url });
});

// Hàm sắp xếp các key của object
function sortObject(obj) {
	let sorted = {};
	let str = [];
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (let key = 0; key < str.length; key++) {
sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

app.listen(port, () => {
    console.log(`VNPay server đang chạy tại http://localhost:${port}`);
});