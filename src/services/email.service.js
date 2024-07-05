"use strict";

const { NotFoundError } = require("../core/error.response");
const transport = require("../dbs/init.nodemailer");
const { replacePlaceholder } = require("../utils");
const { newOtp } = require("./otp.service");
const { getTemplate } = require("./template.service");

const sendEmailLinkVerify = async ({
  html,
  toEmail,
  subject = "Xác nhận Email đăng ký",
  text = "Xác nhận ...",
}) => {
  try {
    const mailOptions = {
      from: ' "ShopDEV" <cuonggosu030297@gmail.com> ',
      to: toEmail,
      subject,
      text,
      html,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error send email: ", error);
      } else {
        console.log("Email sent: " + info.messageId);
      }
    });
  } catch (error) {
    console.error(`Error send Email:: ${error}`);
    return error;
  }
};

const sendEmailToken = async ({ email = null }) => {
  try {
    // 1. get token
    const token = await newOtp({ email });
    // 2. get template
    const template = await getTemplate({
      tem_name: "HTML EMAIL TOKEN",
    });

    if (!template) {
      throw new NotFoundError("Template not found");
    }
    // 3. replace placeholder with params
    const link_verify = `http://localhost:3052/v1/api/user/welcome-back?token=${token.otp_token}`;
    const content = replacePlaceholder(template.tem_html, {
      link_verify,
    });

    // 4, send email
    sendEmailLinkVerify({
      html: content,
      toEmail: email,
      subject: "Xác nhận Email đăng ký ",
    }).catch((error) => {
      console.error(`Error send email: ${error}`);
    });

    return link_verify;
  } catch (error) {}
};

module.exports = {
  sendEmailToken,
};
