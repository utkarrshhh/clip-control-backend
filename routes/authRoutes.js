const express = require("express");
const {
  adminSignup,
  editorSignup,
  adminLogin,
  editorLogin,
  confirmEmail,
  uploadMedia,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/VerifyToken");
const multer = require("multer");

// Set up memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize router
const router = express.Router();

// Define routes
router.post("/adminSignup", adminSignup);
router.post("/editorSignup", editorSignup);
router.post("/adminLogin", adminLogin);
router.post("/editorLogin", editorLogin);
router.get("/confirm/:token", confirmEmail);
router.post("/upload", verifyToken, upload.single("image"), uploadMedia);

module.exports = router;
