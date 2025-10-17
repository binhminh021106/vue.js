const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình Nodemailer
// Chú ý: Nên dùng biến môi trường (environment variables) để lưu thông tin nhạy cảm
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "minhdzwama211@gmail.com",
    pass: "wedb sham ruvh qaec",
  },
});

app.post("/send-email", (req, res) => {
  const { to, subject, text } = req.body;
  const dbPath = "./db.json"; 

  const newEmail = {
    id: Date.now(),
    from: text.split("\n")[0].replace("From: ", ""), 
    to: to,
    subject: subject,
    text: text.split("\n\nMessage:\n")[1],
    createdAt: new Date().toISOString(),
    read: false, 
  };

  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      console.error("Lỗi đọc file db.json:", err);
      return res.status(500).send("Lỗi phía server khi đọc database.");
    }

    const db = JSON.parse(data);
    if (!db.messages) {
      db.messages = [];
    }
    db.messages.unshift(newEmail);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        console.error("Lỗi ghi file db.json:", err);
        return res.status(500).send("Lỗi phía server khi lưu email.");
      }

      const mailOptions = {
        from: "minhdzwama211@gmail.com",
        to: to,
        subject: subject,
        text: text,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Email đã được lưu nhưng có lỗi khi gửi đi.");
        } else {
          console.log("Email sent: " + info.response);
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

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
