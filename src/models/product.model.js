"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      require: true,
    },
    product_thumb: {
      type: String,
      require: true,
    },
    product_description: String,
    product_price: {
      type: Number,
      require: true,
    },
    product_quantity: {
      type: Number,
      require: true,
    },
    product_type: {
      type: String,
      require: true,
      enum: ["Electronics", "Clothing", "Furniture", "Others"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      require: true,
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      require: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// define the product type = Clothing
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      require: true,
    },
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

// define the product type = Electronics
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      require: true,
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

// define the product type = Furniture
const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      require: true,
    },
  },
  {
    collection: "furnitures",
    timestamps: true,
  }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("Electronic", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
};
