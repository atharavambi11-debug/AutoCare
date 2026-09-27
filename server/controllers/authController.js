// server/controllers/authController.js
// Purpose: Handle authentication - register and login

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate JWT Token
 * @param {string} id - User's MongoDB ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload: store only the user ID
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

/**
 * Set the JWT as an httpOnly cookie on the response.
 * Centralized here so register/login/refresh all set it identically.
 *
 * httpOnly: true   -> JavaScript (and therefore XSS) cannot read this cookie
 * secure: true     -> only sent over HTTPS in production (browsers block
 *                      secure cookies over plain HTTP, so this must be false
 *                      in local dev over http://localhost)
 * sameSite: "lax"  -> "strict" blocks the cookie on the very first
 *                      cross-site navigation (e.g. clicking a link to your
 *                      own site from an email), which breaks more than it
 *                      protects for a typical app. "lax" is the standard
 *                      practical default; tighten to "strict" only if you
 *                      have no cross-site login links to support.
 */
const setTokenCookie = (res, token) => {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days — keep in sync with JWT_EXPIRE

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeMs,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ---- Validation ----
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create new user (password hashing handled in model's pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: "customer", // Default role is always customer
    });

    // Generate token for immediate login after registration
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Return success response (never return the password, and no token in
    // the body anymore — it's in the httpOnly cookie the browser just got).
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ---- Validation ----
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email - must explicitly select password since select:false in model
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare provided password with hashed password in DB
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token and set it as an httpOnly cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Return user data only — no token in the body anymore
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Log out the current user
 * @route   POST /api/auth/logout
 * @access  Private
 *
 * The frontend can no longer just delete a token from localStorage since it
 * can't read or write an httpOnly cookie directly — clearing it has to
 * happen server-side.
 */
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private
 *
 * This doubles as the "am I logged in?" check the frontend calls once on
 * page load — the cookie is sent automatically by the browser, protect
 * verifies it, and req.user is already populated by the time we get here.
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Find user and update only allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name || req.user.name,
        phone: phone || req.user.phone,
        address: address || req.user.address,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators on update
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };