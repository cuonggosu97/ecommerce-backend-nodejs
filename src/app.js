require("dotenv").config();
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const app = express();
const { v4: uuidv4 } = require("uuid");
const myLogger = require("./loggers/mylogger.log");

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;
  myLogger.log(`input params ::${req.method}::`, [
    req.path,
    { requestId: requestId },
    req.method === "GET" ? req.query : req.body,
  ]);
  next();
});

// test pub.sub redis
// require("./test/inventory.test");
// const productTest = require("./test/product.test");
// productTest.purchaseProduct("product:001", 10);
// init db
require("./dbs/init.mongodb");
const initRedis = require("./dbs/init.redis");
initRedis.initRedis();
// const { checkOverLoad } = require("./helpers/check.connect");
// checkOverLoad();
// init routes
app.use("/", require("./routes"));

// handle error

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.status || 500;

  const resMessage = `${error.status} - ${
    Date.now() - error.now
  }ms - Response ${JSON.stringify(error)}`;

  myLogger.error(resMessage, [
    req.path,
    { requestId: req.requestId },
    { message: error.message },
  ]);

  return res.status(status).json({
    error: {
      status: "error",
      message: error.message,
      code: status,
    },
  });
});

module.exports = app;
