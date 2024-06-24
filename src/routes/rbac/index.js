"use strict";

const express = require("express");
const {
  newRole,
  newResource,
  listRoles,
  listResources,
} = require("../../controllers/rbac.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");

const router = express.Router();

router.post("/role", asyncHandler(newRole));
router.get("/roles", asyncHandler(listRoles));

router.post("/resource", asyncHandler(newResource));
router.get("/resources", asyncHandler(listResources));

module.exports = router;
