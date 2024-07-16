const mongoose = require("mongoose");

const editorShema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
});

module.exports = mongoose.model("Editor", editorShema);
