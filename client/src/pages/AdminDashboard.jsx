// client/src/pages/AdminDashboard.jsx
// Purpose: Complete Admin Dashboard with sidebar, stats, charts, and activity feed

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

// ─── Config ───────────────────────────────────────────────────────────────
// Use an env variable so this works in dev, staging, and prod without edits.
// Add VITE_API_URL=http://localhost:5000 to your .env for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// A dedicated axios instance so auth handling lives in one place.
// withCredentials sends the httpOnly cookie automatically.
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// user/onLogout come from AdminRoute in App.jsx — same single-source-of-truth
// pattern as AdminServices.jsx, AdminBookings.jsx, AdminCustomers.jsx. This
// component used to keep its own separate localStorage-based auth check and
// logout, which was inconsistent with the other three admin pages and is no
// longer possible anyway now that the token lives in an httpOnly cookie the
// frontend can't read directly.
const AdminDashboard = ({ user, onLogout }) => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalCustomers: 0,
    totalServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    deliveredBookings: 0,
    mechanicAssigned: 0,
  });

  const [recentBookings, setRecentBookings]   = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [allBookings, setAllBookings]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [activeTab, setActiveTab]             = useState("bookings");
  const [sidebarOpen, setSidebarOpen]         = useState(true);

  const navigate = useNavigate();

  // ─── Logout Handler ───────────────────────────────────────────────────────
  // Calls App.jsx's onLogout, which hits POST /api/auth/logout to clear the
  // httpOnly cookie server-side (the frontend can't clear it directly).
  const handleLogout = useCallback(async () => {
    await onLogout?.();
    navigate("/login");
  }, [onLogout, navigate]);

  // ─── Fetch All Data ───────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        api.get("/api/bookings"),
        api.get("/api/users"),
        api.get("/api/services"),
      ]);

      // Backend wraps list responses as { success, count, <key> } rather
      // than returning a bare array (confirmed in bookingController.js and
      // serviceController.js — getAllBookings returns { bookings }, and
      // getAllServices returns { services }). Reading .data directly as an
      // array was the same bug that broke MyBookings.jsx — .filter()/.length
      // on the wrapper object either threw or silently returned nothing.
      const bookings  = bookingsRes.data.bookings  || bookingsRes.data  || [];
      const services  = servicesRes.data.services  || servicesRes.data  || [];
      // Not confirmed against userController.js yet — falls back to a bare
      // array if that endpoint isn't wrapped the same way. If customers still
      // don't show up, check whether it returns { users } or { customers }.
      const customers =
        customersRes.data.users ||
        customersRes.data.customers ||
        customersRes.data ||
        [];

      setStats({
        totalBookings:      bookings.length,
        totalCustomers:     customers.length,
        totalServices:      services.length,
        pendingBookings:    bookings.filter((b) => b.status === "Pending").length,
        confirmedBookings:  bookings.filter((b) => b.status === "Confirmed").length,
        inProgressBookings: bookings.filter((b) => b.status === "In Progress").length,
        completedBookings:  bookings.filter((b) => b.status === "Completed").length,
        deliveredBookings:  bookings.filter((b) => b.status === "Delivered").length,
        mechanicAssigned:   bookings.filter((b) => b.status === "Mechanic Assigned").length,
      });

      const sortedBookings  = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const sortedCustomers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllBookings(bookings);
      setRecentBookings(sortedBookings.slice(0, 6));
      setRecentCustomers(sortedCustomers.slice(0, 5));
    } catch (err) {
      console.error("Dashboard error:", err);

      // If the token is invalid/expired, don't just show an error forever —
      // send the admin back to login.
      if (err.response && err.response.status === 401) {
        handleLogout();
        return;
      }

      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // ─── Fetch data on mount ────────────────────────────────────────────────
  // No auth guard needed here — AdminRoute in App.jsx already verified
  // `user` exists and has role "admin" before this component ever rendered.
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getStatusClass = (status) => {
    const map = {
      "Pending":           "status-pending",
      "Confirmed":         "status-confirmed",
      "Mechanic Assigned": "status-assigned",
      "In Progress":       "status-inprogress",
      "Completed":         "status-completed",
      "Delivered":         "status-delivered",
    };
    return map[status] || "status-pending";
  };

  const getStatusIcon = (status) => {
    const map = {
      "Pending":           "⏳",
      "Confirmed":         "✅",
      "Mechanic Assigned": "👨‍🔧",
      "In Progress":       "🔧",
      "Completed":         "🏁",
      "Delivered":         "🚗",
    };
    return map[status] || "⏳";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Completion Rate ──────────────────────────────────────────────────────
  const completionRate =
    stats.totalBookings > 0
      ? Math.round(
          ((stats.completedBookings + stats.deliveredBookings) /
            stats.totalBookings) *
            100
        )
      : 0;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-inner">
          <div className="dash-spinner-ring"></div>
          <p className="dash-loading-text">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="dash-root">

      {/* ════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════ */}
      <aside className={`dash-sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🔧</span>
          {sidebarOpen && (
            <span className="sidebar-logo-text">
              Auto<span className="sidebar-logo-accent">Care</span>
            </span>
          )}
        </div>

        {sidebarOpen && <p className="sidebar-section-label">MAIN MENU</p>}

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="sidebar-link sidebar-link-active">
            <span className="sidebar-link-icon">📊</span>
            {sidebarOpen && <span className="sidebar-link-text">Dashboard</span>}
          </Link>
          <Link to="/admin/bookings" className="sidebar-link">
            <span className="sidebar-link-icon">📋</span>
            {sidebarOpen && <span className="sidebar-link-text">Bookings</span>}
            {sidebarOpen && stats.pendingBookings > 0 && (
              <span className="sidebar-badge">{stats.pendingBookings}</span>
            )}
          </Link>
          {/* /admin/services now exists — points at the real management page. */}
          <Link to="/admin/services" className="sidebar-link">
            <span className="sidebar-link-icon">🔧</span>
            {sidebarOpen && <span className="sidebar-link-text">Services</span>}
          </Link>
          <Link to="/admin/customers" className="sidebar-link">
            <span className="sidebar-link-icon">👥</span>
            {sidebarOpen && <span className="sidebar-link-text">Customers</span>}
          </Link>
        </nav>

        {sidebarOpen && (
          <p className="sidebar-section-label" style={{ marginTop: "24px" }}>
            ACCOUNT
          </p>
        )}

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link">
            <span className="sidebar-link-icon">🏠</span>
            {sidebarOpen && <span className="sidebar-link-text">View Site</span>}
          </Link>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-link-text">Logout</span>}
          </button>
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((prev) => !prev)}
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <main className="dash-main">

        {/* ── Top Bar ── */}
        <div className="dash-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard Overview</h1>
            <p className="topbar-date">
              📅{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="topbar-right">
            <button className="topbar-refresh-btn" onClick={fetchDashboardData}>
              🔄 Refresh
            </button>
            <div className="topbar-admin-badge">
              <div className="topbar-avatar">A</div>
              <div className="topbar-admin-info">
                <span className="topbar-admin-name">Admin</span>
                <span className="topbar-admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className="dash-alert dash-alert-error">⚠️ {error}</div>}

        {/* ════════════════════════════════════════
            KPI STAT CARDS
        ════════════════════════════════════════ */}
        <div className="kpi-grid">
          <div className="kpi-card kpi-blue">
            <div className="kpi-card-top">
              <div className="kpi-icon-box kpi-icon-blue">📋</div>
              <div className="kpi-trend kpi-trend-up">↑ Live</div>
            </div>
            <p className="kpi-number">{stats.totalBookings}</p>
            <p className="kpi-label">Total Bookings</p>
            <div className="kpi-footer">
              <Link to="/admin/bookings" className="kpi-link">View all bookings →</Link>
            </div>
          </div>

          <div className="kpi-card kpi-green">
            <div className="kpi-card-top">
              <div className="kpi-icon-box kpi-icon-green">👥</div>
              <div className="kpi-trend kpi-trend-up">↑ Growing</div>
            </div>
            <p className="kpi-number">{stats.totalCustomers}</p>
            <p className="kpi-label">Total Customers</p>
            <div className="kpi-footer">
              <Link to="/admin/customers" className="kpi-link">View all customers →</Link>
            </div>
          </div>

          <div className="kpi-card kpi-purple">
            <div className="kpi-card-top">
              <div className="kpi-icon-box kpi-icon-purple">🔧</div>
              <div className="kpi-trend kpi-trend-neutral">● Active</div>
            </div>
            <p className="kpi-number">{stats.totalServices}</p>
            <p className="kpi-label">Total Services</p>
            <div className="kpi-footer">
              <Link to="/admin/services" className="kpi-link">Manage services →</Link>
            </div>
          </div>

          <div className="kpi-card kpi-red">
            <div className="kpi-card-top">
              <div className="kpi-icon-box kpi-icon-red">🏁</div>
              <div className="kpi-trend kpi-trend-up">↑ Rate</div>
            </div>
            <p className="kpi-number">{completionRate}%</p>
            <p className="kpi-label">Completion Rate</p>
            <div className="kpi-footer">
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            STATUS BREAKDOWN
        ════════════════════════════════════════ */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">Bookings by Status</h2>
          </div>
          <div className="status-breakdown-grid">
            {[
              ["Pending", stats.pendingBookings],
              ["Confirmed", stats.confirmedBookings],
              ["Mechanic Assigned", stats.mechanicAssigned],
              ["In Progress", stats.inProgressBookings],
              ["Completed", stats.completedBookings],
              ["Delivered", stats.deliveredBookings],
            ].map(([status, count]) => (
              <div key={status} className={`status-chip ${getStatusClass(status)}`}>
                <span className="status-chip-icon">{getStatusIcon(status)}</span>
                <span className="status-chip-count">{count}</span>
                <span className="status-chip-label">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            ACTIVITY FEED (Recent Bookings / Customers)
        ════════════════════════════════════════ */}
        <div className="dash-panel" id="dash-activity-panel">
          <div className="dash-panel-header">
            <div className="dash-tabs">
              <button
                className={`dash-tab ${activeTab === "bookings" ? "dash-tab-active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                Recent Bookings
              </button>
              <button
                className={`dash-tab ${activeTab === "customers" ? "dash-tab-active" : ""}`}
                onClick={() => setActiveTab("customers")}
              >
                Recent Customers
              </button>
            </div>
          </div>

          {activeTab === "bookings" && (
            <div className="recent-list">
              {recentBookings.length === 0 && (
                <p className="dash-empty-state">No bookings yet.</p>
              )}
              {recentBookings.map((booking) => (
                <div key={booking._id} className="recent-list-row">
                  <span className={`status-dot ${getStatusClass(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                  </span>
                  <div className="recent-list-main">
                    <p className="recent-list-title">
                      {booking.customerName || booking.user?.name || "Customer"} — {booking.serviceName || "Service"}
                    </p>
                    <p className="recent-list-sub">
                      {formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}
                    </p>
                  </div>
                  <span className={`recent-list-status ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
              <div className="dash-panel-footer">
                <span className="dash-panel-footer-note">
                  Showing {recentBookings.length} of {allBookings.length} total bookings
                </span>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="recent-list">
              {recentCustomers.length === 0 && (
                <p className="dash-empty-state">No customers yet.</p>
              )}
              {recentCustomers.map((customer) => (
                <div key={customer._id} className="recent-list-row">
                  <div className="recent-list-avatar">
                    {(customer.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-list-main">
                    <p className="recent-list-title">{customer.name || "Unnamed"}</p>
                    <p className="recent-list-sub">{customer.email}</p>
                  </div>
                  <span className="recent-list-sub">{formatDate(customer.createdAt)}</span>
                </div>
              ))}
              <div className="dash-panel-footer">
                <span className="dash-panel-footer-note">
                  Showing {recentCustomers.length} of {stats.totalCustomers} total customers
                </span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;