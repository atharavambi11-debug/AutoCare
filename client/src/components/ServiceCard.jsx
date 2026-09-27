// client/src/components/ServiceCard.jsx
// Purpose: Reusable card to display a single service

import React from "react";
import { Link } from "react-router-dom";
import "./ServiceCard.css";

/**
 * Service icon mapping based on service name
 */
const getServiceIcon = (serviceName) => {
  const icons = {
    "Oil Change": "🛢️",
    "Engine Repair": "⚙️",
    "AC Repair": "❄️",
    "Brake Service": "🛑",
    "Car Wash": "🚿",
    "Wheel Alignment": "🔄",
    "Battery Replacement": "🔋",
    "Dent & Paint": "🎨",
  };
  return icons[serviceName] || "🔧";
};

/**
 * ServiceCard Component
 * @param {object} service - Service data object from MongoDB
 * @param {boolean} isAdmin - Whether admin controls should show
 * @param {function} onEdit - Handler for edit button click
 * @param {function} onDelete - Handler for delete button click
 */
function ServiceCard({ service, isAdmin = false, onEdit, onDelete }) {
  const icon = getServiceIcon(service.serviceName);

  return (
    <div className="service-card">
      {/* Service Image — shows the real uploaded photo when one exists.
          If service.image is empty (createService defaults it to ""),
          fall back to a plain icon-tile so the card still looks intentional
          instead of showing a broken <img>. */}
      {service.image ? (
        <div className="service-card-image">
          <img
            src={service.image}
            alt={service.serviceName}
            onError={(e) => {
              // If the URL is broken/unreachable, swap to the icon fallback
              // instead of leaving a broken-image icon in the layout.
              e.currentTarget.parentElement.classList.add("service-card-image-fallback");
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="service-card-image service-card-image-fallback">
          <span className="service-card-image-fallback-icon">{icon}</span>
        </div>
      )}

      {/* Service Info */}
      <div className="service-card-body">
        <h3 className="service-card-title">
          <span className="service-card-title-icon">{icon}</span>
          {service.serviceName}
        </h3>
        <p className="service-card-description">{service.description}</p>

        {/* Service Features */}
        {service.features && service.features.length > 0 && (
          <ul className="service-card-features">
            {service.features.slice(0, 3).map((feature, index) => (
              <li key={index}>
                <span className="feature-check">✓</span> {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Duration & Category */}
        <div className="service-card-meta">
          <span className="service-meta-item">
            ⏱️ {service.duration}
          </span>
          <span className="service-meta-item service-category">
            {service.category}
          </span>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="service-card-footer">
        <div className="service-price">
          <span className="price-label">Starting from</span>
          <span className="price-amount">₹{service.price?.toLocaleString()}</span>
        </div>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="service-admin-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onEdit(service)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(service._id)}
            >
              🗑️ Delete
            </button>
          </div>
        ) : (
          // Customer - Book Now button
          <Link to="/book-service" className="btn btn-primary btn-sm">
            Book Now
          </Link>
        )}
      </div>
    </div>
  );
}

export default ServiceCard;