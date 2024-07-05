"use strict";
const { randomInt } = require("crypto");
const OTP = require("../models/otp.model");

const generatorTokenRandom = () => {
  const token = randomInt(0, Math.pow(2, 32));
  return token;
};

const newOtp = async ({ email }) => {
  const token = generatorTokenRandom();
  const newToken = await OTP.create({
    otp_token: token,
    otp_email: email,
  });

  return newToken;
};

const checkEmailToken = async ({ token }) => {
  // check token in model otp
  const hashToken = await OTP.findOne({ otp_token: token });
  if (!hashToken) {
    throw new Error("Token not found");
  }
  // delete token in model otp
  await OTP.deleteOne({ otp_token: token }).then();

  return hashToken;
};
module.exports = {
  newOtp,
  checkEmailToken,
};
