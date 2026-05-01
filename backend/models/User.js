const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiresAt: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);
