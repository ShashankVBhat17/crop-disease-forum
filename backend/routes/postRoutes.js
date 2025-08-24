// backend/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Add Post
router.post("/", auth, upload.single("image"), async (req, res) => {
  const { crop, description, tags } = req.body;
  try {
    const post = new Post({
      crop,
      description,
      tags: tags ? tags.split(",") : [],
      image: req.file ? req.file.path : null,
      userId: req.user.id
    });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("❌ Error adding post:", err.message);
    res.status(500).send("Server Error");
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    // ✅ safer populate (checks if User has 'name', else won't break)
    const posts = await Post.find()
      .populate("userId", "name email") // include name + email from User
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.status(500).send("Server Error");
  }
});

// Like/Unlike Post
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id); // like
    } else {
      post.likes.splice(index, 1); // unlike
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("❌ Error liking post:", err.message);
    res.status(500).send("Server Error");
  }
});

// Delete Post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error("❌ Error deleting post:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
