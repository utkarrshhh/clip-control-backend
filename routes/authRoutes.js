const express = require("express");
const { adminSignup, editorSignup } = require("../controllers/authController");
const router = express.Router();

router.post("/adminSignup", adminSignup);
router.post("/editorSignup", editorSignup);

module.exports = router;
