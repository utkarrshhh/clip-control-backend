const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  specialToken: {
    type: String,
    required: true,
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Editor",
    // required: true,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
