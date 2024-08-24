const sharp = require("sharp");
const resemble = require("resemblejs");
// const ImageModel = require("../models/ImageModel"); // Assuming you have an Image model defined in models

// we will be sending name id and all the detaisl from the frontend for backend to send find() request to database to retrieve the image and then perform the verification process

const compareImagesMiddleware = async (req, res, next) => {
  try {
    // Get uploaded image from frontend
    const { buffer: uploadedImageBuffer } = req.file;

    // Fetch image from MongoDB by ID
    const { imageId } = req.body;
    const dbImage = await ImageModel.findById(imageId);
    if (!dbImage) {
      return res.status(404).json({ message: "Image not found in database" });
    }

    // Convert both images to grayscale and resize to the same dimensions
    const resizeOptions = { width: 256, height: 256 };
    const processedUploadedImg = await sharp(uploadedImageBuffer)
      .resize(resizeOptions)
      .grayscale()
      .toBuffer();

    const processedDbImg = await sharp(dbImage.imageBuffer)
      .resize(resizeOptions)
      .grayscale()
      .toBuffer();

    // Use Resemble.js to compare the images
    resemble(processedUploadedImg)
      .compareTo(processedDbImg)
      .onComplete((data) => {
        req.imageComparisonResult = data;
        next();
      });
  } catch (error) {
    next(error);
  }
};

module.exports = compareImagesMiddleware;
