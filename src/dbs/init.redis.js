"use strict";

const redis = require("redis");
const { RedisErrorResponse } = require("../core/error.response");

let client = {},
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
    console.log("ConnectionRedis - Connection status: connected");
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log("ConnectionRedis - Connection status: disconnected");
    // connect retry
    handleTimeoutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECTING, () => {
    console.log("ConnectionRedis - Connection status: connecting");
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log("ConnectionRedis - Connection status: error ", err);
    // connect retry
    handleTimeoutError();
  });
};

const initRedis = () => {
  const instanceRedis = redis.createClient();
  client.instanceConnect = instanceRedis;
  handleEventConnection({
    connectionRedis: instanceRedis,
  });
};

const getRedis = () => client;

const closeRedis = () => {};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
