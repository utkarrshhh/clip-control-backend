const sharp = require("sharp");
const resemble = require("resemblejs");
// const adminImage = require("../models/adminImage"); // Assuming you have an Image model defined in models
const adminImage = require("../models/adminadminImage");
// we will be sending name id and all the detaisl from the frontend for backend to send find() request to database to retrieve the image and then perform the verification process

const compareImagesMiddleware = async (req, res, next) => {
  try {
    // Get uploaded image from frontend
    const { buffer: uploadedImageBuffer } = req.file;

    // Fetch image from MongoDB by ID
    const { imageId } = req.body;
    const dbImage = await adminImage.findById(imageId);
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

// we are getting the percentage comparison of the two images in req.imageComparisonResult
// in the controller we need to check if the %age is > or < than 5 to decide whether the images are same or not
// if not same send res as not same else save the image in editorImageModel and also push the image id to the adminImageModel as well and send the image back to display it on the frontend-- case could be that image is already at the frontend so we might not need to do that we could simply take from the frontend and display in the case of success else displya an error message that images are different and please verify them before uploading
