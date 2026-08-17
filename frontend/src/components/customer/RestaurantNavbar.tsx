"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type RestaurantNavbarProps = {
  restaurant: {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
};

export default function RestaurantNavbar({
  restaurant,
}: RestaurantNavbarProps) {
  const [activeSection, setActiveSection] = useState("home");

  const restaurantPath =
    `/customer/restaurant/${restaurant.slug}`;
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  const navItems = [
    {
      label: "Home",
      href: restaurantPath,
      key: "home",
    },
    {
      label: "About",
      href: `${restaurantPath}#about`,
      key: "about",
    },
    {
      label: "Menu",
      href: `${restaurantPath}#menu`,
      key: "menu",
    },
    {
      label: "Staffs",
      href: `${restaurantPath}/#staff`,
      key: "staffs",
    },
    {
      label: "Reservation",
      href: `${restaurantPath}/#reservation`,
      key: "reservation",
    },
    {
      label: "Reviews",
      href: `${restaurantPath}#reviews`,
      key: "reviews",
    },
    {
      label: "Contact",
      href: `${restaurantPath}#contact-section`,
      key: "contact",
    },
  ];

  useEffect(() => {
    const updateActiveSection = () => {
      const hash = window.location.hash.replace("#", "");

      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection("home");
      }
    };

    updateActiveSection();

    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      window.removeEventListener(
        "hashchange",
        updateActiveSection
      );
    };
  }, []);

  return (
    <header className="restaurant-navbar-wrapper">
<nav
  className={`restaurant-main-navbar ${
    isScrolled ? "restaurant-navbar-scrolled" : ""
  }`}
>        <div className="restaurant-navbar-inner">

          {/* LOGO */}

          <Link
            href={restaurantPath}
            className="restaurant-brand"
            onClick={() => setActiveSection("home")}
          >
            <div className="restaurant-logo">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                />
              ) : (
                <span>🍴</span>
              )}
            </div>

            <div className="restaurant-brand-text">
              <strong>{restaurant.name}</strong>

              <small>
                FAST FOOD & RESTAURANT
              </small>
            </div>
          </Link>

          {/* NAVIGATION */}

          <div className="restaurant-nav-links">
            {navItems.map((item) => {
              const isActive =
                activeSection === item.key;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setActiveSection(item.key)
                  }
                  className={
                    isActive
                      ? "restaurant-nav-link active"
                      : "restaurant-nav-link"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE */}

          <div className="restaurant-nav-actions">

            <Link
              href={`${restaurantPath}/menu`}
              className="restaurant-order-btn"
            >
              🛍 Order Now
            </Link>

          </div>

        </div>
      </nav>
    </header>
  );
}