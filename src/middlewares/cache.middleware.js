const { CACHE_PRODUCT } = require("../configs/constant");
const { SuccessResponse } = require("../core/success.response");
const { getCacheIO } = require("../models/repositories/cache.repo");

const readCacheSKU = async (req, res, next) => {
  const { sku_id } = req.query;
  const skuKeyCache = `${CACHE_PRODUCT.SKU}${sku_id}`; // key cache
  const skuCache = await getCacheIO({ key: skuKeyCache });
  if (!skuCache) return next();
  if (skuCache) {
    return new SuccessResponse({
      message: "Get one SKU success!",
      metadata: {
        ...JSON.parse(skuCache),
        toLoad: "cache middleware",
      },
    }).send(res);
  }
};

module.exports = {
  readCacheSKU,
};
