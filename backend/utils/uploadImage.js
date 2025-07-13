const cloudinary = require("../cloudinary");
const path = require("path");

const uploadImage = async () => {
  try {
    const result = await cloudinary.uploader.upload(
      path.join(__dirname, "Blue_Curaco_Mojito.jpg"), // local path
      {
        folder: "fruit_shop", // optional: folder in your Cloudinary account
      }
    );


  } catch (err) {
    // Upload failed
    throw new Error("Image upload failed")
  }
};

uploadImage(); 