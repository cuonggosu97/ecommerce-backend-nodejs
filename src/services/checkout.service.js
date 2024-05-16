"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  // login and without login
  /*
    {
      cartId,
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discounts: []
          item_products: [
            {
              productId,
              price,
              quantity,
            },
          ],
        },
        {
          shopId,
          shop_discounts: [
            {
              shopId,
              discountId,
              codeId
            }
          ]
          item_products: [
            {
              productId,
              price,
              quantity,
            },
          ],
        },
        }
      ],
    }
  */
  static async checkoutReview({ userId, cartId, shop_order_ids }) {
    // check cartId ton tai khong?
    const fountCart = await findCartById(cartId);
    if (!fountCart) throw new NotFoundError("Cart not found");

    const checkout_order = {
        totalPrice: 0, // tong tien hang
        feeShip: 0, // phi van chuyen
        totalDiscount: 0, // tong tien giam gia
        totalCheckout: 0, // tong tien phai thanh toan
      },
      shop_order_ids_new = [];

    // tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      // check product available
      const checkProductServer = await checkProductByServer(item_products);
      console.log("checkProductServer: ", checkProductServer);
      if (!checkProductServer[0]) throw new BadRequestError("Order wrong!!");

      // tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // time truoc khi giam gia
        priceApplyDiscount: checkoutPrice, // tong tien sau khi giam gia
        item_products: checkProductServer,
      };

      // neu shop_discounts ton tai > 0, check xem co hop le khong
      if (shop_discounts.length > 0) {
        // gia su chi co 1 discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        // tong cong discount giam gia
        checkout_order.totalDiscount += discount;

        // neu tien gian gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }
      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // order
  static async orderByUser({
    userId,
    cartId,
    shop_order_ids,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      userId,
      cartId,
      shop_order_ids,
    });

    // check lai mot lan nua xem vuot so luong ton kho khong?
    // get new array Products
    const products = shop_order_ids_new.flatMap((item) => item.item_products);
    console.log(`[1] products: `, products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // check xem co mot san pham het hang trong kho khong?
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Product out of stock. Please check cart again!"
      );
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // truong hop: neu insert thanh cong, thi remove product khoi cart

    return newOrder;
  }
}

module.exports = CheckoutService;
