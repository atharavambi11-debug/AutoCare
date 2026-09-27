// server/models/User.js
// Purpose: Define User schema for MongoDB

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * Represents a registered customer or admin in the system
 */
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Email - must be unique across all users
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true, // Always store emails in lowercase
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    // Phone number
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true, // Ensure unique phone numbers
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },

    // Hashed password - never store plain text passwords
    password: {
      type: String,
      required: [true, "Password is required"],
     
      minlength: [6, "Password must be at least 6 characters"],
      
      select: false, // Don't include password in queries by default
    },

    // Role determines access level
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // Profile information
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// ============================================
// Pre-save Middleware - Hash password
// ============================================
userSchema.pre("save", async function (next) {
  // Only hash if password field was modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt with cost factor of 12
    const salt = await bcrypt.genSalt(12);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// Instance Method - Compare password
// ============================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare handles the hashing comparison
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;