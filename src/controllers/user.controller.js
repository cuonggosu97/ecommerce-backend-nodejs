"use strict";

const { SuccessResponse } = require("../core/success.response");
const { newUserService } = require("../services/user.service");

class UserController {
  // new user
  newUser = async (req, res) => {
    const response = await newUserService({
      email: req.body.email,
    });
    new SuccessResponse(response).send(res);
  };

  // check user token via email
  checkRegisterEmailToken = async (req, res) => {
    // code
  };
}

module.exports = new UserController();
