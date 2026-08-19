"use client";

import { useState } from "react";

// =========================================================
// REVENUE TREND DATA
// =========================================================

const revenueTrendData = {
  day: [
    { date: "Today", revenue: 311.41 },
    { date: "Yesterday", revenue: 730.40 },
    { date: "2 days ago", revenue: 1156.76 },
    { date: "3 days ago", revenue: 1157.64 },
  ],
  week: [
    { date: "Mon", revenue: 2450.50 },
    { date: "Tue", revenue: 1890.30 },
    { date: "Wed", revenue: 2150.80 },
    { date: "Thu", revenue: 2350.20 },
    { date: "Fri", revenue: 3120.60 },
    { date: "Sat", revenue: 2890.40 },
    { date: "Sun", revenue: 2150.90 },
  ],
  month: [
    { date: "Week 1", revenue: 8750.20 },
    { date: "Week 2", revenue: 9210.50 },
    { date: "Week 3", revenue: 10340.80 },
    { date: "Week 4", revenue: 11250.30 },
  ],
};

// =========================================================
// TOP PRODUCTS DATA
// =========================================================

const topProducts = [
  { name: "Grilled Salmon", revenue: 906.50 },
  { name: "Pasta Carbonara", revenue: 490.10 },
  { name: "Caesar Wrap", revenue: 347.50 },
  { name: "Caesar Salad", revenue: 337.50 },
  { name: "Beef Burger", revenue: 321.30 },
];

// =========================================================
// AI RECOMMENDATIONS DATA
// =========================================================

const recommendations = [
  {
    title: "Uneven weekly demand pattern",
    confidence: "medium",
    description:
      "Orders vary significantly by day of week, with Friday being the busiest and Tuesday the slowest.",
    action:
      "Consider offering special promotions on slow days to smooth demand and improve staff utilization.",
    impact:
      "Balancing demand across the week can increase overall revenue and efficiency.",
  },
  {
    title: "Top performer: Grilled Salmon",
    confidence: "high",
    description:
      "Grilled Salmon is your top-selling item with 38 units sold, generating €931 in revenue.",
    action:
      "Consider featuring this item more prominently, creating combo deals, or ensuring consistent availability.",
    impact:
      "Leveraging your best-seller can increase average order value and customer satisfaction.",
  },
  {
    title: "Uneven weekly demand pattern",
    confidence: "medium",
    description:
      "Orders vary significantly by day of week, with Friday being the busiest and Tuesday the slowest.",
    action:
      "Consider offering special promotions on slow days to smooth demand and improve staff utilization.",
    impact:
      "Balancing demand across the week can increase overall revenue and efficiency.",
  },
  {
    title: "Top performer: Grilled Salmon",
    confidence: "high",
    description:
      "Grilled Salmon is your top-selling item with 38 units sold, generating €931 in revenue.",
    action:
      "Consider featuring this item more prominently, creating combo deals, or ensuring consistent availability.",
    impact:
      "Leveraging your best-seller can increase average order value and customer satisfaction.",
  },
  {
    title: "Uneven weekly demand pattern",
    confidence: "medium",
    description:
      "Orders vary significantly by day of week, with Friday being the busiest and Tuesday the slowest.",
    action:
      "Consider offering special promotions on slow days to smooth demand and improve staff utilization.",
    impact:
      "Balancing demand across the week can increase overall revenue and efficiency.",
  },
  {
    title: "Top performer: Grilled Salmon",
    confidence: "high",
    description:
      "Grilled Salmon is your top-selling item with 38 units sold, generating €931 in revenue.",
    action:
      "Consider featuring this item more prominently, creating combo deals, or ensuring consistent availability.",
    impact:
      "Leveraging your best-seller can increase average order value and customer satisfaction.",
  },
];

// =========================================================
// STATS DATA BY PERIOD
// =========================================================

