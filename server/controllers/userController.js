// server/controllers/userController.js
// Purpose: Admin user management - view and delete users

const User = require("../models/User");
const Booking = require("../models/Booking");

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    // Get all users excluding passwords, sorted by registration date
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

/**
 * @desc    Get a single user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};

/**
 * @desc    Delete a user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};

/**
 * @desc    Get dashboard stats for admin
 * @route   GET /api/users/dashboard-stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for efficiency
    const [
      totalUsers,
      totalBookings,
      pendingBookings,
      completedBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Pending" }),
      Booking.countDocuments({ status: "Completed" }),
    ]);

    // Get recent 5 bookings
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        pendingBookings,
        completedBookings,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard stats",
    });
  }
};

module.exports = { getAllUsers, getUserById, deleteUser, getDashboardStats };