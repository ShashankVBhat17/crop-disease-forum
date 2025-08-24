const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");

// Add Comment
router.post("/:postId", auth, async (req, res) => {
  try {
    const comment = new Comment({
      postId: req.params.postId,
      userId: req.user.id,
      text: req.body.text
    });
    await comment.save();
    res.json(comment);
  } catch (err) { res.status(500).send("Server Error"); }
});

// Reply to a comment
router.post("/reply/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if(!comment) return res.status(404).json({ msg: "Comment not found" });
    
    comment.replies.push({
      userId: req.user.id,
      text: req.body.text
    });
    await comment.save();
    res.json(comment);
  } catch (err) { res.status(500).send("Server Error"); }
});

// Get Comments by Post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "name")
      .populate("replies.userId", "name")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).send("Server Error"); }
});

// Delete Comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.userId.toString() !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });
    await comment.remove();
    res.json({ msg: "Comment removed" });
  } catch (err) { res.status(500).send("Server Error"); }
});

module.exports = router;
