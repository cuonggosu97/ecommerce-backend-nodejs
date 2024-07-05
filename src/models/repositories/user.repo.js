"use strict";

const USER = require("../user.model");

const createUser = ({
  usr_id,
  usr_email,
  usr_slug,
  usr_password,
  usr_role,
}) => {
  const user = USER.create({
    usr_id,
    usr_email,
    usr_slug,
    usr_password,
    usr_role,
  });

  return user;
};

module.exports = {
  createUser,
};
