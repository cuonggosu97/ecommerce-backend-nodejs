"use strict";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "deaianw8t",
  api_key: "126951247526851",
  api_secret: "FsaOW3DD58pJdaWCVtuNmLU2kzg",
});

module.exports = cloudinary;
