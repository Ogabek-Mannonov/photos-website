// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (userExists.rows.length > 0)
      return res.status(409).json({ message: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User created", user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (user.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPass)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
