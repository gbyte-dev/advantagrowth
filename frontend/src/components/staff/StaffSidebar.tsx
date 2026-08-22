"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StaffRole =
  | "manager"
  | "cashier"
  | "chef"
  | "waiter"
  | "delivery_boy";

type MenuItem = {
  name: string;
  href: string;
  icon: string;
};

const roleMenus: Record<StaffRole, MenuItem[]> = {
  manager: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      name: "Orders",
      href: "/staff/orders",
      icon: "fa-shopping-cart",
    },
    {
      name: "Reservations",
      href: "/staff/reservations",
      icon: "fa-calendar-alt",
    },
    {
      name: "Tables",
      href: "/staff/tables",
      icon: "fa-chair",
    },
    {
      name: "Menu",
      href: "/staff/menu",
      icon: "fa-utensils",
    },
    {
      name: "Kitchen / KOT",
      href: "/staff/kitchen-orders",
      icon: "fa-fire",
    },
    {
      name: "Customers",
      href: "/staff/customers",
      icon: "fa-users",
    },
    {
      name: "Payments",
      href: "/staff/payments",
      icon: "fa-credit-card",
    },
    {
      name: "Staff Management",
      href: "/staff/staff",
      icon: "fa-user-friends",
    },
    {
      name: "Reports",
      href: "/staff/reports",
      icon: "fa-chart-bar",
    },
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: "fa-bell",
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: "fa-user",
    },
  ],

  cashier: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      name: "Orders",
      href: "/staff/orders",
      icon: "fa-shopping-cart",
    },
    {
      name: "Reservations",
      href: "/staff/reservations",
      icon: "fa-calendar-alt",
    },
    {
      name: "Tables",
      href: "/staff/tables",
      icon: "fa-chair",
    },
    {
      name: "Customers",
      href: "/staff/customers",
      icon: "fa-users",
    },
    {
      name: "Payments",
      href: "/staff/payments",
      icon: "fa-credit-card",
    },
    {
      name: "Reports",
      href: "/staff/reports",
      icon: "fa-chart-bar",
    },
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: "fa-bell",
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: "fa-user",
    },
  ],

  chef: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      name: "Kitchen / KOT",
      href: "/staff/kitchen-orders",
      icon: "fa-fire",
    },
    {
      name: "Orders",
      href: "/staff/orders",
      icon: "fa-shopping-cart",
    },
    {
      name: "Menu",
      href: "/staff/menu",
      icon: "fa-utensils",
    },
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: "fa-bell",
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: "fa-user",
    },
  ],

  waiter: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      name: "Orders",
      href: "/staff/orders",
      icon: "fa-shopping-cart",
    },
    {
      name: "Tables",
      href: "/staff/tables",
      icon: "fa-chair",
    },
    {
      name: "Reservations",
      href: "/staff/reservations",
      icon: "fa-calendar-alt",
    },
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: "fa-bell",
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: "fa-user",
    },
  ],

  delivery_boy: [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      name: "Delivery Orders",
      href: "/staff/delivery-orders",
      icon: "fa-motorcycle",
    },
    {
      name: "Customers",
      href: "/staff/customers",
      icon: "fa-users",
    },
    {
      name: "Notifications",
      href: "/staff/notifications",
      icon: "fa-bell",
    },
    {
      name: "Profile",
      href: "/staff/profile",
      icon: "fa-user",
    },
  ],
};

const bottomMenus: MenuItem[] = [
  {
    name: "Help & Support",
    href: "/staff/support",
    icon: "fa-question-circle",
  },
];

function normalizeRole(role: string): StaffRole {
  const normalized = role
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, "_");

  switch (normalized) {
    case "manager":
      return "manager";

    case "cashier":
      return "cashier";

    case "chef":
      return "chef";

    case "waiter":
      return "waiter";

    case "delivery":
    case "deliveryboy":
    case "delivery_boy":
      return "delivery_boy";

    default:
      return "waiter";
  }
}

function formatRole(role: StaffRole) {
  switch (role) {
    case "manager":
      return "Manager";

    case "cashier":
      return "Cashier";

    case "chef":
      return "Chef";

    case "waiter":
      return "Waiter";

    case "delivery_boy":
      return "Delivery Boy";

    default:
      return "Staff";
  }
}

export default function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [staffName, setStaffName] = useState("Staff");
  const [staffRole, setStaffRole] =
    useState<StaffRole>("waiter");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    const saved = localStorage.getItem(
      "staffSidebarCollapsed"
    );

    if (saved === "true") {
      setCollapsed(true);
    }

    const user = localStorage.getItem("user");

    if (user) {
      try {
        const parsedUser = JSON.parse(user);

        setStaffName(
          parsedUser.owner_name ||
            parsedUser.name ||
            "Staff"
        );

        setStaffRole(
          normalizeRole(
            parsedUser.staff_role ||
              parsedUser.role ||
              "waiter"
          )
        );
      } catch {
        setStaffName("Staff");
        setStaffRole("waiter");
      }
    }

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  const menus = roleMenus[staffRole];

  const toggleSidebar = () => {
    const newState = !collapsed;

    setCollapsed(newState);

    localStorage.setItem(
      "staffSidebarCollapsed",
      String(newState)
    );

    window.dispatchEvent(
      new CustomEvent("staffSidebarToggle", {
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
      "staffSidebarCollapsed",
      "true"
    );

    window.dispatchEvent(
      new CustomEvent("staffSidebarToggle", {
        detail: {
          collapsed: true,
        },
      })
    );
  };

  const handleLogout = () => {
    sessionStorage.clear();

    window.dispatchEvent(
      new Event("storage")
    );

    router.replace("/owner/login");
  };

  const isActive = (href: string) => {
    if (href === "/staff/dashboard") {
      return pathname === "/staff/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
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
        {/* Header */}
        <div className="sidebar-header">
          <Link
            href="/staff/dashboard"
            className="sidebar-logo"
            onClick={handleMobileLinkClick}
          >
            <i className="fas fa-user-tie sidebar-logo-icon" />

            {!collapsed && (
              <span>Staff Panel</span>
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

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main Menu */}
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

          {/* Other */}
          <div className="sidebar-section sidebar-section-bottom">
            {!collapsed && (
              <span className="sidebar-section-title">
                Other
              </span>
            )}

            {bottomMenus.map((menu) => {
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

        {/* Staff Profile */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <i className="fas fa-user" />
              </div>

              <div className="sidebar-user-details">
                <p className="sidebar-user-name">
                  {staffName}
                </p>

                <p className="sidebar-user-role">
                  {formatRole(staffRole)}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}