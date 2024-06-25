"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

const typeOf = (value) => Object.prototype.toString.call(value).slice(8, -1);

const getInfoData = ({ filed = [], object = {} }) => {
  return _.pick(object, filed);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]));
};

const removeUndefinedObject = (object = {}) => {
  Object.keys(object).forEach(
    (key) => object[key] === null && delete object[key]
  );
  return object;
};

const updateNestedObjectParser = (object = {}) => {
  console.log(`[1] object: `, object);
  const final = {};
  Object.keys(object).forEach((key) => {
    if (typeOf(object[key]) === "Object" && !Array.isArray(object[key])) {
      const response = updateNestedObjectParser(object[key]);
      Object.keys(response).forEach((key2) => {
        final[`${key}.${key2}`] = response[key2];
      });
    } else {
      final[key] = object[key];
    }
  });
  console.log(`[2] final: `, final);
  return final;
};

// replacePlaceholder
/// {{last_name}}
const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((key) => {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, "g"), params[key]);
  });
  return template;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongodb,
  replacePlaceholder,
};