const statsData = {
  day: {
    revenue: 4696.34,
    revenueChange: 6.7,
    orders: 103,
    avgOrderValue: 45.60,
    avgOrderChange: 9.6,
  },
  week: {
    revenue: 32750.80,
    revenueChange: 12.3,
    orders: 720,
    avgOrderValue: 45.49,
    avgOrderChange: 8.2,
  },
  month: {
    revenue: 142850.60,
    revenueChange: 18.5,
    orders: 3140,
    avgOrderValue: 45.49,
    avgOrderChange: 10.1,
  },
};

// =========================================================
// DASHBOARD PAGE
// =========================================================

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");

  const currentStats = statsData[activeTab];
  const currentRevenueData = revenueTrendData[activeTab];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back! Here's how your restaurant is performing.
            </p>
          </div>

          <div className="dashboard-tabs">
            <span
              className={`tab ${activeTab === "day" ? "active" : ""}`}
              onClick={() => setActiveTab("day")}
            >
              Day
            </span>
            <span
              className={`tab ${activeTab === "week" ? "active" : ""}`}
              onClick={() => setActiveTab("week")}
            >
              Week
            </span>
            <span
              className={`tab ${activeTab === "month" ? "active" : ""}`}
              onClick={() => setActiveTab("month")}
            >
              Month
            </span>
          </div>
        </div>

        {/* =====================================================
            STATS CARDS
        ===================================================== */}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">
              €{currentStats.revenue.toFixed(2)}
            </div>
            <div className={`stat-change ${currentStats.revenueChange >= 0 ? "positive" : "negative"}`}>
              {currentStats.revenueChange >= 0 ? "↑" : "↓"} {Math.abs(currentStats.revenueChange)}%
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Orders</div>
            <div className="stat-value">{currentStats.orders}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Avg. Order Value</div>
            <div className="stat-value">
              €{currentStats.avgOrderValue.toFixed(2)}
            </div>
            <div className={`stat-change ${currentStats.avgOrderChange >= 0 ? "positive" : "negative"}`}>
              {currentStats.avgOrderChange >= 0 ? "↑" : "↓"} {Math.abs(currentStats.avgOrderChange)}%
            </div>
          </div>
        </div>

        {/* =====================================================
            REVENUE TREND & TOP PRODUCTS
        ===================================================== */}

        <div className="dashboard-row">
          {/* Revenue Trend */}
          <div className="dashboard-col">
            <div className="card">
              <h3 className="card-title">Revenue Trend</h3>

              <div className="revenue-table">
                <div className="revenue-table-header">
                  <span>Date</span>
                  <span>Revenue</span>
                </div>

                {currentRevenueData.map((item) => (
                  <div className="revenue-table-row" key={item.date}>
                    <span>{item.date}</span>
                    <span>€{item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-col">
            <div className="card">
              <h3 className="card-title">Top Products</h3>

              <div className="top-products-table">
                <div className="top-products-header">
                  <span>Product</span>
                  <span>Revenue</span>
                </div>

                {topProducts.map((product) => (
                  <div className="top-products-row" key={product.name}>
                    <span>{product.name}</span>
                    <span>€{product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            AI RECOMMENDATIONS - FULL WIDTH
        ===================================================== */}

        <div className="ai-recommendations-section">
          <div className="ai-recommendations-header">
            <h2 className="section-title">AI Recommendations</h2>
            <span className="ai-badge">AI Powered</span>
          </div>

          <div className="recommendations-grid-full">
            {recommendations.map((rec, index) => (
              <div className="recommendation-card-full" key={index}>
                <div className="recommendation-header">
                  <h4 className="recommendation-title">{rec.title}</h4>
                  <span className={`confidence-badge ${rec.confidence}`}>
                    {rec.confidence} confidence
                  </span>
                </div>

                <p className="recommendation-description">
                  {rec.description}
                </p>

                <div className="recommendation-action">
                  <strong>Suggested Action:</strong> {rec.action}
                </div>

                <div className="recommendation-impact">
                  <strong>Expected Impact:</strong> {rec.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}