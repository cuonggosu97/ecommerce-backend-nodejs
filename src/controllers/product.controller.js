"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");
const { oneSku } = require("../services/sku.service");
const { newSpu, oneSpu } = require("../services/spu.service");

class ProductController {
  // SPU, SKU //
  findOneSpu = async (req, res, next) => {
    try {
      const { product_id } = req.query;
      new SuccessResponse({
        message: "Get one SPU success!",
        metadata: await oneSpu({ spu_id: product_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  findOneSku = async (req, res, next) => {
    try {
      const { sku_id, product_id } = req.query;
      new SuccessResponse({
        message: "Get one SKU success!",
        metadata: await oneSku({ sku_id, product_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description new a SPU
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  createSpu = async (req, res, next) => {
    try {
      const spu = await newSpu({
        ...req.body,
        product_shop: req.user.userId,
      });
      new SuccessResponse({
        message: "Create new SPU success!",
        metadata: spu,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // END SPU, SKU //

  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Create new Product success!",
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId,
    //   }),
    // }).send(res);
    new SuccessResponse({
      message: "Create new Product success!",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // update product

  updateProduct = async (req, res, next) => {
    console.log(" req.params.productId,: ", req.params.productId);

    new SuccessResponse({
      message: "Update Product success!",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product success!",
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublish Product success!",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @desc Get all Draft for Shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Draft success!",
      metadata: await ProductServiceV2.findAllDraftForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Published success!",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product success!",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list findAllProducts success!",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list findProduct success!",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
  // END QUERY
}

module.exports = new ProductController(); // Path: src/routes/access/index.js
