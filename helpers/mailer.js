const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "agustin.fassola98@gmail.com",
    pass: "ogdd xjds qhdl jycq",
  },
});

module.exports = transport;