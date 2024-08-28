const Jimp = require("jimp");
const pixelmatch = require("pixelmatch");
const adminImage = require("../models/adminImage");

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

    const [uploadedImg, dbImg] = await Promise.all([
      Jimp.read(uploadedImageBuffer),
      Jimp.read(dbImage.imageBuffer),
    ]);

    uploadedImg.resize(resizeOptions.width, resizeOptions.height).greyscale();
    dbImg.resize(resizeOptions.width, resizeOptions.height).greyscale();

    // Convert images to raw pixel data
    const uploadedImgData = uploadedImg.bitmap.data;
    const dbImgData = dbImg.bitmap.data;

    // Compare the images using pixelmatch
    const { width, height } = uploadedImg.bitmap;
    const diff = new Uint8Array(width * height * 4);
    const numDiffPixels = pixelmatch(
      uploadedImgData,
      dbImgData,
      diff,
      width,
      height,
      { threshold: 0.1 }
    );

    req.imageComparisonResult = {
      isSameDimensions:
        width === dbImg.bitmap.width && height === dbImg.bitmap.height,
      rawMisMatchPercentage: numDiffPixels,
      diffImage: Jimp.create(width, height)
        .then((diffImage) => {
          return diffImage.bitmap.data.set(diff);
        })
        .then((diffImage) => diffImage.getBufferAsync(Jimp.MIME_PNG)),
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = compareImagesMiddleware;
