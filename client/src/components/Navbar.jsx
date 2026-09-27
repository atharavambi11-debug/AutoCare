// client/src/components/Navbar.jsx
// Purpose: Main navigation bar for the entire application

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

// Navbar now receives `user` and `onLogout` from App.jsx instead of keeping
// its own copy of the user in localStorage-derived state. App.jsx is the
// single source of truth for auth state — duplicating it here caused logout
// to desync between this component and App (see fetchDashboardData chat).
const Navbar = ({ user, onLogout }) => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ─── Scroll effect: add shadow when scrolled ──────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Close menu on route change ───────────────────────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // ─── Logout Handler ───────────────────────────────────────────────────────
  const handleLogout = () => {
    onLogout(); // clears localStorage AND App's user state together
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  // ─── Check if link is active ──────────────────────────────────────────────
  const isActive = (path) => location.pathname === path;

  // ─── Nav Links for customers ──────────────────────────────────────────────
  const customerLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/book-service", label: "Book Service" },
    { path: "/contact", label: "Contact" },
  ];

  // ─── Nav Links for admin ──────────────────────────────────────────────────
  // All four admin pages now exist.
  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/services", label: "Services" },
    { path: "/admin/bookings", label: "Bookings" },
    { path: "/admin/customers", label: "Customers" },
  ];

  // Decide which links to show
  const navLinks = user?.role === "admin" ? adminLinks : customerLinks;

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">

        {/* ── Logo ── */}
        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/"}
          className="navbar-logo"
        >
          <span className="logo-icon"></span>
          <span className="logo-name">
            Auto<span className="logo-highlight">Care</span>
          </span>
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <ul className={`navbar-links ${menuOpen ? "navbar-links-open" : ""}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "nav-link-active" : ""}`}
              >
                {link.label}
                {/* Active underline indicator */}
                {isActive(link.path) && (
                  <span className="active-indicator"></span>
                )}
              </Link>
            </li>
          ))}

          {/* My Bookings — only for logged-in customers */}
          {user && user.role !== "admin" && (
            <li>
              <Link
                to="/my-bookings"
                className={`nav-link ${
                  isActive("/my-bookings") ? "nav-link-active" : ""
                }`}
              >
                My Bookings
                {isActive("/my-bookings") && (
                  <span className="active-indicator"></span>
                )}
              </Link>
            </li>
          )}
        </ul>

        {/* ── Right Section: Auth Buttons or User Menu ── */}
        <div className="navbar-right">
          {user ? (
            /* ── Logged In: User Dropdown ── */
            <div className="user-menu">
              <button
                className="user-menu-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {/* Avatar Circle with first letter */}
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">
                    {user.role === "admin" ? "👑 Admin" : "👤 Customer"}
                  </span>
                </div>
                <span
                  className={`dropdown-arrow ${dropdownOpen ? "arrow-up" : ""}`}
                >
                  ▾
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="user-dropdown">
                  {/* Dropdown Header */}
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>

                  <div className="dropdown-divider"></div>

                  {/* Profile Link — only for customers.
                      NOTE: /profile is not yet defined in App.jsx's routes.
                      Add that route before re-enabling this, or it will 404. */}
                  {false && user.role !== "admin" && (
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                     Edit Profile
                    </Link>
                  )}

                  {/* My Bookings — only for customers */}
                  {user.role !== "admin" && (
                    <Link
                      to="/my-bookings"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>
                  )}

                  {/* Admin Dashboard — only for admin */}
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                       Dashboard
                    </Link>
                  )}

                  <div className="dropdown-divider"></div>

                  {/* Logout */}
                  <button
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                  >
                      Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not Logged In: Login + Register Buttons ── */
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link> 
            </div>
          )}

          {/* ── Hamburger Menu Button (Mobile) ── */}
          <button
            className={`hamburger ${menuOpen ? "hamburger-open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* ── Mobile Overlay ── */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* ── Mobile Dropdown Menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          {/* Mobile Nav Links */}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${
                isActive(link.path) ? "mobile-nav-link-active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* My Bookings for logged-in customers */}
          {user && user.role !== "admin" && (
            <Link
              to="/my-bookings"
              className={`mobile-nav-link ${
                isActive("/my-bookings") ? "mobile-nav-link-active" : ""
              }`}
            >
              My Bookings
            </Link>
          )}

          <div className="mobile-divider"></div>

          {/* Mobile Auth Section */}
          {user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <div className="user-avatar mobile-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="mobile-user-name">{user.name}</p>
                  <p className="mobile-user-email">{user.email}</p>
                </div>
              </div>

              <button
                className="mobile-logout-btn"
                onClick={handleLogout}
              >
               Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="mobile-login-btn">
                Login
              </Link>
              <Link to="/register" className="mobile-register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;