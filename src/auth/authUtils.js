"use strict";
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

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

const authentication = asyncHandler(async (req, res, next) => {
  /* 
    1 - check UserId missing 
    2 - get accessToken
    3 - verifyToken
    4 - check user in dbs
    5 - check keyStore with this userId
    6 - OK all -> return next()
  */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");
  // 2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");
  // 3
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid request");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
