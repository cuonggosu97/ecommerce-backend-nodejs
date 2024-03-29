"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  AMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    console.log("name: ", name);
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: "xxxx",
          message: "Shop already registered",
        };
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
