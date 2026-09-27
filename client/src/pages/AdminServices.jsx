// client/src/pages/AdminServices.jsx
// Purpose: Admin page to view, add, edit, and delete services

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminServices.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// withCredentials sends the httpOnly cookie automatically on every request —
// replaces the old authConfig() helper that manually attached a Bearer header.
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const EMPTY_FORM = {
  serviceName: "",
  description: "",
  price: "",
  category: "Other",
  duration: "60-90 minutes",
  features: "", // comma-separated in the UI, split into an array on submit
  image: "",
};

// user comes from AdminRoute in App.jsx — single source of truth, same
// pattern as AdminDashboard.jsx, BookService.jsx, MyBookings.jsx.
const AdminServices = ({ user, onLogout }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // ─── Fetch services ────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/services");
      // getAllServices returns { success, count, services } — not a bare array.
      setServices(response.data.services || []);
    } catch (err) {
      console.error("Fetch services error:", err);
      setError("Failed to load services. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ─── Form handlers ─────────────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setEditingId(service._id);
    setFormData({
      serviceName: service.serviceName || "",
      description: service.description || "",
      price: service.price ?? "",
      category: service.category || "Other",
      duration: service.duration || "60-90 minutes",
      features: Array.isArray(service.features) ? service.features.join(", ") : "",
      image: service.image || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName.trim() || !formData.description.trim() || !formData.price) {
      setFormError("Service name, description, and price are required.");
      return;
    }
    if (Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      serviceName: formData.serviceName.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.trim() || "Other",
      duration: formData.duration.trim() || "60-90 minutes",
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      image: formData.image.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/api/services/${editingId}`, payload);
      } else {
        await api.post("/api/services", payload);
      }
      closeForm();
      fetchServices();
    } catch (err) {
      console.error("Save service error:", err);

      if (err.response && err.response.status === 401) {
        setFormError("Your session has expired. Please log in again.");
        setTimeout(() => {
          onLogout?.();
          navigate("/login");
        }, 1500);
        return;
      }

      setFormError(
        err.response?.data?.message || "Failed to save service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `Delete "${service.serviceName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(service._id);
    setError("");

    try {
      await api.delete(`/api/services/${service._id}`);
      setServices((prev) => prev.filter((s) => s._id !== service._id));
    } catch (err) {
      console.error("Delete service error:", err);

      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          onLogout?.();
          navigate("/login");
        }, 1500);
        return;
      }

      setError(err.response?.data?.message || "Failed to delete service.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-services-loading">
        <div className="dash-spinner-ring"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-services-page">
      <div className="admin-services-header">
        <div>
          <h1>Manage Services</h1>
          <p>Add, edit, or remove the services customers can book.</p>
        </div>
        <button className="admin-services-add-btn" onClick={openCreateForm}>
          + Add Service
        </button>
      </div>

      {error && <div className="dash-alert dash-alert-error">⚠️ {error}</div>}

      {/* ── Add/Edit Form ── */}
      {showForm && (
        <div className="admin-services-form-overlay" onClick={closeForm}>
          <div className="admin-services-form-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit Service" : "Add New Service"}</h2>

            {formError && (
              <div className="dash-alert dash-alert-error">⚠️ {formError}</div>
            )}

            <form onSubmit={handleSubmit} className="admin-services-form">
              <div className="form-group">
                <label htmlFor="serviceName">Service Name *</label>
                <input
                  id="serviceName"
                  name="serviceName"
                  type="text"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="e.g. Oil Change"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What does this service include?"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 999"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 60-90 minutes"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Maintenance"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Image URL</label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="features">Features (comma-separated)</label>
                <input
                  id="features"
                  name="features"
                  type="text"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="e.g. Synthetic oil, Filter replacement, Free inspection"
                />
              </div>

              <div className="admin-services-form-actions">
                <button
                  type="button"
                  className="admin-services-cancel-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-services-save-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Services List ── */}
      {services.length === 0 ? (
        <div className="admin-services-empty">
          <p>No services yet.</p>
          <button className="admin-services-add-btn" onClick={openCreateForm}>
            + Add Your First Service
          </button>
        </div>
      ) : (
        <div className="admin-services-grid">
          {services.map((service) => (
            <div key={service._id} className="admin-service-card">
              {service.image && (
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="admin-service-image"
                />
              )}
              <div className="admin-service-body">
                <div className="admin-service-top">
                  <h3>{service.serviceName}</h3>
                  <span className="admin-service-price">₹{service.price}</span>
                </div>
                <p className="admin-service-description">{service.description}</p>
                <div className="admin-service-meta">
                  <span>{service.category}</span>
                  <span>•</span>
                  <span>{service.duration}</span>
                </div>
                {service.features?.length > 0 && (
                  <ul className="admin-service-features">
                    {service.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                )}
                <div className="admin-service-actions">
                  <button
                    className="admin-service-edit-btn"
                    onClick={() => openEditForm(service)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="admin-service-delete-btn"
                    onClick={() => handleDelete(service)}
                    disabled={deletingId === service._id}
                  >
                    {deletingId === service._id ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminServices;