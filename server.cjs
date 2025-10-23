// CHỈ DÙNG require (CommonJS)
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const qs = require("qs");
const { format } = require("date-fns"); // Sửa từ import

const app = express();
const port = 3000;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Thêm origin cho an toàn
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Cấu hình VNPay ---
const vnp_TmnCode = "WDD40GAS";
const vnp_HashSecret = "B01UZWBE5OYMQ5INDIDCCLHMZLG65O1Z";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl =
  "https://concludible-guillermina-amphibologically.ngrok-free.dev/payment-return";

// --- API tạo URL thanh toán ---
app.post("/create_payment_url", (req, res) => {
  try {
    const date = new Date();
    const createDate = format(date, "yyyyMMddHHmmss");

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "";

    const { orderId, amount, bankCode = "", orderDescription = "" } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: "Thiếu orderId hoặc amount" });
    }

    const orderInfo = orderDescription || `Thanh toan don hang #${orderId}`;
    const orderType = "billpayment";
    const locale = "vn";
    const currCode = "VND";

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: parseInt(amount, 10) * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encodeValuesOnly: true });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const finalUrl =
      vnp_Url + "?" + qs.stringify(vnp_Params, { encodeValuesOnly: true });

    return res.json({ url: finalUrl });
  } catch (error) {
    console.error("Lỗi khi tạo URL:", error);
    return res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi tạo URL thanh toán" });
  }
});

// --- Hàm sắp xếp object theo alphabet --- (Chỉ giữ 1 hàm)
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
  console.log(`[Server] Đang chạy tại http://localhost:${port}`);
});
