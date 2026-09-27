// client/src/pages/AdminBookings.jsx
// Purpose: Admin page to view all bookings, update their status/mechanic, and delete them

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminBookings.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// withCredentials sends the httpOnly cookie automatically on every request —
// replaces the old authConfig() helper that manually attached a Bearer header.
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Mechanic Assigned",
  "In Progress",
  "Completed",
  "Delivered",
];

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

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// user/onLogout come from AdminRoute in App.jsx — single source of truth,
// same pattern as AdminDashboard.jsx and AdminServices.jsx.
const AdminBookings = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const handleAuthError = useCallback(
    (err) => {
      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          onLogout?.();
          navigate("/login");
        }, 1500);
        return true;
      }
      return false;
    },
    [onLogout, navigate]
  );

  // ─── Fetch bookings ────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // getAllBookings returns ALL bookings for admin, wrapped as
      // { success, count, bookings } — not a bare array.
      const response = await api.get("/api/bookings");
      const fetched = response.data.bookings || [];
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(fetched);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      if (handleAuthError(err)) return;
      setError("Failed to load bookings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ─── Update status / mechanic ──────────────────────────────────────────
  const updateBookingField = async (bookingId, field, value) => {
    setSavingId(bookingId);
    setError("");

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, [field]: value } : b))
    );

    try {
      await api.put(
        `/api/bookings/${bookingId}`,
        { [field]: value }
      );
    } catch (err) {
      console.error("Update booking error:", err);
      if (handleAuthError(err)) return;
      setError(err.response?.data?.message || "Failed to update booking.");
      // Roll back by refetching since we already applied the optimistic update
      fetchBookings();
    } finally {
      setSavingId(null);
    }
  };

  // ─── Delete booking ────────────────────────────────────────────────────
  const handleDelete = async (booking) => {
    const confirmed = window.confirm(
      `Delete the booking for ${booking.customerName} (${booking.service})? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(booking._id);
    setError("");

    try {
      await api.delete(`/api/bookings/${booking._id}`);
      setBookings((prev) => prev.filter((b) => b._id !== booking._id));
    } catch (err) {
      console.error("Delete booking error:", err);
      if (handleAuthError(err)) return;
      setError(err.response?.data?.message || "Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookings =
    filterStatus === "All"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  // ─── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-bookings-loading">
        <div className="dash-spinner-ring"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>Update status, assign mechanics, and manage all customer bookings.</p>
        </div>
      </div>

      {error && <div className="dash-alert dash-alert-error">⚠️ {error}</div>}

      {/* ── Filter Bar ── */}
      <div className="admin-bookings-filter-bar">
        <span className="admin-bookings-filter-label">Filter by status:</span>
        <div className="admin-bookings-filter-buttons">
          {["All", ...STATUS_OPTIONS].map((status) => (
            <button
              key={status}
              className={`admin-bookings-filter-btn ${
                filterStatus === status ? "admin-bookings-filter-btn-active" : ""
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
        <div className="admin-bookings-empty">
          <p>
            {filterStatus === "All"
              ? "No bookings yet."
              : `No bookings with status "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="admin-bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="admin-booking-card">
              <div
                className="admin-booking-header"
                onClick={() =>
                  setExpandedId((prev) => (prev === booking._id ? null : booking._id))
                }
              >
                <div className="admin-booking-main">
                  <h3>{booking.service}</h3>
                  <p>
                    {booking.customerName} — {booking.vehicleBrand} {booking.vehicleModel} (
                    {booking.registrationNumber})
                  </p>
                </div>
                <div className="admin-booking-header-right">
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                  <span className="admin-booking-date">
                    📅 {formatDate(booking.bookingDate)}
                  </span>
                  <span className="expand-icon">
                    {expandedId === booking._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedId === booking._id && (
                <div className="admin-booking-details">
                  <div className="admin-booking-details-grid">
                    <div>
                      <strong>Email:</strong> {booking.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {booking.phone}
                    </div>
                    <div>
                      <strong>Fuel Type:</strong> {booking.fuelType}
                    </div>
                    <div>
                      <strong>Time Slot:</strong> {booking.bookingTime}
                    </div>
                    <div className="admin-booking-details-full">
                      <strong>Address:</strong> {booking.address}
                    </div>
                    {booking.notes && (
                      <div className="admin-booking-details-full">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}
                  </div>

                  <div className="admin-booking-controls">
                    <div className="admin-booking-control">
                      <label htmlFor={`status-${booking._id}`}>Status</label>
                      <select
                        id={`status-${booking._id}`}
                        value={booking.status}
                        disabled={savingId === booking._id}
                        onChange={(e) =>
                          updateBookingField(booking._id, "status", e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-booking-control">
                      <label htmlFor={`mechanic-${booking._id}`}>Mechanic</label>
                      <input
                        id={`mechanic-${booking._id}`}
                        type="text"
                        defaultValue={booking.mechanicName || ""}
                        placeholder="Assign a mechanic"
                        disabled={savingId === booking._id}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (booking.mechanicName || "")) {
                            updateBookingField(booking._id, "mechanicName", value);
                          }
                        }}
                      />
                    </div>

                    <div className="admin-booking-control">
                      <label htmlFor={`amount-${booking._id}`}>Total Amount (₹)</label>
                      <input
                        id={`amount-${booking._id}`}
                        type="number"
                        min="0"
                        defaultValue={booking.totalAmount || 0}
                        disabled={savingId === booking._id}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (value !== (booking.totalAmount || 0) && !Number.isNaN(value)) {
                            updateBookingField(booking._id, "totalAmount", value);
                          }
                        }}
                      />
                    </div>

                    <button
                      className="admin-booking-delete-btn"
                      onClick={() => handleDelete(booking)}
                      disabled={deletingId === booking._id}
                    >
                      {deletingId === booking._id ? "Deleting..." : "🗑️ Delete Booking"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;