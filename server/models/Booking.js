// server/models/Booking.js
// Purpose: Define Booking schema for service appointments

const mongoose = require("mongoose");

/**
 * Booking Schema
 * Represents a service appointment booked by a customer
 */
const bookingSchema = new mongoose.Schema(
  {
    // Customer information
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true, // Ensure unique email addresses
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true, // Ensure unique phone numbers
    },

    // Vehicle information
    vehicleBrand: {
      type: String,
      required: [true, "Vehicle brand is required"],
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true,
      uppercase: true, // Always store in uppercase
    },

    fuelType: {
      type: String,
      required: [true, "Fuel type is required"],
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"],
    },

    // Service being booked (references Service model)
    service: {
      type: String,
      required: [true, "Service is required"],
    },

    // Reference to the user who made the booking (optional - guests can book)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Appointment details
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },

    bookingTime: {
      type: String,
      required: [true, "Booking time is required"],
    },

    // Customer's address for pickup/delivery
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // Additional notes from customer
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },

    // Booking status - follows a workflow
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Mechanic Assigned",
        "In Progress",
        "Completed",
        "Delivered",
      ],
      default: "Pending",
    },

    // Assigned mechanic name (set by admin)
    mechanicName: {
      type: String,
      default: "",
    },

    // Total amount (can be set by admin)
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export the Booking model
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;