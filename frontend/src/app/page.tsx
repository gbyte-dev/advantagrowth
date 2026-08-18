"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStat, setCurrentStat] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLogin = () => {
      setLoggedIn(!!localStorage.getItem("token"));
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);

    // Testimonial auto-slide
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      window.removeEventListener("storage", checkLogin);
      clearInterval(interval);
    };
  }, []);

  const testimonials = [
    {
      name: "Rajesh Patel",
      role: "Owner, Spice Garden Restaurant",
      text: "Advanta Growth's AI-powered insights helped us increase revenue by 40% in just 3 months. The smart suggestions are game-changing!",
      rating: 5,
      image: "/avatars/rajesh.jpg",
    },
    {
      name: "Priya Sharma",
      role: "Manager, Urban Bites Cafe",
      text: "The AI analytics saved us thousands in inventory waste. We now know exactly what our customers want before they order.",
      rating: 5,
      image: "/avatars/priya.jpg",
    },
    {
      name: "Amit Verma",
      role: "Owner, Golden Wok",
      text: "From customer insights to revenue growth, Advanta Growth's AI does it all. We've never been more efficient.",
      rating: 5,
      image: "/avatars/amit.jpg",
    },
    {
      name: "Sneha Reddy",
      role: "CEO, Fusion Foods",
      text: "The AI recommendations helped us optimize our menu and increase average order value by 25%.",
      rating: 5,
      image: "/avatars/sneha.jpg",
    },
  ];

  const stats = [
    { icon: "fa-store", number: "500+", label: "Restaurants", suffix: "Active restaurants trust us" },
    { icon: "fa-users", number: "12,500+", label: "Happy Customers", suffix: "Growing every day" },
    { icon: "fa-star", number: "4.9/5", label: "Customer Rating", suffix: "Based on 2,000+ reviews" },
    { icon: "fa-robot", number: "10M+", label: "AI Predictions", suffix: "Smart business insights" },
  ];

  const aiFeatures = [
    {
      icon: "fa-brain",
      title: "Smart Order Prediction",
      description: "AI predicts what customers will order based on time, weather, and past behavior.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: "fa-chart-line",
      title: "Revenue Forecasting",
      description: "Get accurate revenue forecasts for the next 30 days with AI-powered analytics.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "fa-cubes",
      title: "Inventory Optimization",
      description: "Reduce waste by 35% with AI suggestions on what to stock and when.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: "fa-user-tie",
      title: "Staff Scheduling AI",
      description: "AI creates optimal staff schedules based on predicted customer traffic patterns.",
      gradient: "from-orange-500 to-yellow-500",
    },
  ];

  const features = [
    {
      icon: "fa-bolt",
      title: "AI-Powered Billing",
      description: "Smart billing system that learns your customers' preferences and suggests add-ons.",
      image: "/features/billing-ai.jpg",
      tags: ["Smart Suggestions", "Fast Checkout", "Digital Receipts"],
    },
    {
      icon: "fa-fire",
      title: "KOT Intelligence",
      description: "Kitchen Order Tickets with AI priority routing for faster delivery and less confusion.",
      image: "/features/kot-ai.jpg",
      tags: ["Priority Routing", "Real-Time Updates", "Kitchen Display"],
    },
    {
      icon: "fa-boxes",
      title: "AI Inventory Management",
      description: "Predictive inventory that automatically reorders when stock runs low.",
      image: "/features/inventory-ai.jpg",
      tags: ["Auto-Reorder", "Waste Reduction", "Supplier Management"],
    },
    {
      icon: "fa-chart-bar",
      title: "Business Analytics AI",
      description: "Deep insights with AI recommendations to boost sales and customer loyalty.",
      image: "/features/analytics-ai.jpg",
      tags: ["Sales Reports", "Customer Insights", "Growth Predictions"],
    },
    {
      icon: "fa-users-cog",
      title: "Smart Staff Management",
      description: "AI-driven staff scheduling, performance tracking, and retention insights.",
      image: "/features/staff-ai.jpg",
      tags: ["Shift Optimization", "Performance AI", "Retention Insights"],
    },
    {
      icon: "fa-qrcode",
      title: "AI Personalization",
      description: "QR ordering with AI recommendations based on customer dining history.",
      image: "/features/qr-ai.jpg",
      tags: ["Personalized Menu", "Order History", "Feedback AI"],
    },
  ];

  const benefits = [
    {
      number: "40%",
      label: "Revenue Growth",
      description: "Average increase in revenue within 6 months",
      icon: "fa-rocket",
    },
    {
      number: "35%",
      label: "Waste Reduction",
      description: "AI-powered inventory optimization",
      icon: "fa-recycle",
    },
    {
      number: "50%",
      label: "Faster Service",
      description: "AI-driven KOT and order management",
      icon: "fa-clock",
    },
    {
      number: "98%",
      label: "Customer Satisfaction",
      description: "Through personalized experiences",
      icon: "fa-smile",
    },
  ];

  const blogPosts = [
    {
      title: "How AI is Revolutionizing Restaurant Operations",
      category: "AI Insights",
      date: "Dec 15, 2024",
      image: "/blog/ai-restaurant.jpg",
      excerpt: "Discover how artificial intelligence is helping restaurants reduce costs and increase revenue.",
    },
    {
      title: "5 Ways to Boost Your Restaurant Revenue Using AI",
      category: "Growth Tips",
      date: "Dec 12, 2024",
      image: "/blog/revenue-ai.jpg",
      excerpt: "Learn proven strategies to increase your restaurant's profitability with AI-driven insights.",
    },
    {
      title: "The Future of Food: AI in Restaurant Management",
      category: "Innovation",
      date: "Dec 10, 2024",
      image: "/blog/food-ai.jpg",
      excerpt: "Explore how AI is shaping the future of the food service industry.",
    },
  ];

  const partners = [
    { name: "FoodDelivery", icon: "fa-truck" },
    { name: "PaymentPro", icon: "fa-credit-card" },
    { name: "MenuMaster", icon: "fa-utensil-spoon" },
    { name: "KitchenTech", icon: "fa-microchip" },
    { name: "TableBook", icon: "fa-calendar-check" },
    { name: "ReviewAI", icon: "fa-star" },
  ];

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-gradient-orb hero-orb-1"></div>
        <div className="hero-gradient-orb hero-orb-2"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-pulse"></span>
                <i className="fas fa-robot"></i>
                <span>AI-Powered Restaurant Management</span>
              </div>
              
              <h1 className="hero-title">
                Transform Your Restaurant
                <span className="hero-highlight"> with AI Intelligence</span>
              </h1>

              <p className="hero-description">
                From smart billing to AI predictions — everything you need to 
                <span className="text-gradient"> grow your restaurant</span> in one powerful platform.
              </p>

              <div className="hero-buttons">
                <Link href="/owner/register" className="primary-btn btn-large">
                  <i className="fas fa-rocket"></i>
                  Start Free Trial
                  <span className="btn-badge">AI Powered</span>
                </Link>
                <Link href="#features" className="secondary-btn btn-large">
                  <i className="fas fa-play-circle"></i>
                  See Features
                </Link>
              </div>

              <div className="hero-trust">
                <div className="trust-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>AI Secure</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-headset"></i>
                  <span>24/7 AI Support</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-sync-alt"></i>
                  <span>Auto Updates</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-brain"></i>
                  <span>Smart Insights</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-dashboard-preview">
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="preview-dot red"></span>
                    <span className="preview-dot yellow"></span>
                    <span className="preview-dot green"></span>
                    <span className="preview-title">AI Dashboard</span>
                  </div>
                  <div className="preview-body">
                    <div className="preview-stat">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">+32%</span>
                    </div>
                    <div className="preview-chart">
                      <div className="chart-bar" style={{ height: '40%' }}></div>
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '80%' }}></div>
                      <div className="chart-bar" style={{ height: '70%' }}></div>
                      <div className="chart-bar" style={{ height: '90%' }}></div>
                      <div className="chart-bar" style={{ height: '100%' }}></div>
                      <div className="chart-bar" style={{ height: '85%' }}></div>
                    </div>
                    <div className="preview-ai">
                      <i className="fas fa-robot"></i>
                      <span>AI Prediction: <strong>+28%</strong> next week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="stats" ref={statsRef}>
        <div className="container">
          <div className="stats-header">
            <span className="section-badge">Our Impact</span>
            <p>Trusted by restaurant owners across the globe</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon-wrapper">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AI FEATURES SECTION ==================== */}
      <section className="ai-features" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">AI-Powered</span>
            <h2>Intelligence Built for Restaurants</h2>
            <p>Advanced AI that learns, predicts, and helps you grow</p>
          </div>

          <div className="ai-features-grid">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="ai-feature-card">
                <div className={`ai-feature-icon ${feature.gradient}`}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="ai-feature-badge">
                  <i className="fas fa-bolt"></i>
                  AI Powered
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Complete Restaurant Management</h2>
            <p>Everything you need with AI intelligence built-in</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-image-wrapper">
                  <div className="feature-image-placeholder">
                    <i className="fas fa-image"></i>
                    <span>AI Feature</span>
                  </div>
                  <div className="feature-ai-badge">
                    <i className="fas fa-robot"></i> AI
                  </div>
                </div>
                <div className="feature-content">
                  <div className="feature-icon-wrapper">
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-tags">
                    {feature.tags.map((tag, idx) => (
                      <span key={idx} className="feature-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BENEFITS / RESULTS SECTION ==================== */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefits-content">
              <span className="section-badge">Results</span>
              <h2>Real Results with AI</h2>
              <p>See how restaurant owners are transforming their businesses</p>
              <div className="benefits-stats">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <div className="benefit-number">{benefit.number}</div>
                    <div className="benefit-info">
                      <h4>{benefit.label}</h4>
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="primary-btn">
                <i className="fas fa-chart-line"></i>
                View Live Demo
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="benefits-chart-container">
                <div className="chart-placeholder">
                  <i className="fas fa-chart-line"></i>
                  <span>AI Analytics Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Process</span>
            <h2>How Advanta Growth Works</h2>
            <p>Start transforming your restaurant in 4 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon-wrapper">
                <i className="fas fa-user-plus step-icon"></i>
              </div>
              <h3>Sign Up & Connect</h3>
              <p>Create your account and connect your restaurant in minutes.</p>
            </div>

            <div className="step-connector">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="step-card">
              <div className="step-icon-wrapper">
                <i className="fas fa-cog step-icon"></i>
              </div>
              <h3>AI Setup & Training</h3>
              <p>Our AI learns your menu, staff, and business patterns.</p>
            </div>

            <div className="step-connector">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="step-card">
              <div className="step-icon-wrapper">
                <i className="fas fa-play-circle step-icon"></i>
              </div>
              <h3>Go Live with AI</h3>
              <p>Start using AI-powered billing, KOT, and inventory.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2>What Restaurant Owners Say</h2>
            <p>Real stories from real businesses using Advanta Growth</p>
          </div>

          <div className="testimonial-slider">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                <span className="testimonial-rating">5.0</span>
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
                <div className="testimonial-ai-badge">
                  <i className="fas fa-robot"></i> Verified AI
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

      {/* ==================== BLOG / INSIGHTS SECTION ==================== */}
      <section className="insights">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Insights</span>
            <h2>Latest AI & Restaurant Insights</h2>
            <p>Stay ahead with the latest trends and tips</p>
          </div>

          <div className="insights-grid">
            {blogPosts.map((post, index) => (
              <div key={index} className="insight-card">
                <div className="insight-image">
                  <div className="insight-image-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                  <span className="insight-category">{post.category}</span>
                </div>
                <div className="insight-content">
                  <div className="insight-meta">
                    <span className="insight-date">{post.date}</span>
                    <span className="insight-read-time">5 min read</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href="#" className="insight-link">
                    Read More <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PARTNERS SECTION ==================== */}
      <section className="partners">
        <div className="container">
          <p className="partners-label">Trusted by leading platforms</p>
          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={index} className="partner-item">
                <i className={`fas ${partner.icon}`}></i>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      {!loggedIn && (
        <section className="cta">
          <div className="cta-gradient-bg"></div>
          <div className="container">
            <div className="cta-content">
              <div className="cta-badge">
                <i className="fas fa-robot"></i>
                AI-Powered Transformation
              </div>
              <h2>Ready to Transform Your Restaurant with AI?</h2>
              <p>
                Join 500+ restaurants already using Advanta Growth. 
                <span className="text-gradient"> Start your free trial today.</span>
              </p>
              <div className="cta-buttons">
                <Link href="/owner/register" className="primary-btn btn-large">
                  <i className="fas fa-crown"></i>
                  Start Free Trial
                  <span className="btn-badge">No Credit Card</span>
                </Link>
                <Link href="/demo" className="secondary-btn btn-large">
                  <i className="fas fa-play-circle"></i>
                  Watch Demo
                </Link>
              </div>
              <div className="cta-features">
                <span><i className="fas fa-check-circle"></i> Free forever plan</span>
                <span><i className="fas fa-check-circle"></i> AI-powered insights</span>
                <span><i className="fas fa-check-circle"></i> 24/7 support</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== CONTACT SECTION ==================== */}
      <section className="contact-brief">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Need Help?</h3>
              <p>Our AI support team is here to assist you 24/7</p>
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
              <button className="contact-chat">
                <i className="fas fa-comment-dots"></i>
                AI Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}