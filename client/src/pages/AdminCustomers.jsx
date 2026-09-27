// client/src/pages/AdminCustomers.jsx
// Purpose: Admin page to view all registered users and delete accounts

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCustomers.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// withCredentials sends the httpOnly cookie automatically on every request —
// replaces the old authConfig() helper that manually attached a Bearer header.
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// user/onLogout come from AdminRoute in App.jsx — this is the LOGGED-IN
// ADMIN viewing the page, not to be confused with the list of customers
// fetched below. Same single-source-of-truth pattern as the other admin pages.
const AdminCustomers = ({ user, onLogout }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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

  // ─── Fetch users ───────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // getAllUsers returns { success, count, users } — not a bare array.
      const response = await api.get("/api/users");
      setCustomers(response.data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      if (handleAuthError(err)) return;
      setError("Failed to load customers. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ─── Delete user ───────────────────────────────────────────────────────
  const handleDelete = async (customer) => {
    // Backend already blocks an admin from deleting their own account, but
    // we can save a round trip and give a clearer message here too.
    if (customer._id === user?._id || customer._id === user?.id) {
      setError("You can't delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${customer.name || customer.email}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(customer._id);
    setError("");

    try {
      await api.delete(`/api/users/${customer._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    } catch (err) {
      console.error("Delete user error:", err);
      if (handleAuthError(err)) return;
      setError(err.response?.data?.message || "Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Filter by search ──────────────────────────────────────────────────
  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  const customerCount = customers.filter((c) => c.role !== "admin").length;
  const adminCount = customers.filter((c) => c.role === "admin").length;

  // ─── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-customers-loading">
        <div className="dash-spinner-ring"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-customers-page">
      <div className="admin-customers-header">
        <div>
          <h1>Customers</h1>
          <p>
            {customerCount} customer{customerCount !== 1 ? "s" : ""}
            {adminCount > 0 && ` · ${adminCount} admin${adminCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <input
          type="text"
          className="admin-customers-search"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="dash-alert dash-alert-error">⚠️ {error}</div>}

      {filteredCustomers.length === 0 ? (
        <div className="admin-customers-empty">
          <p>{search ? "No customers match your search." : "No customers yet."}</p>
        </div>
      ) : (
        <div className="admin-customers-table-wrapper">
          <table className="admin-customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="admin-customer-name-cell">
                      <div className="admin-customer-avatar">
                        {(customer.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span>{customer.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>
                    <span
                      className={`admin-customer-role-badge ${
                        customer.role === "admin" ? "role-admin" : "role-customer"
                      }`}
                    >
                      {customer.role === "admin" ? "👑 Admin" : "👤 Customer"}
                    </span>
                  </td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>
                    <button
                      className="admin-customer-delete-btn"
                      onClick={() => handleDelete(customer)}
                      disabled={deletingId === customer._id}
                      title={
                        customer._id === user?._id || customer._id === user?.id
                          ? "You can't delete your own account"
                          : "Delete this account"
                      }
                    >
                      {deletingId === customer._id ? "Deleting..." : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;