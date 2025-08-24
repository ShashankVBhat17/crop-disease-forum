// backend/models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  image: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

// ✅ use existing model if already compiled
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

module.exports = Post;
