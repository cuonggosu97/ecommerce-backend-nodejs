"use strict";
const { SuccessResponse } = require("../core/success.response");
const {
  createResource,
  createRole,
  resourceList,
  roleList,
} = require("../services/rbac.service");

/**
 * @desc Create a new role
 * @param {String} name
 * @param {*} res
 * @param {*} next
 */
const newRole = async (req, res, next) => {
  new SuccessResponse({
    message: "Role created successfully",
    metadata: await createRole(req.body),
  }).send(res);
};

const newResource = async (req, res, next) => {
  new SuccessResponse({
    message: "Resource created successfully",
    metadata: await createResource(req.body),
  }).send(res);
};

const listRoles = async (req, res, next) => {
  new SuccessResponse({
    message: "Get list role successfully",
    metadata: await roleList(req.query),
  }).send(res);
};

const listResources = async (req, res, next) => {
  new SuccessResponse({
    message: "Get list resource successfully",
    metadata: await resourceList(req.query),
  }).send(res);
};

module.exports = {
  newRole,
  newResource,
  listRoles,
  listResources,
};
