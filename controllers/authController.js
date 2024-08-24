const adminModel = require("../models/adminModel");
const admin = require("../models/adminModel");
const editor = require("../models/editorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const { v4: uuidv4 } = require("uuid");
const { sendVerificationEmail } = require("./nodeMailer");
const adminImageModel = require("../models/adminImageModel");
const editorModel = require("../models/editorModel");
const editorImageModel = require("../models/editorImageModel");

const nodeCache = new NodeCache();

exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  let user = await admin.findOne({ email });
  if (user) {
    res.json({ msg: "user already exists", success: false });
  } else {
    try {
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
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: "server error", success: false });
    }
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
    res.json({
      msg: "successfully saved the editor",
      success: true,
      role: "editor",
    });
  } else {
    res.json({ msg: "no token provided", success: false });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ msg: "Fill all entries", success: false });
    }

    const user = await adminModel.findOne({ email });

    if (!user) {
      return res.json({ msg: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const payload = {
        name: user.name,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      console.log(token);
      return res.json({
        msg: "Logged in successfully",
        success: true,
        token: token,
        role: "admin",
        user,
      });
    } else {
      return res.json({ msg: "Wrong password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", success: false });
  }
};

exports.editorLogin = async (req, res) => {
  //editor login code
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({ msg: "fill all entries", success: false });
  }
  const user = await editorModel.findOne({ email });
  if (!user) {
    console.log(user);
    res.json({ msg: "user not found", success: false });
  } else {
    // const isMatch = await bcrypt.compare(user.password, password);
    // const isMatch = user.password === password;

    const isMatch = await bcrypt.compare(password, user.password);
    let token = "";
    if (isMatch) {
      const payload = {
        name: user.name,
        email: user.email,
      };
      token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      res.json({
        msg: "logged in successfully",
        success: true,
        token,
        role: "editor",
        user,
      });
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

exports.uploadMedia = async (req, res) => {
  const { title, tags, category, description, role } = req.body;
  let userRef = req.user;
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded.", success: false });
    }

    const {
      buffer: fileBuffer,
      originalname: originalName,
      mimetype: mimeType,
      size: fileSize,
    } = req.file;
    console.log(
      `Received file: ${originalName}, type: ${mimeType}, size: ${fileSize}`
    );

    const base64Image = fileBuffer.toString("base64");
    let userRef2 = "";
    try {
      if (role === "admin") {
        userRef2 = await adminModel.findOne({ email: userRef.email });
        if (!userRef2) {
          return res.json({
            msg: "User not found, Signup to continue",
            success: false,
          });
        }
        const newImage = new adminImageModel({
          title,
          tags,
          description,
          category,
          image: base64Image,
          user: userRef2._id,
        });
        await newImage.save();

        await adminModel.findOneAndUpdate(
          { email: userRef.email },
          {
            $push: { imageUpload: newImage._id },
          },
          { new: true } // Optional: returns the updated document
        );
      } else {
        userRef2 = await editorModel.findOne({ email: userRef.email });
        if (!userRef2) {
          return res.json({
            msg: "User not found, Signup to continue",
            success: false,
          });
        }
        const newImage = new editorImageModel({
          title,
          tags,
          description,
          category,
          image: base64Image,
          user: userRef2._id,
        });
        await newImage.save();
        await editorModel.findOneAndUpdate(
          { email: userRef.email },
          {
            $push: { imageUpload: newImage._id },
          },
          { new: true } // Optional: returns the updated document
        );
      }
      console.log(userRef);
      nodeCache.del("finalResult");
      res.json({ message: "File uploaded successfully.", success: true });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        msg: "Internal server error",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error in uploading file:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.getImages = async (req, res) => {
  try {
    let finalResult = [];
    if (nodeCache.has("finalResult")) {
      // Corrected to "finalResult" to match the cache key
      finalResult = JSON.parse(nodeCache.get("finalResult"));
    } else {
      const images = await adminImageModel.find();
      const editorImages = await editorImageModel.find();
      console.log(images.length + " " + editorImages.length);

      finalResult = [...images, ...editorImages];
      // Corrected to "finalResult" to match the cache key
      nodeCache.set("finalResult", JSON.stringify(finalResult));
    }

    res.json({ finalResult, success: true });
  } catch (e) {
    console.error("Error in getting images:", e);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.uploadEdited = async (req, res) => {
  if (req.imageComparisonResult > 10) {
    res.json({
      message: "Please verify and upload image again",
      success: false,
    });
  } else {
    const { title, description, role, imageId } = req.body;
    const visible = false;
    try {
      const {
        buffer: fileBuffer,
        originalname: originalName,
        mimetype: mimeType,
        size: fileSize,
      } = req.file;
      console.log(
        `Received file: ${originalName}, type: ${mimeType}, size: ${fileSize}`
      );

      const base64Image = fileBuffer.toString("base64");
      const user = new editorImageModel({
        title,
        description,
        role,
        image: base64Image,
        visible,
        adminImageId: imageId,
      });
      await user.save();
      await adminImageModel.findOneAndUpdate(
        {
          $push: { editedImage: user._id },
        },
        { new: true } // Optional: returns the updated document
      );
    } catch (e) {
      res.json({ message: "Internal Server Error", success: false });
    }
  }
};
