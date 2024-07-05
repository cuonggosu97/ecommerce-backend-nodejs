"use strict";

const express = require("express");

const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  newUser,
  checkLoginEmailToken,
} = require("../../controllers/user.controller");

const router = express.Router();

router.post("/new-user", asyncHandler(newUser));
router.get("/welcome-back", asyncHandler(checkLoginEmailToken));

module.exports = router;
