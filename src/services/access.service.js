"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");

const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  AMIN: "ADMIN",
};

class AccessService {
  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happened, please login again!");
    }
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Error: Shop not found");
    }
    const isMatch = await bcrypt.compare(password, foundShop.password);
    if (!isMatch) {
      throw new AuthFailureError("Error: Password is incorrect");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      shop: getInfoData({
        filed: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError("Error: Shop already registered");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });
      if (newShop) {
        // created privateKey, publicKey

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
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
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        console.log(`Create token success`, tokens);
        return {
          code: 201,
          message: "Sign up successfully",
          metadata: {
            shop: getInfoData({
              filed: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }
      return {
        code: "xxxx",
        message: "Sign up failed",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
