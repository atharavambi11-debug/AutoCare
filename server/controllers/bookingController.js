// server/controllers/bookingController.js
// Purpose: Handle all booking-related operations

const Booking = require("../models/Booking");

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Public (logged in users and guests)
 */
const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      vehicleBrand,
      vehicleModel,
      registrationNumber,
      fuelType,
      service,
      bookingDate,
      bookingTime,
      address,
      notes,
    } = req.body;

    // Validate all required fields
    if (
      !customerName ||
      !email ||
      !phone ||
      !vehicleBrand ||
      !vehicleModel ||
      !registrationNumber ||
      !fuelType ||
      !service ||
      !bookingDate ||
      !bookingTime ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Validate that booking date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of today

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date cannot be in the past",
      });
    }

    // Create the booking
    const booking = await Booking.create({
      customerName,
      email: email.toLowerCase(),
      phone,
      vehicleBrand,
      vehicleModel,
      registrationNumber,
      fuelType,
      service,
      bookingDate,
      bookingTime,
      address,
      notes: notes || "",
      status: "Pending",
      // If user is logged in, attach their ID
      userId: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully! We will confirm shortly.",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating booking",
    });
  }
};

/**
 * @desc    Get all bookings (Admin) or user's bookings (Customer)
 * @route   GET /api/bookings
 * @access  Private
 */
const getAllBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "admin") {
      // Admins see ALL bookings, newest first
      bookings = await Booking.find({}).sort({ createdAt: -1 });
    } else {
      // Customers see only THEIR bookings by email
      bookings = await Booking.find({
        email: req.user.email,
      }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching bookings",
    });
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Customers can only view their own bookings
    if (
      req.user.role !== "admin" &&
      booking.email !== req.user.email
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get Booking Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching booking",
    });
  }
};

/**
 * @desc    Update booking (Admin updates status, mechanic, amount)
 * @route   PUT /api/bookings/:id
 * @access  Private/Admin
 */
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Validate status if provided
    const validStatuses = [
      "Pending",
      "Confirmed",
      "Mechanic Assigned",
      "In Progress",
      "Completed",
      "Delivered",
    ];

    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update Booking Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating booking",
    });
  }
};

/**
 * @desc    Delete a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting booking",
    });
  }
};

/**
 * @desc    Get bookings by email (for guest users to track)
 * @route   GET /api/bookings/track/:email
 * @access  Public
 */
const getBookingsByEmail = async (req, res) => {
  try {
    const bookings = await Booking.find({
      email: req.params.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Track Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error tracking bookings",
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByEmail,
};