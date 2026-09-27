// client/src/pages/Home.jsx
// Purpose: Homepage - main landing page

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { servicesAPI } from "../services/api";
import ServiceCard from "../components/ServiceCard";
import Loader from "../components/Loader";
import "./Home.css";

function Home({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        // Show only first 4 services on homepage
        setServices(response.data.services.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const stats = [
    { icon: "🚗", number: "5000+", label: "Cars Serviced" },
    { icon: "⭐", number: "4.9/5", label: "Customer Rating" },
    { icon: "👨‍🔧", number: "50+", label: "Expert Mechanics" },
    { icon: "🏆", number: "10+", label: "Years Experience" },
  ];

  const features = [
    {
      icon: "🔍",
      title: "Expert Diagnosis",
      desc: "Advanced diagnostic tools to pinpoint issues quickly and accurately.",
    },
    {
      icon: "⚡",
      title: "Fast Turnaround",
      desc: "Most services completed same day so you get back on the road fast.",
    },
    {
      icon: "💰",
      title: "Transparent Pricing",
      desc: "No hidden charges. Get a complete estimate before work begins.",
    },
    {
      icon: "🛡️",
      title: "Service Guarantee",
      desc: "All our repairs come with a 30-day service guarantee.",
    },
    {
      icon: "📱",
      title: "Real-time Updates",
      desc: "Track your vehicle service status from booking to delivery.",
    },
    {
      icon: "🚚",
      title: "Pickup & Delivery",
      desc: "We pick up and drop off your vehicle from your doorstep.",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      vehicle: "Maruti Swift",
      rating: 5,
      comment:
        "Excellent service! My car's engine was repaired perfectly. Very professional team and fair pricing.",
    },
    {
      name: "Priya Sharma",
      vehicle: "Honda City",
      rating: 5,
      comment:
        "Booked online, got a confirmation within hours, and my car was ready the same day. Highly recommend!",
    },
    {
      name: "Amit Singh",
      vehicle: "Hyundai Creta",
      rating: 5,
      comment:
        "The AC repair was done flawlessly. The status updates kept me informed throughout. Will use again!",
    },
  ];

  return (
    <div className="home-page">
      {/* ============================================
          Hero Section
          ============================================ */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">🏆 #1 Trusted Car Service Center</div>
          <h1 className="hero-title">
            Professional Car Service
            <br />
            <span className="hero-title-highlight">You Can Trust</span>
          </h1>
          <p className="hero-subtitle">
            Expert mechanics, genuine parts, and transparent pricing.
            Book your car service in minutes and get back on the road.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/book-service" className="btn btn-primary btn-lg">
                🔧 Book a Service
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Get Started Free
              </Link>
            )}
            <Link to="/services" className="btn btn-outline-white btn-lg">
              View Services
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat">
                <span className="hero-stat-icon">{stat.icon}</span>
                <span className="hero-stat-number">{stat.number}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          How It Works
          ============================================ */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Book your car service in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">📱</div>
              <h3>Book Online</h3>
              <p>Choose your service, select a convenient date and time, and fill in your vehicle details.</p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🔧</div>
              <h3>We Service</h3>
              <p>Our expert mechanics diagnose and repair your vehicle with genuine spare parts.</p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">🚗</div>
              <h3>Drive Happy</h3>
              <p>Get your vehicle back in perfect condition with a complete service report.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          Featured Services
          ============================================ */}
      <section className="section featured-services">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive car care solutions for every need</p>
          </div>

          {loading ? (
            <Loader message="Loading services..." />
          ) : services.length > 0 ? (
            <>
              <div className="services-grid">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
              <div className="services-cta">
                <Link to="/services" className="btn btn-secondary btn-lg">
                  View All Services →
                </Link>
              </div>
            </>
          ) : (
            <div className="no-services-message">
              <p>Services coming soon. Check back later!</p>
              <Link to="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Why Choose Us
          ============================================ */}
      <section className="section why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose AutoCare?</h2>
            <p>We go above and beyond to deliver exceptional service</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Testimonials
          ============================================ */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Real reviews from real customers</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {"⭐".repeat(testimonial.rating)}
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="author-name">{testimonial.name}</p>
                    <p className="author-vehicle">🚗 {testimonial.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA Banner
          ============================================ */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Service Your Car?</h2>
            <p>
              Book your appointment today and experience the AutoCare difference.
              First-time customers get a free vehicle inspection!
            </p>
            <div className="cta-actions">
              {user ? (
                <Link to="/book-service" className="btn btn-primary btn-lg">
                  Book Now
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
              )}
              <Link to="/contact" className="btn btn-outline-white btn-lg">
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;