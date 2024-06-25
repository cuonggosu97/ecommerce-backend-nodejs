"use strict";

const TEMPLATE = require("../models/template.model");
const { htmlEmailToken } = require("../utils/tem.html");

const newTemplate = async ({ tem_name, tem_id, tem_html }) => {
  // 1. check template exists in dbs

  // 2. create a new template
  const newTem = await TEMPLATE.create({
    tem_id,
    tem_name, // unique name
    tem_html: htmlEmailToken(),
  });

  return newTem;
};

const getTemplate = async ({ tem_name }) => {
  const template = await TEMPLATE.findOne({ tem_name }).lean();
  return template;
};

module.exports = {
  newTemplate,
  getTemplate,
};
