"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "@/components/staff/StaffSidebar";

type StaffUser = {
  owner_name?: string;
  name?: string;
  username?: string;
  staff_role?: string;
  role?: string;
};

export default function StaffDashboard() {
  const router = useRouter();

  const [staff, setStaff] = useState<StaffUser | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/owner/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setStaff(parsedUser);
    } catch {
      sessionStorage.clear();
      router.replace("/owner/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    window.dispatchEvent(new Event("storage"));
    router.replace("/owner/login");
  };

  const staffName =
    staff?.owner_name ||
    staff?.name ||
    staff?.username ||
    "Staff";

  const staffRole = staff?.staff_role || "Staff";

  const formattedRole = staffRole
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Staff-specific stats
  const staffStats = [
    {
      title: "Today's Orders",
      value: "0",
      icon: "fa-shopping-bag",
      color: "#6c5ce7",
      bg: "rgba(108, 92, 231, 0.08)",
    },
    {
      title: "Pending Tasks",
      value: "0",
      icon: "fa-tasks",
      color: "#fdcb6e",
      bg: "rgba(253, 203, 110, 0.08)",
    },
    {
      title: "Active Orders",
      value: "0",
      icon: "fa-clock",
      color: "#00b894",
      bg: "rgba(0, 184, 148, 0.08)",
    },
    {
      title: "Completed",
      value: "0",
      icon: "fa-check-circle",
      color: "#0984e3",
      bg: "rgba(9, 132, 227, 0.08)",
    },
  ];

  const staffQuickActions = [
    {
      title: "View Menu",
      description: "Browse restaurant menu items and prices",
      icon: "fa-utensils",
      href: "/staff/menu",
      color: "green",
    },
    {
      title: "Order Management",
      description: "Track and manage incoming orders",
      icon: "fa-shopping-cart",
      href: "/staff/orders",
      color: "purple",
    },
    {
      title: "Table Management",
      description: "View and manage table reservations",
      icon: "fa-chair",
      href: "/staff/tables",
      color: "orange",
    },
    {
      title: "My Profile",
      description: "View and update your staff profile",
      icon: "fa-user",
      href: "/staff/profile",
      color: "blue",
    },
  ];

  return (
    <div className="staff-dashboard-layout">
      <StaffSidebar />

      <main className="staff-dashboard-main">
        <div className="staff-dashboard-page">
          <div className="staff-dashboard-container">

            {/* ==================== WELCOME SECTION ==================== */}
            <div className="staff-welcome-section">
              <div className="staff-welcome-content">
                <div className="staff-welcome-left">
                  <div className="staff-badge-header">
                    <i className="fas fa-user-tie"></i>
                    <span>Staff Panel</span>
                  </div>
                  <h1 className="staff-welcome-title">
                    Welcome, {staffName}! 
                  </h1>
                  <p className="staff-welcome-subtitle">
                    You are logged in as <strong>{formattedRole}</strong>
                  </p>
                </div>

                <div className="staff-welcome-right">
                  <div className="staff-role-badge">
                    <i className="fas fa-id-badge"></i>
                    <span>{formattedRole}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== STAFF STATS ==================== */}
            <div className="staff-stats-grid">
              {staffStats.map((stat, index) => (
                <div key={index} className="staff-stat-card">
                  <div className="staff-stat-icon" style={{ background: stat.bg }}>
                    <i className={`fas ${stat.icon}`} style={{ color: stat.color }}></i>
                  </div>
                  <div className="staff-stat-info">
                    <h3 className="staff-stat-value">{stat.value}</h3>
                    <p className="staff-stat-title">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ==================== QUICK ACTIONS SECTION ==================== */}
            <div className="staff-section">
              <div className="staff-section-header">
                <div className="staff-section-header-left">
                  <h2>Quick Actions</h2>
                  <p>Access the features available to your staff role</p>
                </div>
              </div>

              <div className="staff-actions-grid">
                {staffQuickActions.map((action, index) => (
                  <div
                    key={index}
                    className="staff-action-card"
                    onClick={() => action.href && router.push(action.href)}
                    style={{ cursor: action.href ? 'pointer' : 'default' }}
                  >
                    <div className={`staff-action-icon staff-action-icon-${action.color}`}>
                      <i className={`fas ${action.icon}`}></i>
                    </div>
                    <div className="staff-action-content">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>
                    <div className="staff-action-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ==================== STAFF INFO CARD ==================== */}
            <div className="staff-section">
              <div className="staff-info-card">
                <div className="staff-info-header">
                  <i className="fas fa-info-circle"></i>
                  <h3>Your Staff Information</h3>
                </div>
                <div className="staff-info-grid">
                  <div className="staff-info-item">
                    <span className="staff-info-label">Name</span>
                    <span className="staff-info-value">{staffName}</span>
                  </div>
                  <div className="staff-info-item">
                    <span className="staff-info-label">Role</span>
                    <span className="staff-info-value">{formattedRole}</span>
                  </div>
                  <div className="staff-info-item">
                    <span className="staff-info-label">Status</span>
                    <span className="staff-info-value staff-status-active">
                      <i className="fas fa-circle"></i> Active
                    </span>
                  </div>
                  <div className="staff-info-item">
                    <span className="staff-info-label">Department</span>
                    <span className="staff-info-value">Restaurant Operations</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}