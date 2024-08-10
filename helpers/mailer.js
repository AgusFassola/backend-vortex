const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  auth: {
    user: "agustin.fassola98@gmail.com",
    pass: "",
  },
});

module.exports = transport;