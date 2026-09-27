// client/src/App.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// =====================================================
// PAGES
// =====================================================

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import AdminBookings from "./pages/AdminBookings";
import AdminCustomers from "./pages/AdminCustomers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Dedicated instance with withCredentials so the httpOnly cookie is sent
// automatically on every request — this replaces manually attaching an
// Authorization header from localStorage everywhere.
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


// =====================================================
// CUSTOMER PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================

const AdminRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};


// =====================================================
// APPLICATION CONTENT
// =====================================================

const AppContent = ({
  user,
  onLogin,
  onLogout,
}) => {
  const location = useLocation();

  // Check whether current page is an admin page
  const isAdminPage =
    location.pathname.startsWith("/admin");


  return (
    <>
      {/* =================================================
          CUSTOMER NAVBAR
          Hide it on admin pages
      ================================================= */}

      {!isAdminPage && (
        <Navbar
          user={user}
          onLogout={onLogout}
        />
      )}


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        style={{
          minHeight: isAdminPage
            ? "100vh"
            : "calc(100vh - 70px - 300px)",
        }}
      >

        <Routes>

          {/* =================================================
              HOME
          ================================================= */}

          <Route
            path="/"
            element={
              <Home user={user} />
            }
          />


          {/* =================================================
              ABOUT
          ================================================= */}

          <Route
            path="/about"
            element={<About />}
          />


          {/* =================================================
              SERVICES
          ================================================= */}

          <Route
            path="/services"
            element={<Services />}
          />


          {/* =================================================
              CONTACT
          ================================================= */}

          <Route
            path="/contact"
            element={<Contact />}
          />


          {/* =================================================
              LOGIN
          ================================================= */}

          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : "/"
                  }
                  replace
                />
              ) : (
                <Login
                  onLogin={onLogin}
                />
              )
            }
          />


          {/* =================================================
              REGISTER
          ================================================= */}

          <Route
            path="/register"
            element={
              user ? (
                <Navigate
                  to="/"
                  replace
                />
              ) : (
                <Register
                  onLogin={onLogin}
                />
              )
            }
          />


          {/* =================================================
              BOOK SERVICE
          ================================================= */}

          <Route
            path="/book-service"
            element={
              <ProtectedRoute user={user}>
                <BookService user={user} />
              </ProtectedRoute>
            }
          />


          {/* =================================================
              MY BOOKINGS
          ================================================= */}

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute user={user}>
                <MyBookings user={user} />
              </ProtectedRoute>
            }
          />


          {/* =================================================
              ADMIN DASHBOARD

              Actual file:
              src/pages/AdminDashboard.jsx
          ================================================= */}

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute user={user}>
                <AdminDashboard
                  user={user}
                  onLogout={onLogout}
                />
              </AdminRoute>
            }
          />


          {/* =================================================
              ADMIN SERVICES MANAGEMENT

              Actual file:
              src/pages/AdminServices.jsx
          ================================================= */}

          <Route
            path="/admin/services"
            element={
              <AdminRoute user={user}>
                <AdminServices
                  user={user}
                  onLogout={onLogout}
                />
              </AdminRoute>
            }
          />


          {/* =================================================
              ADMIN BOOKINGS MANAGEMENT

              Actual file:
              src/pages/AdminBookings.jsx
          ================================================= */}

          <Route
            path="/admin/bookings"
            element={
              <AdminRoute user={user}>
                <AdminBookings
                  user={user}
                  onLogout={onLogout}
                />
              </AdminRoute>
            }
          />


          {/* =================================================
              ADMIN CUSTOMERS MANAGEMENT

              Actual file:
              src/pages/AdminCustomers.jsx
          ================================================= */}

          <Route
            path="/admin/customers"
            element={
              <AdminRoute user={user}>
                <AdminCustomers
                  user={user}
                  onLogout={onLogout}
                />
              </AdminRoute>
            }
          />


          {/* =================================================
              /admin -> /admin/dashboard
          ================================================= */}

          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />


          {/* =================================================
              404
          ================================================= */}

          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: "60vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "50px 20px",
                }}
              >

                <h1
                  style={{
                    fontSize: "6rem",
                    color: "#e63946",
                    margin: 0,
                  }}
                >
                  404
                </h1>

                <h2
                  style={{
                    color: "#1d3557",
                    marginBottom: "10px",
                  }}
                >
                  Page Not Found
                </h2>

                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "25px",
                  }}
                >
                  The page you're looking for
                  doesn't exist.
                </p>

                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  style={{
                    border: "none",
                    background: "#e63946",
                    color: "#fff",
                    padding: "12px 25px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Go Back Home
                </button>

              </div>
            }
          />

        </Routes>

      </main>


      {/* =================================================
          CUSTOMER FOOTER
          Hide it on admin pages
      ================================================= */}

      {!isAdminPage && <Footer />}

    </>
  );
};


// =====================================================
// MAIN APP
// =====================================================

function App() {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  // ===================================================
  // RESTORE LOGIN ON PAGE LOAD
  // ===================================================
  //
  // There's no token in localStorage anymore — it lives in an httpOnly
  // cookie the browser attaches automatically. So instead of reading and
  // parsing localStorage here, we just ask the backend "who am I, if
  // anyone?" via GET /api/auth/profile. If the cookie is present and
  // valid, the backend's `protect` middleware verifies it and this
  // returns the user. If there's no cookie (or it's expired/invalid),
  // this 401s, which just means "not logged in" — not an error to alarm
  // the user about.

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get("/api/auth/profile");
        setUser(response.data.user);
      } catch (error) {
        // 401 here just means no one is logged in — normal, not a bug.
        // Anything else (network error, 500) also just leaves user as
        // null, which correctly sends them to /login on protected routes.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);


  // ===================================================
  // LOGIN
  // ===================================================
  //
  // The cookie is already set by the time Login.jsx's axios call resolves
  // (the backend sent it via Set-Cookie on the same response). All this
  // needs to do now is update React state with the user object — no more
  // localStorage.setItem for a token.

  const handleLogin = useCallback((userData) => {
    if (!userData) {
      console.error("Login failed: no user data received.");
      return;
    }

    setUser(userData);
  }, []);


  // ===================================================
  // LOGOUT
  // ===================================================
  //
  // Can't just clear localStorage anymore — the cookie is httpOnly, so
  // only the server can clear it. Calls the new POST /api/auth/logout
  // endpoint, then clears React state regardless of whether the request
  // succeeds (if the network is down, we still want the UI to act
  // logged-out immediately; the cookie will simply expire on its own
  // via maxAge if the clear request never reached the server).

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
    }
  }, []);


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#e63946",
        }}
      >
        Loading AutoCare...
      </div>
    );

  }


  // ===================================================
  // ROUTER
  // ===================================================

  return (
    <Router>

      <AppContent
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

    </Router>
  );
}


export default App;