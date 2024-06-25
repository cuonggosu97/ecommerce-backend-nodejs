"use strict";

const USER = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");
const { sendEmailToken } = require("./email.service");

const newUserService = async ({ email = null, captcha = null }) => {
  // 1. check email exists in dbs
  const user = await USER.findOne({ email }).lean();
  // 2. if exists
  if (user) {
    throw new BadRequestError("Email already exists");
  }
  // 3. send token via email user
  const result = await sendEmailToken({ email });

  return {
    message: "verify email user",
    metadata: {
      token: result,
    },
  };
};

module.exports = {
  newUserService,
};
