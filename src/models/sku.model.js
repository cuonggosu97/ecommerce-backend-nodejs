"use strict";

const { model, Schema, set } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Sku";
const COLLECTION_NAME = "skus";

const skuSchema = new Schema(
  {
    sku_id: { type: String, required: true },
    sku_tier_idx: { type: Array, default: [0] }, // [0, 1], [1, 1]
    sku_default: { type: Boolean, default: false },
    sku_slug: { type: String, default: "" },
    sku_price: { type: Number, required: true },
    sku_stock: { type: Number, default: 0 }, // array in of stock
    product_id: { type: String, required: true }, // ref to spu product

    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, skuSchema);
