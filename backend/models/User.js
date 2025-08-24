// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// ✅ Fix OverwriteModelError by reusing existing model
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
