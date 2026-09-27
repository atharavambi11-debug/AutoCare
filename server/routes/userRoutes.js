// server/routes/userRoutes.js
// Purpose: User management route definitions (Admin only)

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardStats,
} = require("../controllers/userController");

// Import middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All user management routes are admin-only
// Apply protect and adminOnly middleware to all routes in this file

// GET /api/users/dashboard-stats - Get admin dashboard statistics
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);

// GET /api/users - Get all users
router.get("/", protect, adminOnly, getAllUsers);

// GET /api/users/:id - Get single user
router.get("/:id", protect, adminOnly, getUserById);

// DELETE /api/users/:id - Delete a user
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;