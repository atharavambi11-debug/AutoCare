// client/src/components/Footer.jsx
// Purpose: Site footer with navigation links and contact info

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-icon"></span>
                <span className="footer-logo-text">
                  Auto<span className="footer-logo-highlight">Care</span>
                </span>
              </Link>
              <p className="footer-tagline">
                Professional car service and maintenance you can trust. Your
                vehicle deserves the best care.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook"></a>
                <a href="#" className="social-link" aria-label="Instagram"></a>
                <a href="#" className="social-link" aria-label="Twitter"></a>
                <a href="#" className="social-link" aria-label="YouTube"></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/services">Our Services</Link></li>
                <li><Link to="/book-service">Book Service</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Services Column */}
            <div className="footer-column">
              <h4 className="footer-heading">Our Services</h4>
              <ul className="footer-links">
                <li><Link to="/services">Oil Change</Link></li>
                <li><Link to="/services">Engine Repair</Link></li>
                <li><Link to="/services">AC Repair</Link></li>
                <li><Link to="/services">Brake Service</Link></li>
                <li><Link to="/services">Car Wash</Link></li>
                <li><Link to="/services">Wheel Alignment</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <span className="contact-icon">📍</span>
                  <span>123 Service Road, Auto District, City - 400001</span>
                </li>
                <li>
                  <span className="contact-icon"></span>
                  <span>+91 98765 43210</span>
                </li>
                <li>
                  <span className="contact-icon"></span>
                  <span>support@autocare.com</span>
                </li>
                <li>
                  <span className="contact-icon"></span>
                  <span>Mon - Sat: 8:00 AM – 7:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>© {currentYear} AutoCare. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;