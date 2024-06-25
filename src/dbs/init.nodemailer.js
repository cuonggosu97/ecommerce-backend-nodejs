"use strict";

const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.AWS_MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.AWS_MAIL_USER,
    pass: process.env.AWS_MAIL_PASSWORD,
  },
});

module.exports = transport;
