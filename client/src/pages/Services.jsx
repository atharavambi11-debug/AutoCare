// client/src/pages/Services.jsx
// Purpose: Display all services with search and filter

import React, { useState, useEffect } from "react";
import { servicesAPI } from "../services/api";
import ServiceCard from "../components/ServiceCard";
import Loader from "../components/Loader";
import "./Services.css";

function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Engine",
    "AC & Cooling",
    "Brakes",
    "Cleaning",
    "Wheels",
    "Electrical",
    "Body Work",
    "Fluids",
    "Other",
  ];

  // Fetch all services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services when search or category changes
  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      setServices(response.data.services);
      setFilteredServices(response.data.services);
    } catch (err) {
      setError("Failed to load services. Please try again.");
      console.error("Fetch services error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let result = [...services];

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    setFilteredServices(result);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="services-page">
      {/* Page Header */}
      <div className="services-hero">
        <div className="services-hero-overlay"></div>
        <div className="container">
          <div className="services-hero-content">
            <h1>Our Services</h1>
            <p>
              Comprehensive car care solutions by certified mechanics. Find the
              service your vehicle needs.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Search and Filter Bar */}
          <div className="services-filter-bar">
            {/* Search Input */}
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={handleSearch}
                className="services-search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results count */}
            {!loading && (
              <span className="results-count">
                {filteredServices.length} service
                {filteredServices.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${
                  selectedCategory === category ? "category-pill-active" : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          {loading ? (
            <Loader message="Loading services..." size="lg" />
          ) : error ? (
            <div className="services-error">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchServices}>
                Try Again
              </button>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="services-listing-grid">
              {filteredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No Services Found</h3>
              <p>
                No services match your search. Try different keywords or
                <button className="link-btn" onClick={clearFilters}>
                  clear all filters
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="services-cta-section">
        <div className="container">
          <div className="services-cta-card">
            <h2>Can't Find What You Need?</h2>
            <p>
              We offer many more specialized services. Contact us and our team
              will help you with any car-related issue.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg">
              Contact Our Experts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;