"use strict";

const RESOURCE = require("../models/resource.model");
const ROLE = require("../models/role.model");

/**
 * Create a new resource
 * @param {String} name
 * @param {String} slug
 * @param {String} description
 */
const createResource = async ({
  name = "profile",
  slug = "p00001",
  description = "",
}) => {
  try {
    // 1. Check name or slug exists

    // 2. Create new resource
    const resource = await RESOURCE.create({
      src_name: name,
      src_slug: slug,
      src_description: description,
    });

    return resource;
  } catch (error) {
    return error;
  }
};

const resourceList = async ({
  userId = 0, // admin
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // 1. Check admin ? middleware function

    // 2. get list of resource
    const resources = await RESOURCE.aggregate([
      {
        $project: {
          _id: 0,
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          resourceId: "$_id",
          createdAt: 1,
        },
      },
    ]);
    return resources;
  } catch (error) {
    return error;
  }
};

const createRole = async ({
  name = "shop",
  slug = "s00001",
  description = "extend from shop or user",
  grants = [],
}) => {
  try {
    // 1. check role exists

    // 2. create new role
    const role = ROLE.create({
      rol_name: name,
      rol_slug: slug,
      rol_description: description,
      rol_grants: grants,
    });
    return role;
  } catch (error) {
    return error;
  }
};

const roleList = async ({
  userId = 0, // admin
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // 1. Check admin ? middleware function

    // 2. get list of role
    const roles = await ROLE.aggregate([
      {
        $unwind: "$rol_grants",
      },
      {
        $lookup: {
          from: "Resources",
          localField: "rol_grants.resource",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource",
      },
      {
        $project: {
          role: "$rol_name",
          resource: "$resource.src_name",
          actions: "$rol_grants.actions",
          attributes: "$rol_grants.attributes",
        },
      },
      {
        $unwind: "$actions",
      },
      {
        $project: {
          _id: 0, 
          role: 1,
          resource: 1,
          action: "$actions",
          attributes: 1,
        },
      },
    ]);

    return roles;
  } catch (error) {
    return error;
  }
};

module.exports = {
  createResource,
  resourceList,
  createRole,
  roleList,
};
