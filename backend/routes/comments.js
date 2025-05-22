// routes/comments.js
const express = require("express");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Comment qo‘yish
router.post("/:imageId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const imageId = req.params.imageId;
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Comment text required" });

  try {
    const newComment = await pool.query(
      "INSERT INTO comments (user_id, image_id, text, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [userId, imageId, text]
    );
    res.status(201).json(newComment.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Commentga like bosish yoki olib tashlash
router.post("/:id/like", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;

  try {
    const existingLike = await pool.query(
      "SELECT * FROM comment_likes WHERE user_id=$1 AND comment_id=$2",
      [userId, commentId]
    );
    if (existingLike.rows.length > 0) {
      await pool.query("DELETE FROM comment_likes WHERE user_id=$1 AND comment_id=$2", [
        userId,
        commentId,
      ]);
      return res.json({ message: "Comment like removed" });
    } else {
      await pool.query("INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)", [
        userId,
        commentId,
      ]);
      return res.json({ message: "Comment like added" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
