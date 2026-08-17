"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const menus = [
  {
    name: "Dashboard",
    href: "/superadmin/dashboard",
    icon: "fa-tachometer-alt",
  },
  {
    name: "Restaurants",
    href: "/superadmin/restaurants",
    icon: "fa-store",
  },
  {
    name: "Owners",
    href: "/superadmin/owners",
    icon: "fa-crown",
  },
  {
    name: "Staff Members",
    href: "/superadmin/staff",
    icon: "fa-users",
  },
  {
    name: "Customers",
    href: "/superadmin/customers",
    icon: "fa-user-friends",
  },
  {
    name: "Subscriptions",
    href: "/superadmin/subscriptions",
    icon: "fa-credit-card",
  },
  {
    name: "Reports & Analytics",
    href: "/superadmin/reports",
    icon: "fa-chart-bar",
  },
  {
    name: "System Settings",
    href: "/superadmin/settings",
    icon: "fa-cogs",
  },
];

const bottomMenus = [
  {
    name: "Help & Support",
    href: "/superadmin/support",
    icon: "fa-question-circle",
  },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const saved = localStorage.getItem("superAdminSidebarCollapsed");
    if (saved === "true") {
      setCollapsed(true);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("superAdminSidebarCollapsed", String(newState));
    window.dispatchEvent(new CustomEvent("superAdminSidebarToggle", { detail: { collapsed: newState } }));
  };

  const handleMobileLinkClick = () => {
    if (isMobile) {
      setCollapsed(true);
      localStorage.setItem("superAdminSidebarCollapsed", "true");
      window.dispatchEvent(new CustomEvent("superAdminSidebarToggle", { detail: { collapsed: true } }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    router.replace("/superadmin/login");
  };

  const isActive = (href: string) => {
    if (href === "/superadmin/dashboard") {
      return pathname === "/superadmin/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isMobile && !collapsed ? "sidebar-overlay-visible" : ""}`}
        onClick={toggleSidebar}
      ></div>

      <aside className={`superadmin-sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link href="/superadmin/dashboard" className="sidebar-logo">
            <i className="fas fa-shield-alt sidebar-logo-icon superadmin-logo-icon"></i>
            {!collapsed && <span>Super Admin</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fas fa-${collapsed ? "chevron-right" : "chevron-left"}`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!collapsed && <span className="sidebar-section-title">Main Menu</span>}

            {menus.map((menu) => {
              const active = isActive(menu.href);
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`sidebar-link ${active ? "sidebar-link-active superadmin-link-active" : ""}`}
                  title={collapsed ? menu.name : ""}
                  onClick={handleMobileLinkClick}
                >
                  <i className={`fas ${menu.icon} sidebar-link-icon`}></i>
                  {!collapsed && <span>{menu.name}</span>}
                  {active && !collapsed && <span className="sidebar-active-indicator superadmin-indicator"></span>}
                </Link>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="sidebar-section sidebar-section-bottom">
            {!collapsed && <span className="sidebar-section-title">Other</span>}

            {bottomMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`sidebar-link ${pathname === menu.href ? "sidebar-link-active superadmin-link-active" : ""}`}
                title={collapsed ? menu.name : ""}
                onClick={handleMobileLinkClick}
              >
                <i className={`fas ${menu.icon} sidebar-link-icon`}></i>
                {!collapsed && <span>{menu.name}</span>}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="sidebar-link sidebar-logout"
              title={collapsed ? "Logout" : ""}
            >
              <i className="fas fa-sign-out-alt sidebar-link-icon"></i>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar superadmin-avatar">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="sidebar-user-details">
                <p className="sidebar-user-name">Super Admin</p>
                <p className="sidebar-user-role">System Control</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}