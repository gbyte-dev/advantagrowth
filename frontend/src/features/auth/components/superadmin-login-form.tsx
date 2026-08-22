"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { superAdminLogin } from "@/services/auth";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
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
    const newErrors = { email: "", password: "" };

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
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
      const res = await superAdminLogin(form);

      // Clear previous login
      sessionStorage.clear();

      // Save Super Admin session
      sessionStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Update Navbar / Auth state
      window.dispatchEvent(new Event("storage"));

      // Redirect
      router.replace("/superadmin/dashboard");
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
        <div className="auth-branding superadmin-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-shield-alt"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Super Admin Portal</h1>
            <p>Access the central control panel. Manage all restaurants, monitor system health, and control platform settings.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-building"></i>
                <span>Multi-Restaurant Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-users-cog"></i>
                <span>Owner Account Control</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-cogs"></i>
                <span>System Configuration</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-pie"></i>
                <span>Global Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge superadmin-badge-form">
                <i className="fas fa-shield-alt"></i>
                <span>Super Admin Access</span>
              </div>
              <h2>Super Admin Login</h2>
              <p>Login to manage all restaurants and system settings</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
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

              {/* Security Notice */}
              <div className="security-notice">
                <i className="fas fa-shield-alt"></i>
                <span>Authorized personnel only. All login attempts are monitored.</span>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn superadmin-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}