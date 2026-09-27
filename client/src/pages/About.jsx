// client/src/pages/About.jsx
// Purpose: About page with company info, mission, and team

import React from "react";
import "./About.css";

function About() {
  const team = [
    { name: "Rajiv Mehta", role: "Founder & CEO", icon: "👨‍💼", experience: "15 years" },
    { name: "Suresh Kumar", role: "Head Mechanic", icon: "👨‍🔧", experience: "12 years" },
    { name: "Ananya Patel", role: "Service Manager", icon: "👩‍💼", experience: "8 years" },
    { name: "Deepak Joshi", role: "Senior Technician", icon: "🧰", experience: "10 years" },
  ];

  const milestones = [
    
  ];

  const values = [
    { icon: "🤝", title: "Integrity", desc: "Honest work, honest pricing. No surprises." },
    { icon: "🎯", title: "Quality", desc: "We use only genuine parts and proven methods." },
    { icon: "💡", title: "Innovation", desc: "Always adopting the latest automotive technology." },
    { icon: "❤️", title: "Care", desc: "We treat every car as if it were our own." },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="container">
          <div className="about-hero-content">
            <h1>About AutoCare</h1>
            <p>
              Driven by passion, powered by expertise. We've been keeping cars on
              the road for over 10 years.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="about-mission-grid">
            <div className="about-mission-text">
              <h2>Our Mission</h2>
              <p>
                At AutoCare, our mission is simple: provide every car owner with
                reliable, transparent, and affordable vehicle maintenance and
                repair services. We believe that a well-maintained car is a safe
                car.
              </p>
              <p>
                We started as a small garage with big dreams. Today, we're proud
                to be the most trusted car service center in the city, with over
                5,000 satisfied customers and a team of 50+ certified mechanics.
              </p>
              <div className="mission-highlights">
                <div className="mission-highlight">
                  <span className="highlight-icon">✅</span>
                  <span>Certified by Automotive Service Excellence (ASE)</span>
                </div>
                <div className="mission-highlight">
                  <span className="highlight-icon">✅</span>
                  <span>ISO 9001:2015 Quality Management certified</span>
                </div>
                <div className="mission-highlight">
                  <span className="highlight-icon">✅</span>
                  <span>Authorized service partner for 10+ car brands</span>
                </div>
              </div>
            </div>
            <div className="about-mission-visual">
              <div className="mission-visual-card">
                <div className="visual-icon">🏆</div>
                <h3>Award Winning Service</h3>
                <p>Best Auto Service Center 2023 – City Business Awards</p>
              </div>
              <div className="mission-visual-card">
                <div className="visual-icon">⭐</div>
                <h3>4.9/5 Rating</h3>
                <p>Based on 2,500+ verified customer reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section about-values">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section about-timeline">
        <div className="container">
          <div className="section-header">
            <h2>Our Journey</h2>
            <p>A decade of dedication and growth</p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`timeline-item ${
                  index % 2 === 0 ? "timeline-left" : "timeline-right"
                }`}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <p>{milestone.event}</p>
                </div>
                <div className="timeline-dot"></div>
              </div>
            ))}
            <div className="timeline-line"></div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section about-team">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>The skilled professionals behind AutoCare's success</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">{member.icon}</div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-experience">
                  <strong>{member.experience}</strong> experience
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;