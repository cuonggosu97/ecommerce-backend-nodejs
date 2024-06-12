"use strict";
const cloudinary = require("../configs/cloudinary.config");

// 1. upload from url image
const uploadImageFromUrl = async () => {
  try {
    const urlImage =
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lt7y4lt6ws78e2";
    const folderName = "product/8409",
      newFileName = "testdemo";
    const result = await cloudinary.uploader.upload(urlImage, {
      folder: folderName,
      // public_id: newFileName,
    });
    return result;
  } catch (error) {
    console.error("Error upload image from url: ", error);
  }
};

// 2. upload from image local
const uploadImageFromLocal = async ({ path, folderName = "product/8409" }) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: folderName,
      public_id: "thumb",
    });
    return {
      image_url: result.secure_url,
      shopId: "8409",
      thumb_url: await cloudinary.url(result.public_id, {
        height: 100,
        width: 100,
        format: "jpg",
      }),
    };
  } catch (error) {
    console.error("Error upload image from url: ", error);
  }
};
module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
};
