"use strict";

const { randomProductId } = require("../utils");
const SKU_MODEL = require("../models/sku.model");
const _ = require("lodash");
const { CACHE_PRODUCT } = require("../configs/constant");
const { setCacheIOExpiration } = require("../models/repositories/cache.repo");

const newSku = async ({ spu_id, sku_list }) => {
  try {
    const convert_sku_list = sku_list.map((sku) => {
      return {
        ...sku,
        product_id: spu_id,
        sku_id: `${spu_id}.${randomProductId()}`,
      };
    });

    const skus = await SKU_MODEL.create(convert_sku_list);
    return skus;
  } catch (error) {
    return [];
  }
};

const oneSku = async ({ sku_id, product_id }) => {
  try {
    if (sku_id < 0 || product_id < 0) return null;

    const skuKeyCache = `${CACHE_PRODUCT.SKU}${sku_id}`; // key cache

    const sku = await SKU_MODEL.findOne({ sku_id, product_id }).lean();
    await setCacheIOExpiration({
      key: skuKeyCache,
      value: JSON.stringify(sku ?? null),
      expirationInSeconds: 30,
    });
    return {
      ...sku,
      toLoad: "dbs",
    };
  } catch (error) {
    return null;
  }
};

const allSkuBySpuId = async ({ product_id }) => {
  try {
    // check spu exist

    const skus = await SKU_MODEL.find({ product_id }).lean();
    return skus;
  } catch (error) {
    return [];
  }
};

module.exports = {
  newSku,
  oneSku,
  allSkuBySpuId,
};
