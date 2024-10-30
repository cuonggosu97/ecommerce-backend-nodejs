"use strict";

const Redis = require("ioredis");
const { RedisErrorResponse } = require("../core/error.response");

let clients = {},
  statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECTING: "reconnecting",
    ERROR: "error",
  },
  connectionTimeout = null;

const REDIS_CONNECT_TIMEOUT = 10000,
  REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
      vi: "Kết nối Redis timeout",
      en: "Redis connection timeout",
    },
  };

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vi,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = ({ connectionRedis }) => {
  // check if connection is null
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log("ConnectionIORedis - Connection status: connected");
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log("ConnectionIORedis - Connection status: disconnected");
    // connect retry
    handleTimeoutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECTING, () => {
    console.log("ConnectionIORedis - Connection status: connecting");
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log("ConnectionIORedis - Connection status: error ", err);
    // connect retry
    handleTimeoutError();
  });
};

const init = ({
  IOREDIS_IS_ENABLE,
  IOREDIS_HOST = process.env.REDIS_CACHE_HOST,
  IOREDIS_PORT = process.env.REDIS_CACHE_PORT,
}) => {
  if (IOREDIS_IS_ENABLE) {
    const instanceRedis = new Redis({
      host: IOREDIS_HOST,
      port: IOREDIS_PORT,
    });
    clients.instanceConnect = instanceRedis;
    handleEventConnection({
      connectionRedis: instanceRedis,
    });
  }
};

const getIORedis = () => clients;

const closeIORedis = () => {};

module.exports = {
  init,
  getIORedis,
  closeIORedis,
};
