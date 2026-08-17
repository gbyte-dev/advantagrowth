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
      router.replace("/staff/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setStaff(parsedUser);
    } catch {
      localStorage.clear();
      router.replace("/staff/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    router.replace("/staff/login");
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

  return (
    <div className="staff-layout">
      <StaffSidebar />

      <main className="staff-main-content">
        <div className="dashboard-page">
          <div className="dashboard-container">

            {/* Welcome */}
            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">

                  <div className="staff-badge-header">
                    <i className="fas fa-user-tie"></i>
                    <span>Staff Panel</span>
                  </div>

                  <h1>
                    Welcome, {staffName}!
                  </h1>

                  <p>
                    You are Staff ({formattedRole})
                  </p>

                </div>

                <div className="welcome-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => router.push("/staff/menu")}
                  >
                    <i className="fas fa-utensils"></i>
                    View Menu
                  </button>

                  <button
                    className="logout-btn-outline"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Staff Role Card */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>
                    Staff Dashboard
                  </h2>

                  <p>
                    Manage your assigned restaurant tasks.
                  </p>
                </div>
              </div>

              <div className="stats-row">

                {/* Staff */}
                <div className="stat-item">
                  <div className="stat-icon stat-icon-blue">
                    <i className="fas fa-user-tie"></i>
                  </div>

                  <div className="stat-info">
                    <h3>{formattedRole}</h3>
                    <p>Your Position</p>
                  </div>
                </div>

                {/* Menu */}
                <div
                  className="stat-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push("/staff/menu")}
                >
                  <div className="stat-icon stat-icon-green">
                    <i className="fas fa-utensils"></i>
                  </div>

                  <div className="stat-info">
                    <h3>Menu</h3>
                    <p>View Restaurant Menu</p>
                  </div>
                </div>

                {/* Orders */}
                <div className="stat-item">
                  <div className="stat-icon stat-icon-purple">
                    <i className="fas fa-shopping-cart"></i>
                  </div>

                  <div className="stat-info">
                    <h3>Orders</h3>
                    <p>Coming Soon</p>
                  </div>
                </div>

                {/* Reservations */}
                <div className="stat-item">
                  <div className="stat-icon stat-icon-red">
                    <i className="fas fa-calendar-alt"></i>
                  </div>

                  <div className="stat-info">
                    <h3>Reservations</h3>
                    <p>Coming Soon</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">

              <div className="section-header-row">
                <div>
                  <h2>Quick Actions</h2>

                  <p>
                    Access the features available to your staff role.
                  </p>
                </div>
              </div>

              <div className="welcome-actions">

                <button
                  className="primary-btn"
                  onClick={() => router.push("/staff/menu")}
                >
                  <i className="fas fa-utensils"></i>
                  View Restaurant Menu
                </button>

              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}