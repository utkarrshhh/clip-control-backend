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
  editors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Editor",
    },
  ],
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Admin", adminSchema);
