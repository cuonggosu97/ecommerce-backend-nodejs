"use strict";
const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.log(`[P]::createTokenPair::verify::err::`, err);
        throw err;
      } else {
        console.log(`[P]::createTokenPair::verify::decoded::`, decoded);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTokenPair,
};
