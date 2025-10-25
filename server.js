import express from "express";
import cors from "cors";
import crypto from "crypto";
import querystring from "qs";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const vnp_TmnCode = "WDD40GAS";
const vnp_HashSecret = "B01UZWBE5OYMQ5INDIDCCLHMZLG65O1Z";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:5173/payment_return";

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

app.post("/create_payment_url", (req, res) => {
  let amount = req.body.amount;
  let orderId = req.body.orderId;
  let orderDescription = req.body.orderDescription;
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  let tmnCode = vnp_TmnCode;
  let secretKey = vnp_HashSecret;
  let returnUrl = vnp_ReturnUrl;
  let date = new Date();
  let createDate =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderDescription;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);

  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  let paymentUrl =
    vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });
  console.log("Payment URL:", paymentUrl);
  res.json({ url: paymentUrl });
});

app.get("/vnpay_return", (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = vnp_HashSecret;

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);

  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    console.log("Chữ ký hợp lệ. Mã phản hồi:", vnp_Params["vnp_ResponseCode"]);
    if (vnp_Params["vnp_ResponseCode"] == "00") {
      res.json({ code: "00", message: "Giao dịch thành công" });
    } else {
      res.json({
        code: vnp_Params["vnp_ResponseCode"],
        message: "Giao dịch thất bại",
      });
    }
  } else {
    console.log("Chữ ký không hợp lệ.");
    res.json({ code: "97", message: "Chữ ký không hợp lệ" });
  }
});

app.listen(port, () => {
  console.log(`Backend VNPAY đang chạy trên http://localhost:${port}`);
});
