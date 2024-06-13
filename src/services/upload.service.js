"use strict";
const crypto = require("crypto");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer"); // CJS

const cloudinary = require("../configs/cloudinary.config");
const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteBucketCommand,
} = require("../configs/s3.config");

const randomImageName = () => crypto.randomBytes(16).toString("hex");

// upload file use S3Client
// 4. upload from image local
const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const imageName = randomImageName();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
      Body: file.buffer,
      ContentType: "image/jpeg", // that is what you need
    });

    const result = await s3.send(command);
    console.log("result: ", result);

    // export url
    // const singedUrl = new GetObjectCommand({
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   Key: imageName,
    // });
    // const url = await getSignedUrl(s3, singedUrl, { expiresIn: 3600 });

    // have cloudfront url export
    const url = getSignedUrl({
      url: `${process.env.AWS_CLOUDFRONT_DOMAIN}/${imageName}`,
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
      dateLessThan: new Date(Date.now() + 60 * 1000),
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
    });
    console.log("url: ", url);

    return { url, result };
  } catch (error) {
    console.error("Error upload image use S3Client: ", error);
  }
};

// end s3 service

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

// 3. upload from image local
const uploadImageFromLocalFiles = async ({
  files,
  folderName = "product/8409",
}) => {
  try {
    if (!files.length) return;
    const uploadedUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderName,
      });

      uploadedUrls.push({
        image_url: result.secure_url,
        shopId: "8409",
        thumb_url: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          format: "jpg",
        }),
      });
    }

    return uploadedUrls;
  } catch (error) {
    console.error("Error upload image from url: ", error);
  }
};

module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
  uploadImageFromLocalFiles,
  uploadImageFromLocalS3,
};
