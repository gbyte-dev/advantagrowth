"use client";

import Link from "next/link";

// =========================================================
// DASHBOARD STATS
// =========================================================

const statsData = [
  {
    title: "Total Sales",
    value: "2,478",
    change: "+16.5%",
    changeType: "positive",
    vsChange: "-1.6%",
    vsType: "negative",
    icon: "fa-chart-line",
    color: "#6c5ce7",
  },
  {
    title: "Orders",
    value: "368",
    change: "+12.7%",
    changeType: "positive",
    vsChange: "+0.9%",
    vsType: "positive",
    icon: "fa-shopping-bag",
    color: "#00b894",
  },
  {
    title: "Revenue",
    value: "€6,842",
    change: "+12.3%",
    changeType: "positive",
    vsChange: "+1.8%",
    vsType: "positive",
    icon: "fa-euro-sign",
    color: "#0984e3",
  },
  {
    title: "Avg Order Value",
    value: "€18.59",
    change: "+1.2%",
    changeType: "positive",
    vsChange: "-1.4%",
    vsType: "negative",
    icon: "fa-receipt",
    color: "#fdcb6e",
  },
];

// =========================================================
// TOP ITEMS
// =========================================================

const topItems = [
  {
    name: "Tofu Pasta",
    price: "€15",
    orders: 245,
    revenue: "€3,675",
  },
  {
    name: "Chicken Tikka Masala",
    price: "€14",
    orders: 210,
    revenue: "€2,940",
  },
  {
    name: "Chicken Biryani",
    price: "€13",
    orders: 189,
    revenue: "€2,457",
  },
  {
    name: "Chicken Korma",
    price: "€12",
    orders: 167,
    revenue: "€2,004",
  },
  {
    name: "Chicken Tikka",
    price: "€11",
    orders: 145,
    revenue: "€1,595",
  },
];

// =========================================================
// TRAFFIC DATA
// =========================================================

const trafficData = [
  { month: "Jan", value: 1200 },
  { month: "Feb", value: 1400 },
  { month: "Mar", value: 1800 },
  { month: "Apr", value: 2200 },
  { month: "May", value: 2100 },
  { month: "Jun", value: 2500 },
  { month: "Jul", value: 2800 },
  { month: "Aug", value: 3000 },
  { month: "Sep", value: 3200 },
  { month: "Oct", value: 2800 },
  { month: "Nov", value: 3400 },
  { month: "Dec", value: 3800 },
];

const maxTraffic = Math.max(
  ...trafficData.map((item) => item.value)
);

// =========================================================
// TRAFFIC SOURCES
// =========================================================

const trafficSources = [
  {
    name: "Google Ads",
    value: 45,
    color: "#6c5ce7",
  },
  {
    name: "Facebook Ads",
    value: 28,
    color: "#0984e3",
  },
  {
    name: "Instagram Ads",
    value: 18,
    color: "#e17055",
  },
  {
    name: "YouTube Ads",
    value: 9,
    color: "#00b894",
  },
];

// =========================================================
// QUICK ACTIONS
// =========================================================

const dashboardCards = [
  {
    title: "Restaurant",
    description:
      "Manage restaurant business and operational information.",
    icon: "fa-building",
    href: "/dashboard/restaurant",
    color: "blue",
  },
  {
    title: "Integrations",
    description:
      "Manage connected restaurant services and integrations.",
    icon: "fa-bolt",
    href: "/dashboard/integrations",
    color: "purple",
  },
  {
    title: "Recommendations",
    description:
      "View smart recommendations for your restaurant.",
    icon: "fa-lightbulb",
    href: "/dashboard/recommendations",
    color: "yellow",
  },
];

// =========================================================
// DASHBOARD PAGE
// =========================================================

