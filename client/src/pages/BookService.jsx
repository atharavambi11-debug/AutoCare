// client/src/pages/BookService.jsx
// Purpose: Complete booking form for customers to book a car service

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookService.css";

// Add VITE_API_URL=http://localhost:5000 to your .env for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// user comes from ProtectedRoute in App.jsx (<BookService user={user} />) —
// it's the single source of truth for who's logged in, so we use it instead
// of re-reading localStorage here (same fix as Navbar.jsx).
const BookService = ({ user }) => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Form fields state
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    vehicleBrand: "",
    vehicleModel: "",
    registrationNumber: "",
    fuelType: "",
    service: "",
    bookingDate: "",
    bookingTime: "",
    address: "",
    notes: "",
  });

  // ─── Fetch available services on mount ───────────────────────────────────
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/services`);
        // getAllServices returns { success, count, services } — not a bare
        // array. Reading response.data directly meant services.length was
        // always undefined, so this silently fell back to the hardcoded
        // <option> list below on every load, regardless of what's actually
        // in the database (same wrapper bug as MyBookings.jsx / AdminDashboard.jsx).
        setServices(response.data.services || []);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };

    fetchServices();
  }, []);

  // Pre-fill from the logged-in user whenever it's available/changes.
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // ─── Handle input change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setError("");
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
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
    } = formData;

    if (!customerName.trim()) return "Full name is required.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return "Valid email is required.";
    if (!phone.trim() || !/^\d{10}$/.test(phone))
      return "Valid 10-digit phone number is required.";
    if (!vehicleBrand.trim()) return "Vehicle brand is required.";
    if (!vehicleModel.trim()) return "Vehicle model is required.";
    if (!registrationNumber.trim()) return "Registration number is required.";
    if (!fuelType) return "Please select a fuel type.";
    if (!service) return "Please select a service.";
    if (!bookingDate) return "Preferred date is required.";

    // Date must not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(bookingDate);
    if (selected < today) return "Booking date cannot be in the past.";

    if (!bookingTime) return "Preferred time is required.";
    if (!address.trim()) return "Address is required.";

    return null; // No error
  };

  // ─── Handle form submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // The cookie is sent automatically with withCredentials — no more
      // reading a token from localStorage (there isn't one anymore).
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setSuccess(true);
        // Reset form after success
        setFormData({
          customerName: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          vehicleBrand: "",
          vehicleModel: "",
          registrationNumber: "",
          fuelType: "",
          service: "",
          bookingDate: "",
          bookingTime: "",
          address: "",
          notes: "",
        });

        // Redirect to My Bookings after 2 seconds
        setTimeout(() => {
          navigate("/my-bookings");
        }, 2000);
      }
    } catch (err) {
      console.error("Booking error:", err);

      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Get today's date for min date in date picker ────────────────────────
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="book-service-page">
      {/* ── Page Header ── */}
      <div className="book-hero">
        <div className="book-hero-content">
          <h1>Book a Service</h1>
          <p>Fill in the form below and we'll take care of the rest.</p>
        </div>
      </div>

      {/* ── Booking Form Container ── */}
      <div className="book-container">
        {/* Success Message */}
        {success && (
          <div className="alert alert-success">
            ✅ Booking submitted successfully! Redirecting to your bookings...
          </div>
        )}

        {/* Error Message */}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          {/* ── Section 1: Personal Information ── */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-number">1</span>
              Personal Information
            </h2>

            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="customerName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Vehicle Information ── */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-number">2</span>
              Vehicle Information
            </h2>

            <div className="form-grid">
              {/* Vehicle Brand */}
              <div className="form-group">
                <label htmlFor="vehicleBrand">
                  Vehicle Brand <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="vehicleBrand"
                  name="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota, Honda, BMW"
                  className="form-input"
                />
              </div>

              {/* Vehicle Model */}
              <div className="form-group">
                <label htmlFor="vehicleModel">
                  Vehicle Model <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Corolla, Civic, X5"
                  className="form-input"
                />
              </div>

              {/* Registration Number */}
              <div className="form-group">
                <label htmlFor="registrationNumber">
                  Registration Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. MH 12 AB 1234"
                  className="form-input"
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              {/* Fuel Type */}
              <div className="form-group">
                <label htmlFor="fuelType">
                  Fuel Type <span className="required">*</span>
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  <option value="">-- Select Fuel Type --</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 3: Service Details ── */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-number">3</span>
              Service Details
            </h2>

            <div className="form-grid">
              {/* Service Selection */}
              <div className="form-group">
                <label htmlFor="service">
                  Select Service <span className="required">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  <option value="">-- Select a Service --</option>
                  {services.length > 0 ? (
                    services.map((svc) => (
                      <option key={svc._id} value={svc.serviceName}>
                        {svc.serviceName} — ₹{svc.price}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Oil Change">Oil Change</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Car Wash">Car Wash</option>
                      <option value="Wheel Alignment">Wheel Alignment</option>
                      <option value="Battery Replacement">
                        Battery Replacement
                      </option>
                      <option value="Dent & Paint">Dent &amp; Paint</option>
                    </>
                  )}
                </select>
              </div>

              {/* Preferred Date */}
              <div className="form-group">
                <label htmlFor="bookingDate">
                  Preferred Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  className="form-input"
                />
              </div>

              {/* Preferred Time */}
              <div className="form-group">
                <label htmlFor="bookingTime">
                  Preferred Time <span className="required">*</span>
                </label>
                <select
                  id="bookingTime"
                  name="bookingTime"
                  value={formData.bookingTime}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  <option value="">-- Select Time Slot --</option>
                  <option value="08:00 AM - 09:00 AM">
                    08:00 AM – 09:00 AM
                  </option>
                  <option value="09:00 AM - 10:00 AM">
                    09:00 AM – 10:00 AM
                  </option>
                  <option value="10:00 AM - 11:00 AM">
                    10:00 AM – 11:00 AM
                  </option>
                  <option value="11:00 AM - 12:00 PM">
                    11:00 AM – 12:00 PM
                  </option>
                  <option value="12:00 PM - 01:00 PM">
                    12:00 PM – 01:00 PM
                  </option>
                  <option value="02:00 PM - 03:00 PM">
                    02:00 PM – 03:00 PM
                  </option>
                  <option value="03:00 PM - 04:00 PM">
                    03:00 PM – 04:00 PM
                  </option>
                  <option value="04:00 PM - 05:00 PM">
                    04:00 PM – 05:00 PM
                  </option>
                  <option value="05:00 PM - 06:00 PM">
                    05:00 PM – 06:00 PM
                  </option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address">
                Pickup Address <span className="required">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address for vehicle pickup"
                rows={3}
                className="form-input form-textarea"
              />
            </div>

            {/* Notes */}
            <div className="form-group full-width">
              <label htmlFor="notes">Additional Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Describe any specific issues with your vehicle..."
                rows={4}
                className="form-input form-textarea"
              />
            </div>
          </div>

          {/* ── Submit Button ── */}
          <div className="form-submit">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Submitting...
                </span>
              ) : (
                "🔧 Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookService;