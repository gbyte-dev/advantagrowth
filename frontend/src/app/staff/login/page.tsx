"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { staffLogin } from "@/services/auth";

export default function StaffLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await staffLogin(form);

      // Clear previous session
      localStorage.clear();

      // Save staff session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Update Navbar / Auth state
      window.dispatchEvent(new Event("storage"));

      // Redirect to Staff Dashboard
      router.replace("/staff/dashboard");
    } catch (error: any) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding staff-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-utensils"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Staff Portal</h1>
            <p>Access your restaurant management dashboard. Manage orders, handle reservations, and serve customers efficiently.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-clipboard-list"></i>
                <span>Order Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-calendar-alt"></i>
                <span>Table Reservations</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-bell"></i>
                <span>Real-time Notifications</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-bar"></i>
                <span>Daily Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge staff-badge-form">
                <i className="fas fa-user-tie"></i>
                <span>Staff Access</span>
              </div>
              <h2>Staff Login</h2>
              <p>Login to access your restaurant staff panel</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    className={errors.username ? "input-error" : ""}
                    autoComplete="username"
                  />
                </div>
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? "input-error" : ""}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* Forgot Password */}
              <div className="form-row">
                <div></div>
                <Link href="/staff/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Logging In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Customer Section */}
            <div className="owner-section customer-section">
              <div className="owner-section-header">
                <i className="fas fa-user"></i>
                <div>
                  <h3>Are you a Customer?</h3>
                  <p>Access your personal account for reservations & orders</p>
                </div>
              </div>
              <Link href="/customer/login" className="owner-register-btn customer-register-btn">
                <i className="fas fa-user-plus"></i>
                Customer Login
              </Link>
            </div>

            {/* Owner Login Link */}
            <p className="auth-switch">
              Restaurant Owner?{" "}
              <Link href="/owner/login">Owner Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}