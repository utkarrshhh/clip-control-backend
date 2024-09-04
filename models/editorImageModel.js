const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: { type: String },
  description: { type: String },
  category: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "editor" },
  visible: { type: Boolean, default: true },
  adminImageId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  uploaderName: { type: String, required: true },
});

module.exports = mongoose.model("editorImage", imageSchema);
