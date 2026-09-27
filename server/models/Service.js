// server/models/Service.js
// Purpose: Define Service schema for car services offered

const mongoose = require("mongoose");

/**
 * Service Schema
 * Represents a car service available for booking
 */
const serviceSchema = new mongoose.Schema(
  {
    // Name of the service (e.g., "Oil Change", "Engine Repair")
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },

    // Detailed description of what the service includes
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Price in rupees (or your local currency)
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Duration estimate in minutes
    duration: {
      type: String,
      default: "60-90 minutes",
    },

    // Category of service
    category: {
      type: String,
      enum: [
        "Engine",
        "AC & Cooling",
        "Brakes",
        "Cleaning",
        "Wheels",
        "Electrical",
        "Body Work",
        "Fluids",
        "Other",
      ],
      default: "Other",
    },

    // Image URL or identifier for the service
    image: {
      type: String,
      default: "",
    },

    // Whether the service is currently available
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Features/highlights list
    features: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create and export the Service model
const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;