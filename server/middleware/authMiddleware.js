// server/middleware/authMiddleware.js
// Purpose: Protect routes using JWT verification and role checking

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect - Middleware to verify JWT token
 * Attaches the logged-in user to req.user
 * Use this on any route that requires authentication
 *
 * Reads the token from the httpOnly cookie (req.cookies.token) instead of
 * the Authorization header. This requires cookie-parser to be registered
 * in server.js (app.use(cookieParser())) — without it, req.cookies is
 * undefined and this always falls through to "no token provided".
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token
    // Exclude password from the result using .select("-password")
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token is invalid.",
      });
    }

    // Token is valid, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token failed.",
    });
  }
};

/**
 * adminOnly - Middleware to restrict access to admin users only
 * Must be used AFTER protect middleware
 *
 * Usage: router.get('/admin-route', protect, adminOnly, controller)
 */
const adminOnly = (req, res, next) => {
  // req.user is set by the protect middleware above
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, allow access
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

module.exports = { protect, adminOnly };