"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const USER = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");
const { sendEmailToken } = require("./email.service");
const { checkEmailToken } = require("./otp.service");
const { createUser } = require("../models/repositories/user.repo");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

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

const checkLoginEmailTokenService = async ({ token }) => {
  try {
    // 1. check token in mode otp
    const { otp_email: email, otp_token } = await checkEmailToken({ token });
    if (!email) {
      throw new BadRequestError("Email not found");
    }
    // 2. check email exists in user model
    const hasUser = await findUserByEmailWithLogin({ email });
    if (hasUser) throw new BadRequestError("Email already exists");

    // 3. create new user
    const passwordHash = await bcrypt.hash(email, 10);
    const newUser = await createUser({
      usr_id: 1,
      usr_slug: "xyzabc",
      usr_email: email,
      usr_password: passwordHash,
      usr_role: "667539d89b4caccd54a7ca68",
    });
    if (newUser) {
      // created privateKey, publicKey

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
      });
      if (!keyStore) {
        return {
          code: "xxxx",
          message: "Create publicKey failed",
        };
      }

      const tokens = await createTokenPair(
        { userId: newUser._id, email },
        publicKey,
        privateKey
      );
      console.log(`Create token success`, tokens);
      return {
        code: 201,
        message: "Sign up successfully",
        metadata: {
          user: getInfoData({
            filed: ["usr_id", "usr_name", "usr_email"],
            object: newUser,
          }),
          tokens,
        },
      };
    }
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const findUserByEmailWithLogin = async ({ email }) => {
  const user = await USER.findOne({ usr_email: email }).lean();
  return user;
};

module.exports = {
  newUserService,
  checkLoginEmailTokenService,
};
