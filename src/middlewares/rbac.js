"use strict";

const { AuthFailureError } = require("../core/error.response");
const { roleList } = require("../services/rbac.service");
const rbac = require("./role.middleware");
/**
 *
 * @param {string} action // read, delete or update
 * @param {*} resource // profile, balance,...
 */
const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      rbac.setGrants(await roleList({}));
      const rol_name = req.query.role;
      const permission = rbac.can(rol_name)[action](resource);
      console.log("permission___: ", permission.granted);
      if (!permission.granted) {
        throw new AuthFailureError("You don't have permission");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { grantAccess };
