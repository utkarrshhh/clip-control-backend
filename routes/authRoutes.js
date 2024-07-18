const express = require("express");
const {
  adminSignup,
  editorSignup,
  adminLogin,
  editorLogin,
  confirmEmail,
} = require("../controllers/authController");
const router = express.Router();

router.post("/adminSignup", adminSignup);
router.post("/editorSignup", editorSignup);
router.post("/adminLogin", adminLogin);
router.post("/editorLogin", editorLogin);
router.get("/confirm/:token", confirmEmail);

module.exports = router;
