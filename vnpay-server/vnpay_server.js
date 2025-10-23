// File: vnpay_server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import qs from "qs";
import { format } from "date-fns";

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Cấu hình VNPay ---
const vnp_TmnCode = "WDD40GAS"; // Mã website của bạn (lấy trên sandbox.vnpayment.vn)
const vnp_HashSecret = "B01UZWBE5OYMQ5INDIDCCLHMZLG65O1Z"; // Chuỗi bí mật
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://minhdev.loca.lt/payment-return"; // Phải trùng đúng URL khai báo trên VNPay Portal

// --- API tạo URL thanh toán ---
app.post("/create_payment_url", (req, res) => {
  try {
    const date = new Date();
    const createDate = format(date, "yyyyMMddHHmmss");

    // Lấy IP của client
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "";

    const { orderId, amount, bankCode = "", orderDescription = "" } = req.body;

    // Validate dữ liệu đầu vào
    if (!orderId || !amount) {
      return res.status(400).json({ error: "Thiếu orderId hoặc amount" });
    }

    const orderInfo = orderDescription || `Thanh toan don hang #${orderId}`;
    const orderType = "billpayment";
    const locale = "vn";
    const currCode = "VND";

    // Tạo object tham số VNPay
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: parseInt(amount, 10) * 100, // VNPay yêu cầu nhân 100
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // --- Sắp xếp tham số theo thứ tự a-z ---
    vnp_Params = sortObject(vnp_Params);

    // --- Tạo chữ ký SHA512 ---
    // SỬA DÒNG NÀY: Dùng { encodeValuesOnly: true }
    const signData = qs.stringify(vnp_Params, { encodeValuesOnly: true });

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // --- Tạo URL thanh toán ---
    // SỬA DÒNG NÀY: Dùng { encodeValuesOnly: true }
    const finalUrl =
      vnp_Url + "?" + qs.stringify(vnp_Params, { encodeValuesOnly: true });

    // --- Trả URL về frontend ---
    return res.json({ url: finalUrl });
  } catch (error) {
    console.error("Lỗi khi tạo URL:", error);
    return res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi tạo URL thanh toán" });
  }
});

// --- Hàm sắp xếp object theo alphabet ---
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// --- Khởi động server ---
app.listen(port, () => {
  console.log(`[VNPay Server] Đang chạy tại http://localhost:${port}`);
});
