const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",//servidor smtp de gmail
  port: 587,
  auth: {
    user: "agustin.fassola98@gmail.com",
    pass: "ogdd xjds qhdl jycq",
  },
});

module.exports = transport;
//SMTP: (Simple Mail Transfer Protocol):
// Protocolo utilizado para enviar correos electrónicos