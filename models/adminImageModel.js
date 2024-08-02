const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: { type: String },
  description: { type: String },
  category: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

module.exports = mongoose.model("Image", imageSchema);
