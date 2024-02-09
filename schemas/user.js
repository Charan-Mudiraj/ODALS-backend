const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  address: String,
  number: String,
  email: String,
  password: String,
  avatar: {
    type: String,
    default: "uploads/unknown-profile.png",
  },
  isExamTaken: {
    type: Boolean,
    default: false,
  },
  examPercentage: {
    type: Number,
    default: 0,
  },
  doi: {
    type: String,
    default: null,
  },
  validity: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