export default function DashboardPage() {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* =====================================================
            WELCOME
        ===================================================== */}

        <div className="dashboard-welcome">
          <div className="welcome-content">

            <div className="welcome-left">
              <div className="page-badge">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </div>

              <h1>Good Morning, Owner!</h1>

              <p>
                Here's what's happening with your
                restaurant today.
              </p>
            </div>

            <div className="welcome-right">
              <span className="welcome-date">
                <i className="far fa-calendar-alt"></i>
                {today}
              </span>
            </div>

          </div>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="stats-grid">

          {statsData.map((stat) => (
            <div
              key={stat.title}
              className="stat-card"
            >
              <div className="stat-card-header">

                <span className="stat-title">
                  {stat.title}
                </span>

                <div
                  className="stat-icon"
                  style={{
                    background: `${stat.color}15`,
                  }}
                >
                  <i
                    className={`fas ${stat.icon}`}
                    style={{
                      color: stat.color,
                    }}
                  ></i>
                </div>

              </div>

              <div className="stat-value">
                {stat.value}
              </div>

              <div className="stat-changes">

                <span
                  className={`stat-change ${stat.changeType}`}
                >
                  <i
                    className={`fas ${
                      stat.changeType === "positive"
                        ? "fa-arrow-up"
                        : "fa-arrow-down"
                    }`}
                  ></i>

                  {stat.change}
                </span>

                <span className="stat-vs">
                  vs YoY{" "}

                  <span
                    className={stat.vsType}
                  >
                    {stat.vsChange}
                  </span>
                </span>

              </div>
            </div>
          ))}

        </div>

        {/* =====================================================
            TRAFFIC + TOP ITEMS
        ===================================================== */}

        <div className="dashboard-row">

          {/* TRAFFIC */}

          <div className="dashboard-col">

            <div className="dashboard-card">

              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-area"></i>
                  Traffic Over Time
                </h3>

                <span className="card-badge">
                  Last 12 Months
                </span>
              </div>

              <div className="chart-container">

                <div className="chart-bars">

                  {trafficData.map((item) => {
                    const height =
                      (item.value / maxTraffic) * 100;

                    return (
                      <div
                        key={item.month}
                        className="chart-bar-wrapper"
                      >
                        <div
                          className="chart-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        >
                          <span className="chart-bar-tooltip">
                            {item.value}
                          </span>
                        </div>

                        <span className="chart-label">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}

                </div>

              </div>
            </div>

          </div>

          {/* TOP ITEMS */}

          <div className="dashboard-col">

            <div className="dashboard-card">

              <div className="card-header">
                <h3>
                  <i className="fas fa-fire"></i>
                  Top 5 Items
                </h3>

                <span className="card-badge">
                  Popular
                </span>
              </div>

              <div className="top-items-list">

                {topItems.map((item, index) => (
                  <div
                    className="top-item"
                    key={item.name}
                  >

                    <div className="top-item-rank">
                      #{index + 1}
                    </div>

                    <div className="top-item-info">

                      <span className="top-item-name">
                        {item.name}
                      </span>

                      <div className="top-item-meta">
                        <span className="top-item-price">
                          {item.price}
                        </span>

                        <span className="top-item-orders">
                          {item.orders} orders
                        </span>
                      </div>

                    </div>

                    <span className="top-item-revenue">
                      {item.revenue}
                    </span>

                  </div>
                ))}

              </div>
            </div>

          </div>

        </div>

        {/* =====================================================
            TRAFFIC SOURCES
        ===================================================== */}

        <div className="dashboard-row">

          <div className="dashboard-col full-width">

            <div className="dashboard-card">

              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-pie"></i>
                  Traffic Sources
                </h3>

                <span className="card-badge">
                  Current
                </span>
              </div>

              <div className="sources-container">

                {trafficSources.map((source) => (
                  <div
                    className="source-item"
                    key={source.name}
                  >

                    <div className="source-info">
                      <span className="source-name">
                        {source.name}
                      </span>

                      <span className="source-value">
                        {source.value}%
                      </span>
                    </div>

                    <div className="source-bar-track">

                      <div
                        className="source-bar-fill"
                        style={{
                          width: `${source.value}%`,
                          background: source.color,
                        }}
                      ></div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div className="dashboard-section">

          <div className="section-header-row">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your restaurant from one
                place.
              </p>
            </div>
          </div>

          <div className="dashboard-cards-grid">

            {dashboardCards.map((card) => (
              <Link
                href={card.href}
                key={card.href}
                className="dashboard-card-link"
              >

                <div className="dashboard-card">

                  <div
                    className={`card-icon card-icon-${card.color}`}
                  >
                    <i
                      className={`fas ${card.icon}`}
                    ></i>
                  </div>

                  <div className="card-content">

                    <h3>{card.title}</h3>

                    <p>
                      {card.description}
                    </p>

                  </div>

                  <div className="card-footer">

                    <span className="card-action">
                      Open
                    </span>

                    <i className="fas fa-arrow-right card-arrow"></i>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}