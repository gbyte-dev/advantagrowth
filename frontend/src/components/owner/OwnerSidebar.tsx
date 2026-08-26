"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "fa-home",
  },
  {
    name: "Restaurant",
    href: "/dashboard/restaurant",
    icon: "fa-building",
  },
  {
    name: "Integrations",
    href: "/dashboard/integrations",
    icon: "fa-bolt",
  },
  {
    name: "Recommendations",
    href: "/dashboard/recommendations",
    icon: "fa-lightbulb",
  },
  {
    name: "Weather Dashboard",
    href: "/dashboard/weather",
    icon: "fa-cloud-sun",
  },
];

type OwnerInfo = {
  owner_name: string;
  email: string;
};

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [owner, setOwner] =
    useState<OwnerInfo>({
      owner_name: "Restaurant Owner",
      email: "",
    });

  /*
  |--------------------------------------------------------------------------
  | Initial setup
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 1024
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    const saved =
      localStorage.getItem(
        "sidebarCollapsed"
      );

    if (saved === "true") {
      setCollapsed(true);
    }

    /*
    |--------------------------------------------------------------------------
    | Load logged-in owner
    |--------------------------------------------------------------------------
    */

    const loadOwner = async () => {
      try {
        const token =
          sessionStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const response =
          await api.get(
            "/auth/me"
          );

        const user =
          response.data;

        setOwner({
          owner_name:
            user.owner_name ||
            "Restaurant Owner",

          email:
            user.email ||
            "",
        });
      } catch (error) {
        console.error(
          "Sidebar owner load error:",
          error
        );
      }
    };

    loadOwner();

    /*
    |--------------------------------------------------------------------------
    | Live profile update listener
    |--------------------------------------------------------------------------
    */

    const handleProfileUpdated =
      (
        event: Event
      ) => {
        const customEvent =
          event as CustomEvent<{
            owner_name?: string;
            email?: string;
          }>;

        setOwner(
          (current) => ({
            owner_name:
              customEvent.detail
                ?.owner_name ||
              current.owner_name,

            email:
              customEvent.detail
                ?.email ||
              current.email,
          })
        );
      };

    window.addEventListener(
      "ownerProfileUpdated",
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );

      window.removeEventListener(
        "ownerProfileUpdated",
        handleProfileUpdated
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Toggle sidebar
  |--------------------------------------------------------------------------
  */

  const toggleSidebar = () => {
    const newState =
      !collapsed;

    setCollapsed(
      newState
    );

    localStorage.setItem(
      "sidebarCollapsed",
      String(newState)
    );

    window.dispatchEvent(
      new CustomEvent(
        "sidebarToggle",
        {
          detail: {
            collapsed:
              newState,
          },
        }
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Mobile sidebar close
  |--------------------------------------------------------------------------
  */

  const handleMobileLinkClick =
    () => {
      if (!isMobile) {
        return;
      }

      setCollapsed(true);

      localStorage.setItem(
        "sidebarCollapsed",
        "true"
      );

      window.dispatchEvent(
        new CustomEvent(
          "sidebarToggle",
          {
            detail: {
              collapsed: true,
            },
          }
        )
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    sessionStorage.clear();

    window.dispatchEvent(
      new Event("storage")
    );

    router.replace(
      "/owner/login"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Active menu
  |--------------------------------------------------------------------------
  */

  const isActive = (
    href: string
  ) => {
    if (
      href === "/dashboard"
    ) {
      return (
        pathname ===
        "/dashboard"
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };

  const profileActive =
    pathname ===
    "/dashboard/profile" ||
    pathname.startsWith(
      "/dashboard/profile/"
    );

  return (
    <>
      {/* Mobile Overlay */}

      <div
        className={`sidebar-overlay ${isMobile &&
            !collapsed
            ? "sidebar-overlay-visible"
            : ""
          }`}
        onClick={
          toggleSidebar
        }
      />

      <aside
        className={`owner-sidebar ${collapsed
            ? "sidebar-collapsed"
            : ""
          }`}
      >
        {/* Sidebar Header */}

        <div className="sidebar-header">
          <Link
            href="/dashboard"
            className="sidebar-logo"
            onClick={
              handleMobileLinkClick
            }
          >
            <i className="fas fa-bolt sidebar-logo-icon" />

            {!collapsed && (
              <span>
                Advanta
              </span>
            )}
          </Link>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={
              toggleSidebar
            }
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
              className={`fas fa-${collapsed
                  ? "chevron-right"
                  : "chevron-left"
                }`}
            />
          </button>
        </div>

        {/* Main Navigation */}

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {menus.map(
              (menu) => {
                const active =
                  isActive(
                    menu.href
                  );

                return (
                  <Link
                    key={
                      menu.href
                    }
                    href={
                      menu.href
                    }
                    className={`sidebar-link ${active
                        ? "sidebar-link-active"
                        : ""
                      }`}
                    title={
                      collapsed
                        ? menu.name
                        : ""
                    }
                    onClick={
                      handleMobileLinkClick
                    }
                  >
                    <i
                      className={`fas ${menu.icon} sidebar-link-icon`}
                    />

                    {!collapsed && (
                      <span>
                        {menu.name}
                      </span>
                    )}

                    {active &&
                      !collapsed && (
                        <span className="sidebar-active-indicator" />
                      )}
                  </Link>
                );
              }
            )}
          </div>

          {/* Logout */}

          <div className="sidebar-section sidebar-section-bottom">
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="sidebar-link sidebar-logout"
              title={
                collapsed
                  ? "Logout"
                  : ""
              }
            >
              <i className="fas fa-sign-out-alt sidebar-link-icon" />

              {!collapsed && (
                <span>
                  Logout
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer / Profile */}

        <div className="sidebar-footer">
          <Link
            href="/dashboard/profile"
            onClick={
              handleMobileLinkClick
            }
            className={`sidebar-user-info ${profileActive
                ? "sidebar-user-info-active"
                : ""
              }`}
            title={
              collapsed
                ? "Profile"
                : ""
            }
            style={{
              textDecoration:
                "none",

              color:
                "inherit",

              cursor:
                "pointer",
            }}
          >
            <div className="sidebar-user-avatar">
              <i className="fas fa-user" />
            </div>

            {!collapsed && (
              <div className="sidebar-user-details">
                <p className="sidebar-user-name">
                  {
                    owner.owner_name
                  }
                </p>

                <p className="sidebar-user-role">
                  {owner.email ||
                    "Owner Account"}
                </p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}