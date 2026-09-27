// client/src/components/BookingCard.jsx
// Purpose: Display a booking entry with status and actions

import React from "react";
import "./BookingCard.css";

/**
 * Get CSS class for status badge based on booking status
 */
const getStatusClass = (status) => {
  const statusMap = {
    "Pending": "badge-pending",
    "Confirmed": "badge-confirmed",
    "Mechanic Assigned": "badge-mechanic-assigned",
    "In Progress": "badge-in-progress",
    "Completed": "badge-completed",
    "Delivered": "badge-delivered",
  };
  return statusMap[status] || "badge-pending";
};

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * BookingCard Component
 * @param {object} booking - Booking data from MongoDB
 * @param {boolean} isAdmin - Show admin controls
 * @param {function} onStatusUpdate - Admin handler for status change
 * @param {function} onDelete - Admin handler for delete
 */
function BookingCard({ booking, isAdmin = false, onStatusUpdate, onDelete }) {
  const statusClass = getStatusClass(booking.status);

  const statusOptions = [
    "Pending",
    "Confirmed",
    "Mechanic Assigned",
    "In Progress",
    "Completed",
    "Delivered",
  ];

  return (
    <div className="booking-card">
      {/* Header */}
      <div className="booking-card-header">
        <div className="booking-header-left">
          <h3 className="booking-service-name">🔧 {booking.service}</h3>
          <p className="booking-id">
            ID: #{booking._id?.slice(-8).toUpperCase()}
          </p>
        </div>
        <span className={`badge ${statusClass}`}>{booking.status}</span>
      </div>

      {/* Body */}
      <div className="booking-card-body">
        {/* Customer Info */}
        <div className="booking-info-section">
          <h4 className="booking-section-title">👤 Customer Details</h4>
          <div className="booking-info-grid">
            <div className="booking-info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{booking.customerName}</span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{booking.email}</span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{booking.phone}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="booking-info-section">
          <h4 className="booking-section-title">🚗 Vehicle Details</h4>
          <div className="booking-info-grid">
            <div className="booking-info-item">
              <span className="info-label">Brand & Model</span>
              <span className="info-value">
                {booking.vehicleBrand} {booking.vehicleModel}
              </span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Reg. Number</span>
              <span className="info-value reg-number">
                {booking.registrationNumber}
              </span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Fuel Type</span>
              <span className="info-value">{booking.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="booking-info-section">
          <h4 className="booking-section-title">📅 Appointment</h4>
          <div className="booking-info-grid">
            <div className="booking-info-item">
              <span className="info-label">Date</span>
              <span className="info-value">{formatDate(booking.bookingDate)}</span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Time</span>
              <span className="info-value">{booking.bookingTime}</span>
            </div>
            <div className="booking-info-item">
              <span className="info-label">Booked On</span>
              <span className="info-value">{formatDate(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        {booking.address && (
          <div className="booking-address">
            <span className="info-label">📍 Address:</span>
            <span className="info-value"> {booking.address}</span>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="booking-notes">
            <span className="info-label">📝 Notes:</span>
            <p>{booking.notes}</p>
          </div>
        )}

        {/* Mechanic (if assigned) */}
        {booking.mechanicName && (
          <div className="booking-mechanic">
            <span className="info-label">👨‍🔧 Mechanic:</span>
            <span className="info-value"> {booking.mechanicName}</span>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="booking-card-footer">
          <div className="booking-status-update">
            <label htmlFor={`status-${booking._id}`} className="form-label">
              Update Status:
            </label>
            <select
              id={`status-${booking._id}`}
              className="form-select"
              value={booking.status}
              onChange={(e) => onStatusUpdate(booking._id, e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(booking._id)}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingCard;