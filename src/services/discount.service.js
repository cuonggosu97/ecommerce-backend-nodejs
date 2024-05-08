"use strict";

const e = require("express");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
  findAllDiscountCodesSelect,
} = require("../models/repositories/discount.repo");

/*
  Discount Services
  1 - Generator Discount Code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [User | Shop] 
  4 - Verify discount code [User]
  5 - Delete discount Code [Admin | Shop]
  6 - Cancel discount code [User] 
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
    } = payload;
    // kiểm tra
    if (new Date() > new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired!");
    }
    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date!");
    }
    //create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists!");
    }
    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }
  /*
    Get all discount codes available with products
  */
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    // create index for discount_code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: shopId,
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exits!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: shopId,
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get specific product
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /*
    Get all discount code of Shop
  */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: shopId,
        discount_is_active: true,
      },
      select: ["discount_code", "discount_name"],
      model: discount,
    });
    return discounts;
  }

  /*
    Apply discount code
  */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount not exits!");

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active)
      throw new BadRequestError("Discount code has expired!");
    if (!discount_max_uses) throw new BadRequestError("Discount are out!");
    console.log(
      "discount_start_date: ",
      new Date() < new Date(discount_start_date)
    );
    console.log(
      "discount_end_date: ",
      new Date() > new Date(discount_end_date)
    );
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError("Discount code has expired!");
    }

    // check xem co gia tri toi thieu hay khong?
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `Minimum order value is ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const useUserDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (useUserDiscount) {
        // ....
      }
    }

    // check xem discount nay la fixed_amount
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }
  /*
    Delete discount code
  */
  static async deleteDiscountCode({ codeId, shopId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: shopId,
    });
    return deleted;
  }

  /*
    Cancel discount code
  */
  static async cancelDiscountCode({ codeId, userId, shopId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: shopId,
      },
    });
    if (!foundDiscount) throw new NotFoundError("Discount not exits!");

    const result = await discount.findOneAndUpdate(foundDiscount._id, {
      $pull: { discount_users_used: userId },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
