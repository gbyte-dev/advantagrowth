"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const checkLogin = () => {
      setLoggedIn(!!localStorage.getItem("token"));
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);

    // Testimonial auto-slide
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      window.removeEventListener("storage", checkLogin);
      clearInterval(interval);
    };
  }, []);

  const testimonials = [
    {
      name: "Rajesh Patel",
      role: "Owner, Spice Garden Restaurant",
      text: "Advanta Growth transformed our restaurant operations. The POS system is incredibly fast and the inventory management saves us hours every week.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Manager, Urban Bites Cafe",
      text: "The best restaurant management software we've used. Staff management and KOT system are outstanding. Highly recommended!",
      rating: 5,
    },
    {
      name: "Amit Verma",
      role: "Owner, Golden Wok",
      text: "We've increased our efficiency by 40% since switching to Advanta Growth. The analytics and reports help us make better business decisions.",
      rating: 5,
    },
  ];

  const stats = [
    { icon: "fa-store", number: "500+", label: "Restaurants" },
    { icon: "fa-users", number: "10,000+", label: "Happy Customers" },
    { icon: "fa-utensils", number: "1M+", label: "Orders Processed" },
    { icon: "fa-star", number: "4.8/5", label: "Customer Rating" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-crown"></i>
              <span>#1 Restaurant POS System</span>
            </div>
            
            <h1>
              Restaurant POS
              <span className="hero-highlight"> Made Simple</span>
            </h1>

            <p>
              Billing, Kitchen, Inventory, Staff Management and Reports —
              everything your restaurant needs in one powerful platform.
            </p>

            {!loggedIn ? (
              <div className="hero-buttons">
                <Link href="/customer/register" className="primary-btn">
                  <i className="fas fa-rocket"></i>
                  Get Started Free
                </Link>

                <Link href="/customer/login" className="secondary-btn">
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </Link>
              </div>
            ) : (
              <div className="hero-buttons">
                <Link href="/dashboard" className="primary-btn">
                  <i className="fas fa-tachometer-alt"></i>
                  Go to Dashboard
                </Link>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="hero-trust">
              <div className="trust-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure & Reliable</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-headset"></i>
                <span>24/7 Support</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-sync-alt"></i>
                <span>Free Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={`fas ${stat.icon}`}></i>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Why Choose Advanta Growth?</h2>
            <p>Everything you need to run your restaurant efficiently</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Fast Billing</h3>
              <p>Create bills within seconds with our lightning-fast POS interface. Support for multiple payment methods.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Quick order taking</li>
                <li><i className="fas fa-check"></i> Multiple payment modes</li>
                <li><i className="fas fa-check"></i> Digital receipts</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-fire"></i>
              </div>
              <h3>Kitchen Orders</h3>
              <p>Streamline your Kitchen Order Tickets (KOT) with real-time updates. No more order confusion.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Real-time KOT</li>
                <li><i className="fas fa-check"></i> Order priority</li>
                <li><i className="fas fa-check"></i> Kitchen display system</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-boxes"></i>
              </div>
              <h3>Inventory Management</h3>
              <p>Track stock automatically with smart alerts. Never run out of ingredients during peak hours.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Auto stock updates</li>
                <li><i className="fas fa-check"></i> Low stock alerts</li>
                <li><i className="fas fa-check"></i> Purchase management</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Reports & Analytics</h3>
              <p>Get detailed daily, weekly, and monthly reports. Make data-driven decisions for your business.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Sales reports</li>
                <li><i className="fas fa-check"></i> Profit analysis</li>
                <li><i className="fas fa-check"></i> Staff performance</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users-cog"></i>
              </div>
              <h3>Staff Management</h3>
              <p>Manage your staff schedules, track attendance, and monitor performance from a single dashboard.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Shift management</li>
                <li><i className="fas fa-check"></i> Attendance tracking</li>
                <li><i className="fas fa-check"></i> Role-based access</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <h3>QR Code Ordering</h3>
              <p>Contactless dining experience with QR-based menu and ordering. Boost efficiency and customer satisfaction.</p>
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Digital menu</li>
                <li><i className="fas fa-check"></i> Direct kitchen orders</li>
                <li><i className="fas fa-check"></i> Customer feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-badge">About Us</span>
              <h2>Built for Restaurants, By Restaurant Experts</h2>
              <p>
                Whether you own a cafe, fine dining restaurant, cloud kitchen, or food court,
                Advanta Growth helps you manage your business efficiently with tools designed
                specifically for the food industry.
              </p>
              <div className="about-points">
                <div className="about-point">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>10+ Years Experience</h4>
                    <p>Deep understanding of restaurant operations</p>
                  </div>
                </div>
                <div className="about-point">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>All-in-One Solution</h4>
                    <p>POS, KOT, inventory, staff, and reports in one platform</p>
                  </div>
                </div>
                <div className="about-point">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>Cloud-Based</h4>
                    <p>Access your data anytime, anywhere, from any device</p>
                  </div>
                </div>
              </div>
              <Link href="/about" className="primary-btn">
                <i className="fas fa-info-circle"></i>
                Learn More
              </Link>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <i className="fas fa-utensils"></i>
                <span>Restaurant Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Process</span>
            <h2>How It Works</h2>
            <p>Get started in 4 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <i className="fas fa-user-plus step-icon"></i>
              <h3>Create Account</h3>
              <p>Sign up as a restaurant owner or customer in just a few clicks.</p>
            </div>

            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <i className="fas fa-cog step-icon"></i>
              <h3>Set Up</h3>
              <p>Configure your menu, staff, and restaurant settings easily.</p>
            </div>

            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <i className="fas fa-play-circle step-icon"></i>
              <h3>Start Using</h3>
              <p>Begin billing, managing KOT, and tracking inventory instantly.</p>
            </div>

            <div className="step-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <i className="fas fa-chart-line step-icon"></i>
              <h3>Grow Business</h3>
              <p>Use reports and analytics to scale your restaurant operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2>What Our Clients Say</h2>
            <p>Trusted by restaurant owners across the country</p>
          </div>

          <div className="testimonial-slider">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h4>{testimonials[currentTestimonial].name}</h4>
                  <p>{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${currentTestimonial === index ? "dot-active" : ""}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!loggedIn && (
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Transform Your Restaurant?</h2>
              <p>Join 500+ restaurants already using Advanta Growth. Start your free trial today.</p>
              <div className="cta-buttons">
                <Link href="/customer/register" className="primary-btn">
                  <i className="fas fa-rocket"></i>
                  Create Free Account
                </Link>
                <Link href="/owner/register" className="secondary-btn">
                  <i className="fas fa-crown"></i>
                  Register as Owner
                </Link>
              </div>
              <p className="cta-note">
                <i className="fas fa-check-circle"></i>
                No credit card required • Free forever plan available
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="contact-brief">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Need Help?</h3>
              <p>Our support team is here to assist you</p>
            </div>
            <div className="contact-actions">
              <a href="mailto:support@advantagrowth.com" className="contact-link">
                <i className="fas fa-envelope"></i>
                support@advantagrowth.com
              </a>
              <a href="tel:+911234567890" className="contact-link">
                <i className="fas fa-phone"></i>
                +91 12345 67890
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}