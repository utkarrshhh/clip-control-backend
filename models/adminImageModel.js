const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: { type: String },
  description: { type: String },
  category: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  editedImage: [{ type: mongoose.Schema.Types.ObjectId, ref: "editorImage" }],
  uploaderName: { type: String, required: true },
});

module.exports = mongoose.model("Image", imageSchema);
