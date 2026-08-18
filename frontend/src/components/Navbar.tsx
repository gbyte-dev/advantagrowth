"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAuth = () => {
      const savedRole = localStorage.getItem("role");

      if (
        savedRole === "owner" ||
        savedRole === "super_admin" ||
        savedRole === "staff"
      ) {
        setRole(savedRole);
      } else {
        setRole("");
      }
    };

    updateAuth();
    window.addEventListener("storage", updateAuth);

    // Scroll effect for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Close mobile menu on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setRole("");
    window.dispatchEvent(new Event("storage"));
    setIsMobileMenuOpen(false);
    router.replace("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <Link href="/" className="logo-link">
            <i className="fas fa-chart-line logo-icon"></i>
            <span className="logo-text">
              Advanta<span className="logo-highlight">Growth</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop-menu">
          {/* Guest Navigation */}
          {!role && (
            <>
              <Link href="/" className="nav-link">
                <i className="fas fa-home nav-link-icon"></i>
                Home
              </Link>
              <Link href="/owner/login" className="nav-link nav-link-owner">
                <i className="fas fa-crown nav-link-icon"></i>
                Login
              </Link>
            </>
          )}

          {/* Owner Navigation */}
          {role === "owner" && (
            <>
              <Link href="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                <i className="fas fa-tachometer-alt nav-link-icon"></i>
                Dashboard
              </Link>
              <div className="navbar-user-section">
                <span className="user-role-badge owner-badge">
                  <i className="fas fa-crown"></i> Owner
                </span>
                <button onClick={logout} className="logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </>
          )}

          {/* Staff Navigation */}
          {role === "staff" && (
            <>
              <Link href="/staff/dashboard" className="nav-link" onClick={closeMobileMenu}>
                <i className="fas fa-tachometer-alt nav-link-icon"></i>
                Dashboard
              </Link>
              <div className="navbar-user-section">
                <span className="user-role-badge staff-badge">
                  <i className="fas fa-user-tie"></i> Staff
                </span>
                <button onClick={logout} className="logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </>
          )}

          {/* Super Admin Navigation */}
          {role === "super_admin" && (
            <>
              <Link href="/superadmin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                <i className="fas fa-tachometer-alt nav-link-icon"></i>
                Dashboard
              </Link>
              <div className="navbar-user-section">
                <span className="user-role-badge admin-badge">
                  <i className="fas fa-shield-alt"></i> Super Admin
                </span>
                <button onClick={logout} className="logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        ref={mobileMenuRef}
        className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
      >
        <div className="mobile-menu-content">
          {!role && (
            <>
              <Link href="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                <i className="fas fa-home"></i> Home
              </Link>
              <Link href="/owner/login" className="mobile-nav-link owner-link" onClick={closeMobileMenu}>
                <i className="fas fa-crown"></i> Owner Portal
              </Link>
            </>
          )}

          {role && (
            <>
              {role === "owner" && (
                <Link href="/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              )}
              {role === "staff" && (
                <Link href="/staff/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              )}
              {role === "super_admin" && (
                <Link href="/superadmin/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              )}
              <div className="mobile-user-info">
                <span className="mobile-user-role">{role.replace("_", " ")}</span>
              </div>
              <button onClick={logout} className="mobile-logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}