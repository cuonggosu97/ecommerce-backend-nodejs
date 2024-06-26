"use strict";

const redis = require("redis");
const { promisify } = require("util");
// const redisClient = redis.createClient();

// const pexpire = promisify(redisClient.pexpire).bind(redisClient);
// const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

const { getRedis } = require("../dbs/init.redis");

const { instanceConnect: redisClient } = getRedis();
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 5;
  const expireTime = 3000; // 3s tam lock

  for (let i = 0; i < retryTimes.length; i++) {
    // tao mot key, thang nao nam giu duoc vao thanh toan
    const result = await setnxAsync(key, expireTime);
    console.log("result:::: ", result);
    if (result === 1) {
      // thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });
      if (isReservation.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (key) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(key);
};

module.exports = {
  acquireLock,
  releaseLock,
};
