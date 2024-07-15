"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);
router.get("/sku/select_variation", productController.findOneSku);
router.get("/spu/spu_info", productController.findOneSpu);
router.get("", productController.findAllProducts);
router.get("/:product_id", productController.findProduct);

// authentication //
router.use(authenticationV2);
//
router.post("", asyncHandler(productController.createProduct));
router.post("/spu/new", asyncHandler(productController.createSpu));
router.patch("/:productId", asyncHandler(productController.updateProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);

// QUERY
router.get("/drafts/all", asyncHandler(productController.getAllDraftForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
