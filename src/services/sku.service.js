"use strict";

const { randomProductId } = require("../utils");
const SKU_MODEL = require("../models/sku.model");
const SPU_MODEL = require("../models/spu.model");
const _ = require("lodash");
const { NotFound } = require("@aws-sdk/client-s3");

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
    // read cache
    const sku = await SKU_MODEL.findOne({ sku_id, product_id }).lean();
    if (sku) {
      // set cache
    }
    return _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"]);
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
