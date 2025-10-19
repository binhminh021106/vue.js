const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "minhdzwama211@gmail.com",
    pass: "wedb sham ruvh qaec",
  },
});

app.post("/send-email", (req, res) => {
  const { to, subject, text, html } = req.body;
  const dbPath = "./db.json";

  const newEmail = {
    id: Date.now(),
    to,
    subject,
    text: text || "",
    html: html || "",
    createdAt: new Date().toISOString(),
    read: false,
  };

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Lỗi đọc file db.json:", err);
      return res.status(500).send("Lỗi phía server khi đọc database.");
    }

    const db = JSON.parse(data);
    if (!db.messages) db.messages = [];
    db.messages.unshift(newEmail);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error("Lỗi ghi file db.json:", err);
        return res.status(500).send("Lỗi phía server khi lưu email.");
      }

      const mailOptions = {
        from: "minhdzwama211@gmail.com",
        to,
        subject,
        text: text || "",
        html: html || "",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).send("Email đã được lưu nhưng có lỗi khi gửi đi.");
        } else {
          console.log("Email sent:", info.response);
          res.status(200).send("Email đã được gửi thành công!");
        }
      });
    });
  });
});

app.get("/messages", (req, res) => {
  const dbPath = "./db.json";

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Lỗi đọc file db.json:", err);
      return res.status(500).send("Lỗi phía server khi đọc database.");
    }

    const db = JSON.parse(data);
    res.status(200).json(db.messages || []);
  });
});

app.delete("/messages/:id", (req, res) => {
  const dbPath = "./db.json";
  const messageId = parseInt(req.params.id);

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Lỗi đọc file db.json:", err);
      return res.status(500).send("Lỗi phía server khi đọc database.");
    }

    const db = JSON.parse(data);
    if (!db.messages || db.messages.length === 0) {
      return res.status(404).send("Không tìm thấy danh sách email.");
    }

    const emailIndex = db.messages.findIndex((msg) => msg.id === messageId);
    if (emailIndex === -1) {
      return res.status(404).send("Không tìm thấy email cần xoá.");
    }

    db.messages.splice(emailIndex, 1);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error("Lỗi ghi file db.json:", err);
        return res.status(500).send("Không thể ghi dữ liệu sau khi xoá.");
      }

      console.log(`Đã xoá email có id ${messageId}`);
      res.status(200).send("Xoá email thành công!");
    });
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
