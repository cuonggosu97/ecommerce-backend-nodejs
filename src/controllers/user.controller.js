"use strict";

const { SuccessResponse } = require("../core/success.response");
const {
  newUserService,
  checkLoginEmailTokenService,
} = require("../services/user.service");

class UserController {
  // new user
  newUser = async (req, res) => {
    const response = await newUserService({
      email: req.body.email,
    });
    new SuccessResponse(response).send(res);
  };

  // check user token via email
  checkLoginEmailToken = async (req, res, next) => {
    const { token } = req.query;
    const response = await checkLoginEmailTokenService({
      token,
    });
    new SuccessResponse(response).send(res);
  };
}

module.exports = new UserController();
