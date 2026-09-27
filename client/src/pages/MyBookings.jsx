// client/src/pages/MyBookings.jsx
// Purpose: Show all bookings for the currently logged-in customer

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyBookings.css";

// Add VITE_API_URL=http://localhost:5000 to your .env for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// user comes from ProtectedRoute in App.jsx (<MyBookings user={user} />) —
// single source of truth, same fix as BookService.jsx and Navbar.jsx.
const MyBookings = ({ user }) => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState(null); // for expand/collapse

  const navigate = useNavigate();

  // ─── Fetch Bookings ───────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // The cookie is sent automatically with withCredentials — no more
      // reading a token from localStorage.
      //
      // ✅ The backend already filters bookings to just this user's own
      // (see getAllBookings in bookingController.js — it checks req.user.email
      // server-side), so no client-side email filtering is needed here.
      //
      // The bug: response.data is NOT a bare array — the backend returns
      // { success, count, bookings }. Reading response.data.filter(...)
      // directly was calling .filter on an object, which threw and sent
      // every request straight to the catch block.
      const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
        withCredentials: true,
      });
      const fetchedBookings = response.data.bookings || [];

      // Sort by newest first
      fetchedBookings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(fetchedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);

      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // ─── Redirect if not logged in ────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [user, navigate, fetchBookings]);

  // ─── Status badge color mapper ────────────────────────────────────────────
  const getStatusClass = (status) => {
    const map = {
      Pending: "status-pending",
      Confirmed: "status-confirmed",
      "Mechanic Assigned": "status-assigned",
      "In Progress": "status-inprogress",
      Completed: "status-completed",
      Delivered: "status-delivered",
    };
    return map[status] || "status-pending";
  };

  // ─── Status icon mapper ───────────────────────────────────────────────────
  const getStatusIcon = (status) => {
    const icons = {
      Pending: "⏳",
      Confirmed: "✅",
      "Mechanic Assigned": "👨‍🔧",
      "In Progress": "🔧",
      Completed: "🏁",
      Delivered: "🚗",
    };
    return icons[status] || "⏳";
  };

  // ─── Filter bookings by status ────────────────────────────────────────────
  const filteredBookings =
    filterStatus === "All"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  // ─── Toggle expanded booking card ─────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ─── Format date ──────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ─── All status options for filter ───────────────────────────────────────
  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Mechanic Assigned",
    "In Progress",
    "Completed",
    "Delivered",
  ];

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mybookings-page">
        <div className="mybookings-hero">
          <h1>My Bookings</h1>
          <p>Track all your service bookings</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="mybookings-page">

      {/* ── Hero Banner ── */}
      <div className="mybookings-hero">
        <div className="mybookings-hero-content">
          <h1>My Bookings</h1>
          <p>Hello, <strong>{user?.name}</strong>! Track all your service requests below.</p>
        </div>
      </div>

      <div className="mybookings-container">

        {/* ── Error Message ── */}
        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        {/* ── Summary Cards ── */}
        <div className="summary-cards">
          <div className="summary-card total">
            <span className="summary-icon">📋</span>
            <div>
              <p className="summary-number">{bookings.length}</p>
              <p className="summary-label">Total Bookings</p>
            </div>
          </div>
          <div className="summary-card pending">
            <span className="summary-icon">⏳</span>
            <div>
              <p className="summary-number">
                {bookings.filter((b) => b.status === "Pending").length}
              </p>
              <p className="summary-label">Pending</p>
            </div>
          </div>
          <div className="summary-card inprogress">
            <span className="summary-icon">🔧</span>
            <div>
              <p className="summary-number">
                {bookings.filter((b) => b.status === "In Progress").length}
              </p>
              <p className="summary-label">In Progress</p>
            </div>
          </div>
          <div className="summary-card completed">
            <span className="summary-icon">✅</span>
            <div>
              <p className="summary-number">
                {bookings.filter(
                  (b) => b.status === "Completed" || b.status === "Delivered"
                ).length}
              </p>
              <p className="summary-label">Completed</p>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          <span className="filter-label">Filter by Status:</span>
          <div className="filter-buttons">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-btn ${
                  filterStatus === status ? "filter-btn-active" : ""
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bookings List ── */}
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">🚗</div>
            <h3>No bookings found</h3>
            {filterStatus !== "All" ? (
              <p>No bookings with status "{filterStatus}".</p>
            ) : (
              <p>You haven't booked any service yet.</p>
            )}
            <button
              className="book-now-btn"
              onClick={() => navigate("/book-service")}
            >
              Book a Service Now
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${
                  expandedId === booking._id ? "booking-card-expanded" : ""
                }`}
              >
                {/* ── Card Header ── */}
                <div
                  className="booking-card-header"
                  onClick={() => toggleExpand(booking._id)}
                >
                  {/* Left: Service Info */}
                  <div className="booking-header-left">
                    <div className="booking-service-icon">🔧</div>
                    <div className="booking-main-info">
                      <h3 className="booking-service-name">
                        {booking.service}
                      </h3>
                      <p className="booking-vehicle">
                        {booking.vehicleBrand} {booking.vehicleModel} —{" "}
                        <span className="booking-reg">
                          {booking.registrationNumber}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Status + Date + Toggle */}
                  <div className="booking-header-right">
                    <span
                      className={`status-badge ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                    <span className="booking-date-small">
                      📅 {formatDate(booking.bookingDate)}
                    </span>
                    <span className="expand-icon">
                      {expandedId === booking._id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* ── Card Details (Expanded) ── */}
                {expandedId === booking._id && (
                  <div className="booking-card-details">
                    <div className="details-grid">

                      {/* Personal Info */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          👤 Personal Info
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Name</span>
                          <span className="detail-value">
                            {booking.customerName}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{booking.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Phone</span>
                          <span className="detail-value">{booking.phone}</span>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          🚗 Vehicle Info
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Brand</span>
                          <span className="detail-value">
                            {booking.vehicleBrand}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Model</span>
                          <span className="detail-value">
                            {booking.vehicleModel}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Reg. No.</span>
                          <span className="detail-value">
                            {booking.registrationNumber}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Fuel</span>
                          <span className="detail-value">
                            {booking.fuelType}
                          </span>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          🔧 Service Info
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Service</span>
                          <span className="detail-value">
                            {booking.service}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Date</span>
                          <span className="detail-value">
                            {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time</span>
                          <span className="detail-value">
                            {booking.bookingTime}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status</span>
                          <span
                            className={`detail-value status-badge ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.status)} {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Address & Notes */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">
                          📍 Address & Notes
                        </h4>
                        <div className="detail-row">
                          <span className="detail-label">Address</span>
                          <span className="detail-value">
                            {booking.address}
                          </span>
                        </div>
                        {booking.notes && (
                          <div className="detail-row">
                            <span className="detail-label">Notes</span>
                            <span className="detail-value">
                              {booking.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Status Timeline ── */}
                    <div className="status-timeline">
                      <h4 className="timeline-title">Service Progress</h4>
                      <div className="timeline-steps">
                        {[
                          "Pending",
                          "Confirmed",
                          "Mechanic Assigned",
                          "In Progress",
                          "Completed",
                          "Delivered",
                        ].map((step, index) => {
                          const allSteps = [
                            "Pending",
                            "Confirmed",
                            "Mechanic Assigned",
                            "In Progress",
                            "Completed",
                            "Delivered",
                          ];
                          const currentIndex = allSteps.indexOf(
                            booking.status
                          );
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;

                          return (
                            <div key={step} className="timeline-step">
                              <div
                                className={`step-circle ${
                                  isCompleted ? "step-done" : ""
                                } ${isCurrent ? "step-current" : ""}`}
                              >
                                {isCompleted ? "✓" : index + 1}
                              </div>
                              <span
                                className={`step-label ${
                                  isCurrent ? "step-label-current" : ""
                                }`}
                              >
                                {step}
                              </span>
                              {index < 5 && (
                                <div
                                  className={`step-line ${
                                    index < currentIndex ? "line-done" : ""
                                  }`}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Book Another Service Button ── */}
        {bookings.length > 0 && (
          <div className="book-another">
            <button
              className="book-another-btn"
              onClick={() => navigate("/book-service")}
            >
              + Book Another Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;