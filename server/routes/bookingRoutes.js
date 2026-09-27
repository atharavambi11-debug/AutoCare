// server/routes/bookingRoutes.js
// Purpose: Booking route definitions

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByEmail,
} = require("../controllers/bookingController");

// Import middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ============================================
// Public Routes
// ============================================

// POST /api/bookings - Create a booking (public, optionally authenticated)
// Using a middleware that optionally attaches user if token exists
router.post("/", optionalAuth, createBooking);

// GET /api/bookings/track/:email - Track bookings by email
router.get("/track/:email", getBookingsByEmail);

// ============================================
// Private Routes (Logged in users)
// ============================================

// GET /api/bookings - Get bookings (admin: all, customer: own)
router.get("/", protect, getAllBookings);

// GET /api/bookings/:id - Get single booking
router.get("/:id", protect, getBookingById);

// PUT /api/bookings/:id - Update booking (admin only)
router.put("/:id", protect, adminOnly, updateBooking);

// DELETE /api/bookings/:id - Delete booking (admin only)
router.delete("/:id", protect, adminOnly, deleteBooking);

// ============================================
// Optional Auth Middleware
// Attaches user if token present, but doesn't block if no token
// ============================================
function optionalAuth(req, res, next) {
  const jwt = require("jsonwebtoken");
  const User = require("../models/User");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      User.findById(decoded.id)
        .select("-password")
        .then((user) => {
          req.user = user;
          next();
        })
        .catch(() => next()); // If user not found, continue without user
    } catch (error) {
      next(); // Token invalid, continue without user
    }
  } else {
    next(); // No token, continue without user
  }
}

module.exports = router;