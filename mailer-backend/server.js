const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001; 

// Middlewares
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình Nodemailer
// Chú ý: Nên dùng biến môi trường (environment variables) để lưu thông tin nhạy cảm
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'minhdzwama211@gmail.com', 
    pass: 'wedb sham ruvh qaec' 
  }
});

// Tạo API endpoint để gửi mail
app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: 'minhdzwama211@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('An error occurred while sending the email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Send Email completed!');
    }
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});