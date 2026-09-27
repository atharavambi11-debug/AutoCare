// client/src/pages/Contact.jsx
// Purpose: Contact page with form, business info, and working hours

import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ─── Handle Input Change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateForm = () => {
    const { name, email, phone, subject, message } = formData;
    if (!name.trim()) return "Your name is required.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return "A valid email address is required.";
    if (!phone.trim() || !/^\d{10}$/.test(phone))
      return "A valid 10-digit phone number is required.";
    if (!subject.trim()) return "Subject is required.";
    if (!message.trim() || message.trim().length < 10)
      return "Message must be at least 10 characters.";
    return null;
  };

  // ─── Handle Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    // Simulate sending message (no backend endpoint for contact)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Hide success after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  // ─── Contact Info Data ────────────────────────────────────────────────────
  const contactInfo = [
    {
      icon: "📍",
      title: "Our Location",
      lines: ["123 AutoCare Boulevard", "Mumbai, Maharashtra 400001", "India"],
    },
    {
      icon: "📞",
      title: "Phone Numbers",
      lines: ["+91 98765 43210", "+91 87654 32109", "Toll Free: 1800-AUTO-CARE"],
    },
    {
      icon: "✉️",
      title: "Email Address",
      lines: [
        "support@autocare.in",
        "bookings@autocare.in",
        "admin@autocare.in",
      ],
    },
    {
      icon: "🕐",
      title: "Working Hours",
      lines: [
        "Monday – Friday: 8AM – 8PM",
        "Saturday: 9AM – 6PM",
        "Sunday: 10AM – 4PM",
      ],
    },
  ];

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="contact-page">

      {/* ── Hero Banner ── */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>
            Have a question or need help? We're here for you — reach out
            anytime.
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="contact-container">

        {/* ── Contact Info Cards ── */}
        <div className="contact-info-grid">
          {contactInfo.map((item, index) => (
            <div className="contact-info-card" key={index}>
              <div className="info-card-icon">{item.icon}</div>
              <h3 className="info-card-title">{item.title}</h3>
              {item.lines.map((line, i) => (
                <p className="info-card-line" key={i}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* ── Bottom Section: Form + Map ── */}
        <div className="contact-bottom">

          {/* ── Contact Form ── */}
          <div className="contact-form-wrapper">
            <h2 className="form-heading">Send Us a Message</h2>
            <p className="form-subheading">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            {/* Success Alert */}
            {success && (
              <div className="alert alert-success">
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">⚠️ {error}</div>
            )}

            <form
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Row 1: Name + Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Subject */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    Subject <span className="required">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="">-- Select a Subject --</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Booking Support">Booking Support</option>
                    <option value="Service Feedback">Service Feedback</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={6}
                  className="form-input form-textarea"
                />
                <span className="char-count">
                  {formData.message.length} characters
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="contact-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> Sending...
                  </span>
                ) : (
                  "📨 Send Message"
                )}
              </button>
            </form>
          </div>

          {/* ── Map + Quick Links ── */}
          <div className="contact-map-wrapper">
            <h2 className="form-heading">Find Us Here</h2>
            <p className="form-subheading">
              Visit our service center at the address below.
            </p>

            {/* Map Placeholder */}
            <div className="map-placeholder">
              <div className="map-inner">
                <div className="map-pin">📍</div>
                <p className="map-address">
                  123 AutoCare Boulevard
                  <br />
                  Mumbai, Maharashtra 400001
                </p>
                <a
                  href="https://maps.app.goo.gl/VvTUJg9W24XD8Crx5"
                  target="_blank"
                  rel="noreferrer"
                  className="map-link"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="quick-contact">
              <h3 className="quick-contact-title">Quick Contact</h3>
              <div className="quick-contact-buttons">
                <a href="tel:+919876543210" className="quick-btn call-btn">
                  📞 Call Now
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="quick-btn whatsapp-btn"
                >
                  💬 WhatsApp
                </a>
                <a
                  href="mailto:support@autocare.in"
                  className="quick-btn email-btn"
                >
                  ✉️ Email Us
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h3 className="faq-title">Frequently Asked Questions</h3>
              <div className="faq-list">
                <FAQ
                  question="How do I book a service?"
                  answer="Visit the Book Service page, fill out the form with your vehicle details and preferred date, and submit. We'll confirm within 2 hours."
                />
                <FAQ
                  question="Can I reschedule my booking?"
                  answer="Yes! Contact us via phone or WhatsApp at least 24 hours before your scheduled service to reschedule."
                />
                <FAQ
                  question="Do you offer home pickup?"
                  answer="Yes, we offer free vehicle pickup and drop-off within a 15km radius of our service center."
                />
                <FAQ
                  question="How long does a service take?"
                  answer="It depends on the service type. An oil change takes 1–2 hours, while engine repair may take 1–3 days."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── FAQ Accordion Component ──────────────────────────────────────────────────
const FAQ = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`}>
      <button
        className="faq-question"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{question}</span>
        <span className="faq-icon">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Contact;