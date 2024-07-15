"use strict";

const { findShopById } = require("../models/repositories/shop.repo");
const SPU_MODEL = require("../models/spu.model");
const { NotFoundError } = require("../core/error.response");
const { randomProductId } = require("../utils");
const { newSku, allSkuBySpuId } = require("./sku.service");
const _ = require("lodash");

const newSpu = async ({
  product_id,
  product_name,
  product_thumb,
  product_description,
  product_price,
  product_category,
  product_shop,
  product_attributes,
  product_quantity,
  product_variations,
  sku_list = [],
}) => {
  try {
    // 1. check if shop exists
    const foundShop = await findShopById({
      shop_id: product_shop,
    });
    if (!foundShop) throw new NotFoundError("Shop not found");

    // 2. create a new SPU
    const spu = await SPU_MODEL.create({
      product_id: randomProductId(),
      product_name,
      product_thumb,
      product_description,
      product_price,
      product_category,
      product_shop,
      product_attributes,
      product_quantity,
      product_variations,
    });
    // 3. get spu_id add to sku.service
    if (spu && sku_list.length) {
      // 3. create skus
      const skus = await newSku({ sku_list, spu_id: spu.product_id });
      console.log("skus: ", skus);
    }

    // 4. sync data via elasticsearch (search.service)

    // 5. response result object
    return !!spu;
  } catch (error) {}
};

const oneSpu = async ({ spu_id }) => {
  try {
    const spu = await SPU_MODEL.findOne({
      product_id: spu_id,
      isPublished: false,
    }).lean();
    if (!spu) throw new NotFoundError("SPU not found!");
    const skus = await allSkuBySpuId({ product_id: spu.product_id });
    return {
      spu_info: _.omit(spu, ["__v", "updatedAt"]),
      sku_list: skus.map((sku) =>
        _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"])
      ),
    };
  } catch (error) {
    return {};
  }
};

module.exports = {
  newSpu,
  oneSpu,
};
