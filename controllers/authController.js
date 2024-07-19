const adminModel = require("../models/adminModel");
const admin = require("../models/adminModel");
const editor = require("../models/editorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { v4: uuidv4 } = require("uuid");
const { sendVerificationEmail } = require("./nodeMailer");
exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  let user = await admin.findOne({ email });
  if (user) {
    res.json({ msg: "user already exists", success: false });
  } else {
    const token = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    user = new admin({
      name,
      email,
      password: newPassword,
      specialToken: token,
    });
    await user.save();
    console.log("saved successfully");
    const tokenVerify = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log(tokenVerify);
    sendVerificationEmail(email, tokenVerify);

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
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);

      const editorUser = new editor({
        name,
        password: newPassword,
        email,
        admin: user._id,
      });
      await editorUser.save();
      await adminModel.findByIdAndUpdate(
        user._id,
        {
          $push: { editors: editorUser._id },
        },
        { new: true } // Optional: returns the updated document
      );
      console.log("here3");
    } else {
      res.json({ msg: "no such admin", success: false });
    }
    res.json({ msg: "successfully saved the editor", success: true });
  } else {
    res.json({ msg: "no token provided", success: false });
  }
};

exports.adminLogin = async (req, res) => {
  //admin login code
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.json({ msg: "fill all entries", success: false });
  }
  const user = await adminModel.findOne({ email });
  if (!user) {
    res.json({ msg: "user not found", success: false });
  } else {
    // const isMatch = await bcrypt.compare(user.password, password);
    let token = "";
    const isMatch = user.password === password;
    if (isMatch) {
      const payload = {
        name: user.name,
        email: user.email,
      };
      token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      console.log(token);
      res.json({
        msg: "logged in very successfully",
        success: true,
        token: token,
      });
    } else {
      res.json({ msg: "wrong password", success: false });
    }
  }
};

exports.editorLogin = async (req, res) => {
  //editor login code
  const { email, password, role } = req.body;
  if (!email || !password) {
    res.json({ msg: "fill all entries", success: false });
  }
  const user = await editor.findOne({ email });
  if (!user) {
    res.json({ msg: "user not found", success: false });
  } else {
    // const isMatch = await bcrypt.compare(user.password, password);
    const isMatch = user.password === password;
    let token = "";
    if (isMatch) {
      const payload = {
        name: user.name,
        email: user.email,
      };
      token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      res.json({ msg: "logged in successfully", success: true, token });
    } else {
      res.json({ msg: "wrong password", success: false });
    }
  }
};

exports.confirmEmail = async (req, res) => {
  const token = req.params.token;

  try {
    console.log(`Received token: ${token}`);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token successfully verified.");

    let user = await admin.findById(decoded.id);
    if (user) {
      user.verified = true;
      await user.save();
      console.log("Admin user verified successfully.");
      return res.send("go to login page again to log in ");
      // return res.redirect("/adminLogin");
    }

    user = await editor.findById(decoded.id);
    if (user) {
      user.verified = true;
      await user.save();
      console.log("Editor user verified successfully.");
      return res.redirect("/editorLogin");
    }

    console.log("No user found for the provided token.");
    return res.json({ msg: "Invalid token", success: false });
  } catch (e) {
    console.log("Error during verification:", e.message);
    return res.json({ msg: "Error during verification", success: false });
  }
};
