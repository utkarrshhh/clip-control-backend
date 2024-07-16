const adminModel = require("../models/adminModel");
const admin = require("../models/adminModel");
const editor = require("../models/editorModel");
const { v4: uuidv4 } = require("uuid");
exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  let user = await admin.findOne({ email });
  if (user) {
    res.json({ msg: "user already exists", success: false });
  } else {
    const token = uuidv4();
    user = new admin({ name, email, password, specialToken: token });
    await user.save();
    console.log("saved successfully");
    res.json({ msg: "user created successfully", success: true });
  }
};

exports.editorSignup = async (req, res) => {
  const { name, email, password, token } = req.body;
  if (token) {
    const user = await adminModel.findOne({ specialToken: token });
    console.log("here 1");
    if (user) {
      console.log("here2");
      const editorUser = new editor({ name, password, email, admin: user._id });
      await editorUser.save();
      await adminModel.findByIdAndUpdate(
        user._id,
        { editor: editorUser._id },
        { new: true }
      );
    } else {
      res.json({ msg: "no such admin", success: false });
    }
    res.json({ msg: "successfully saved the editor", success: true });
  } else {
    res.json({ msg: "no token provided", success: false });
  }
};
