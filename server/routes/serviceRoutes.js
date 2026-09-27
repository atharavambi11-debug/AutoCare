// server/routes/serviceRoutes.js
// Purpose: Service route definitions

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// Import middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ============================================
// Public Routes
// ============================================

// GET /api/services - Get all services (with optional search/filter)
router.get("/", getAllServices);

// GET /api/services/:id - Get single service
router.get("/:id", getServiceById);

// ============================================
// Admin Only Routes
// ============================================

// POST /api/services - Create new service
router.post("/", protect, adminOnly, createService);

// PUT /api/services/:id - Update service
router.put("/:id", protect, adminOnly, updateService);

// DELETE /api/services/:id - Delete service
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;