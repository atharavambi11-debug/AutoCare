// server/routes/authRoutes.js
// Purpose: Authentication route definitions
//
// NOTE: I don't have your actual authRoutes.js, so this is reconstructed
// from what authController.js exports. If your real file has different
// route paths or extra middleware, merge this logout route into it rather
// than replacing the whole file.

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout — NEW. Clears the httpOnly cookie server-side,
// since the frontend can no longer delete it directly.
router.post("/logout", protect, logout);

// GET /api/auth/profile — also doubles as the "am I logged in?" check
// the frontend calls once on page load.
router.get("/profile", protect, getProfile);

// PUT /api/auth/profile
router.put("/profile", protect, updateProfile);

module.exports = router;