// routes/images.js
const express = require("express");
const multer = require("multer");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Multer sozlamalari (uploads papkaga fayl saqlash)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Rasm yuklash
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  const userId = req.user.id;
  if (!req.file)
    return res.status(400).json({ message: "Image file is required" });

  const filePath = req.file.path;

  try {
    const newImage = await pool.query(
      "INSERT INTO images (user_id, image_url, uploaded_at) VALUES ($1, $2, NOW()) RETURNING *",
      [userId, filePath]
    );
    res.status(201).json(newImage.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// O‘zining rasmni o‘chirish
router.delete("/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const imageId = req.params.id;

  try {
    const image = await pool.query(
      "SELECT * FROM images WHERE id=$1 AND user_id=$2",
      [imageId, userId]
    );
    if (image.rows.length === 0) {
      return res.status(403).json({ message: "Not allowed to delete this image" });
    }

    // Faylni diskdan o‘chirish
    const filePath = image.rows[0].image_url;
    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete error:", err);
    });

    await pool.query("DELETE FROM images WHERE id=$1", [imageId]);
    res.json({ message: "Image deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Rasm va unga tegishli like, commentlarni olish
router.get("/", authenticateToken, async (req, res) => {
  try {
    const images = await pool.query(
      `SELECT i.*, u.username,
      (SELECT COUNT(*) FROM likes l WHERE l.image_id = i.id) as likes_count,
      (SELECT json_agg(json_build_object(
          'id', c.id,
          'user_id', c.user_id,
          'username', cu.username,
          'text', c.text,
          'created_at', c.created_at,
          'likes_count', (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id)
        ))
       FROM comments c
       JOIN users cu ON c.user_id = cu.id
       WHERE c.image_id = i.id) as comments
      FROM images i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.uploaded_at DESC`
    );
    res.json(images.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Rasmga like bosish yoki olib tashlash
router.post("/:id/like", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const imageId = req.params.id;

  try {
    const existingLike = await pool.query(
      "SELECT * FROM likes WHERE user_id=$1 AND image_id=$2",
      [userId, imageId]
    );
    if (existingLike.rows.length > 0) {
      await pool.query("DELETE FROM likes WHERE user_id=$1 AND image_id=$2", [userId, imageId]);
      return res.json({ message: "Like removed" });
    } else {
      await pool.query("INSERT INTO likes (user_id, image_id) VALUES ($1, $2)", [userId, imageId]);
      return res.json({ message: "Like added" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
