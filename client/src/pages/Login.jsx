// client/src/pages/Login.jsx
// Purpose: Login page for customers and admin

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

// Add VITE_API_URL=http://localhost:5000 to your .env for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = ({ onLogin }) => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // ─── Handle Input Change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on typing
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    const { email, password } = formData;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return "Please enter a valid email address.";
    if (!password.trim() || password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  // ─── Handle Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        { withCredentials: true } // required to receive the httpOnly cookie
      );

      const { user } = response.data;

      // Tell App.jsx about the login so its `user` state (the single source
      // of truth for Navbar, ProtectedRoute, AdminRoute) actually updates.
      // There's no token to pass anymore — the backend already set it as an
      // httpOnly cookie via Set-Cookie on this same response, so App.jsx
      // has nothing left to store manually.
      onLogin(user);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-content">
          {/* Logo */}
          <div className="login-logo">
            <span className="logo-icon">🔧</span>
            <span className="logo-text">AutoCare</span>
          </div>

          {/* Tagline */}
          <h2 className="login-tagline">
            Your Trusted Car Service Partner
          </h2>
          <p className="login-description">
            Book services, track your vehicle's progress, and manage everything
            from one place.
          </p>

          {/* Features List */}
          <div className="login-features">
            <div className="login-feature-item">
              <span className="feature-check">✓</span>
              <span>Easy online booking</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-check">✓</span>
              <span>Real-time status tracking</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-check">✓</span>
              <span>Expert mechanics</span>
            </div>
            <div className="login-feature-item">
              <span className="feature-check">✓</span>
              <span>Doorstep pickup & delivery</span>
            </div>
          </div>

          {/* Stats */}
          <div className="login-stats">
            <div className="login-stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="login-stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="login-stat">
              <span className="stat-number">10+</span>
              <span className="stat-label">Years Experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Form Header */}
          <div className="login-form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your AutoCare account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
              
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
                {/* Toggle Password Visibility */}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Register Link */}
          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="login-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;