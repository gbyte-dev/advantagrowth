"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function TopBar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const token = sessionStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      if (token) {
        let logoutUrl = "/auth/logout";

        if (role === "staff") {
          logoutUrl = "/auth/staff/logout";
        }

        await api.post(
          logoutUrl,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local session even if API logout fails
      sessionStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      window.dispatchEvent(new Event("storage"));

      // Redirect according to role
      if (role === "staff") {
        router.replace("/owner/login");
      } else if (role === "super_admin") {
        router.replace("/superadmin/login");
      } else {
        router.replace("/owner/login");
      }

      setLoggingOut(false);
    }
  };

  return (
    <div className="advanta-topbar">
      <div className="advanta-topbar-left">
        <span>⚡</span>
        <strong>Advanta Growth</strong>
        <span className="topbar-divider">|</span>
        <span>Restaurant Management Platform</span>
      </div>

      <div className="advanta-topbar-right">
        <span className="topbar-support">
          Support: support@advantagrowth.com
        </span>

        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}