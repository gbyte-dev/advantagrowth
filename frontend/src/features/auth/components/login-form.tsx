"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/auth";

export default function OwnerLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    login: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;

    const newErrors = {
      login: "",
      password: "",
    };

    if (!form.login.trim()) {
      newErrors.login = "Email or Staff ID is required";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | OWNER + STAFF UNIFIED LOGIN
      |--------------------------------------------------------------------------
      */

      const res = await login({
        login: form.login.trim(),
        password: form.password,
      });

      /*
      |--------------------------------------------------------------------------
      | Clear Previous Session
      |--------------------------------------------------------------------------
      */

      localStorage.clear();

      /*
      |--------------------------------------------------------------------------
      | Save New Session
      |--------------------------------------------------------------------------
      */

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      /*
      |--------------------------------------------------------------------------
      | Remember Login
      |--------------------------------------------------------------------------
      */

      if (rememberMe) {
        localStorage.setItem(
          "remembered_login",
          form.login.trim()
        );
      } else {
        localStorage.removeItem("remembered_login");
      }

      /*
      |--------------------------------------------------------------------------
      | Update Navbar / Auth State
      |--------------------------------------------------------------------------
      */

      window.dispatchEvent(new Event("storage"));

      /*
      |--------------------------------------------------------------------------
      | Role Based Redirect
      |--------------------------------------------------------------------------
      */

      if (res.data.role === "owner") {
        router.replace("/dashboard");
        return;
      }

      if (res.data.role === "staff") {
        router.replace("/staff/dashboard");
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Unknown Role
      |--------------------------------------------------------------------------
      */

      localStorage.clear();

      alert("Unauthorized account role.");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page owner-login-page">
      <div className="auth-wrapper balanced-wrapper">

        {/* =========================================================
            LEFT SIDE - BRANDING
        ========================================================= */}

        <div className="auth-branding owner-branding balanced-branding">
          <div className="branding-content">

            <Link
              href="/"
              className="branding-logo balanced-logo"
            >
              <i className="fas fa-crown"></i>
              <span>Advanta Growth</span>
            </Link>

            <h1>Restaurant Portal</h1>

            <p>
              Sign in to manage your restaurant,
              monitor operations, manage staff,
              and grow your business.
            </p>

            <div className="branding-features balanced-features">

              <div className="feature-item balanced-feature">
                <i className="fas fa-chart-line"></i>
                <span>Sales Analytics</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-users-cog"></i>
                <span>Staff Management</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-boxes"></i>
                <span>Inventory Control</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-file-invoice-dollar"></i>
                <span>Financial Reports</span>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT SIDE - LOGIN FORM
        ========================================================= */}

        <div className="auth-form-section balanced-form-section">
          <div className="auth-form-container balanced-form-container">

            {/* Header */}

            <div className="auth-form-header balanced-header">

              <div className="form-badge owner-badge-form balanced-badge">
                <i className="fas fa-sign-in-alt"></i>
                <span>Restaurant Access</span>
              </div>

              <h2>Welcome Back</h2>

              <p>
                Sign in as Owner or Staff
              </p>

            </div>

            {/* =====================================================
                LOGIN FORM
            ===================================================== */}

            <form
              onSubmit={handleSubmit}
              className="auth-form balanced-form"
            >

              {/* Login Field */}

              <div className="form-group balanced-group">

                <label htmlFor="login">
                  Email / Staff ID
                </label>

                <div className="input-wrapper balanced-input-wrapper">

                  <i className="fas fa-user input-icon"></i>

                  <input
                    id="login"
                    type="text"
                    name="login"
                    placeholder="Enter email or Staff ID"
                    value={form.login}
                    onChange={handleChange}
                    className={
                      errors.login
                        ? "input-error"
                        : ""
                    }
                    autoComplete="username"
                  />

                </div>

                {errors.login && (
                  <span className="error-message balanced-error">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.login}
                  </span>
                )}

              </div>

              {/* Password Field */}

              <div className="form-group balanced-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper balanced-input-wrapper">

                  <i className="fas fa-lock input-icon"></i>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className={
                      errors.password
                        ? "input-error"
                        : ""
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <i
                      className={`fas ${
                        showPassword
                          ? "fa-eye-slash"
                          : "fa-eye"
                      }`}
                    ></i>
                  </button>

                </div>

                {errors.password && (
                  <span className="error-message balanced-error">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {errors.password}
                  </span>
                )}

              </div>

              {/* Remember Me + Forgot Password */}

              <div className="form-row balanced-row">

                <div className="remember-me">

                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <label htmlFor="remember">
                    Remember me
                  </label>

                </div>

                <Link
                  href="/owner/forgot-password"
                  className="forgot-password"
                >
                  Forgot Password?
                </Link>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                className="submit-btn balanced-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Sign In
                  </>
                )}

              </button>

            </form>

            {/* Register Link */}

            <p className="auth-switch balanced-switch">

              New Restaurant Owner?{" "}

              <Link href="/owner/register">
                Register Here
              </Link>

            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
