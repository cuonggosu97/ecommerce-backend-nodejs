"use strict";

const express = require("express");

const { asyncHandler } = require("../../helpers/asyncHandler");
const { newUser } = require("../../controllers/user.controller");

const router = express.Router();

router.post("/new-user", asyncHandler(newUser));

module.exports = router;
