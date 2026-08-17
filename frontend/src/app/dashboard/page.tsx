"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const dashboardCards = [
  {
    title: "Restaurant Info",
    description: "Update restaurant information, logo and branding.",
    icon: "fa-store",
    href: "/dashboard/branding",
    color: "blue",
  },
  {
    title: "Menu Management",
    description: "Create categories, menu items and pricing.",
    icon: "fa-utensils",
    href: "/dashboard/menu",
    color: "green",
  },
  {
    title: "Staff Management",
    description: "Add chefs, waiters and cashiers.",
    icon: "fa-users",
    href: "/dashboard/staff",
    color: "purple",
  },
  {
    title: "Orders & Reservations",
    description: "Track online orders and reservations.",
    icon: "fa-shopping-cart",
    href: "/dashboard/ordering",
    color: "orange",
  },
  {
    title: "Ratings & Reviews",
    description: "Monitor ratings and customer feedback.",
    icon: "fa-star",
    href: "/dashboard/reviews",
    color: "yellow",
  },
  {
    title: "Contact & Social",
    description: "Update phone numbers, address and social media.",
    icon: "fa-address-book",
    href: "/dashboard/contact",
    color: "red",
  },
];

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="owner-layout">
      <main className={`owner-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">
                  <div className="page-badge">
                    <i className="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                  </div>
                  <h1>Owner Dashboard</h1>
                  <p>Welcome to Advanta POS. Manage everything about your restaurant from one place.</p>
                </div>
                <div className="welcome-illustration">
                  <i className="fas fa-chart-pie"></i>
                </div>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Manage your restaurant from a single dashboard</p>
                </div>
              </div>

              <div className="dashboard-cards-grid">
                {dashboardCards.map((card, index) => (
                  <Link href={card.href} key={index} className="dashboard-card">
                    <div className={`card-icon card-icon-${card.color}`}>
                      <i className={`fas ${card.icon}`}></i>
                    </div>
                    <div className="card-content">
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                    <div className="card-footer">
                      <span className="card-action">Manage</span>
                      <i className="fas fa-arrow-right card-arrow"></i>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}