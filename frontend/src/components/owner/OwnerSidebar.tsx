"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "fa-tachometer-alt",
  },
  {
    name: "Basic Info & Branding",
    href: "/dashboard/branding",
    icon: "fa-store",
  },
  {
    name: "Menu Management",
    href: "/dashboard/menu",
    icon: "fa-utensils",
  },
  {
    name: "Staff Management",
    href: "/dashboard/staff",
    icon: "fa-users",
  },
  {
    name: "Ordering & Reservations",
    href: "/dashboard/ordering",
    icon: "fa-shopping-cart",
  },
  {
    name: "Rating & Reviews",
    href: "/dashboard/reviews",
    icon: "fa-star",
  },
  {
    name: "Messages",
    href: "/dashboard/contact-messages",
    icon: "fa-envelope",
  },
];

const bottomMenus = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "fa-cog",
  },
  {
    name: "Help & Support",
    href: "/dashboard/support",
    icon: "fa-question-circle",
  },
];

export default function OwnerSidebar() {
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

    const saved = localStorage.getItem("sidebarCollapsed");

    if (saved === "true") {
      setCollapsed(true);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;

    setCollapsed(newState);

    localStorage.setItem(
      "sidebarCollapsed",
      String(newState)
    );

    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: {
          collapsed: newState,
        },
      })
    );
  };

  const handleMobileLinkClick = () => {
    if (!isMobile) return;

    setCollapsed(true);

    localStorage.setItem(
      "sidebarCollapsed",
      "true"
    );

    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: {
          collapsed: true,
        },
      })
    );
  };

  const handleLogout = () => {
    localStorage.clear();

    window.dispatchEvent(
      new Event("storage")
    );

    router.replace("/owner/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${
          isMobile && !collapsed
            ? "sidebar-overlay-visible"
            : ""
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`owner-sidebar ${
          collapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link
            href="/dashboard"
            className="sidebar-logo"
            onClick={handleMobileLinkClick}
          >
            <i className="fas fa-crown sidebar-logo-icon"></i>

            {!collapsed && (
              <span>Owner Panel</span>
            )}
          </Link>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <i
              className={`fas fa-${
                collapsed
                  ? "chevron-right"
                  : "chevron-left"
              }`}
            />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!collapsed && (
              <span className="sidebar-section-title">
                Main Menu
              </span>
            )}

            {menus.map((menu) => {
              const active = isActive(menu.href);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`sidebar-link ${
                    active
                      ? "sidebar-link-active"
                      : ""
                  }`}
                  title={
                    collapsed ? menu.name : ""
                  }
                  onClick={
                    handleMobileLinkClick
                  }
                >
                  <i
                    className={`fas ${menu.icon} sidebar-link-icon`}
                  />

                  {!collapsed && (
                    <span>{menu.name}</span>
                  )}

                  {active && !collapsed && (
                    <span className="sidebar-active-indicator" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="sidebar-section sidebar-section-bottom">
            {!collapsed && (
              <span className="sidebar-section-title">
                Other
              </span>
            )}

            {bottomMenus.map((menu) => {
              const active =
                pathname === menu.href ||
                pathname.startsWith(
                  `${menu.href}/`
                );

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`sidebar-link ${
                    active
                      ? "sidebar-link-active"
                      : ""
                  }`}
                  title={
                    collapsed ? menu.name : ""
                  }
                  onClick={
                    handleMobileLinkClick
                  }
                >
                  <i
                    className={`fas ${menu.icon} sidebar-link-icon`}
                  />

                  {!collapsed && (
                    <span>{menu.name}</span>
                  )}

                  {active && !collapsed && (
                    <span className="sidebar-active-indicator" />
                  )}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-link sidebar-logout"
              title={
                collapsed ? "Logout" : ""
              }
            >
              <i className="fas fa-sign-out-alt sidebar-link-icon" />

              {!collapsed && (
                <span>Logout</span>
              )}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <i className="fas fa-user" />
              </div>

              <div className="sidebar-user-details">
                <p className="sidebar-user-name">
                  Restaurant Owner
                </p>

                <p className="sidebar-user-role">
                  Management
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}