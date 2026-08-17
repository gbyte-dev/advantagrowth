// app/superadmin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";

export default function SuperAdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("superAdminSidebarCollapsed");
    if (saved === "true") setSidebarCollapsed(true);

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
    return () => window.removeEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
  }, []);

  return (
    <div className="superadmin-layout">
      <SuperAdminSidebar />
      <main className={`superadmin-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            {/* Your super admin dashboard content here */}
            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">
                  <div className="page-badge" style={{ background: "#f5f3ff", border: "1px solid #d8b4fe" }}>
                    <i className="fas fa-shield-alt" style={{ color: "#7c3aed" }}></i>
                    <span style={{ color: "#7c3aed" }}>Super Admin</span>
                  </div>
                  <h1>Super Admin Dashboard</h1>
                  <p>Manage all restaurants and system settings from one place</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}