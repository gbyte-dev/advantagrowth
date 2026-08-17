"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ownerLogin } from "@/services/auth";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await ownerLogin(form);

      // Clear previous login session
      localStorage.clear();

      // Save new login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Remember me
      if (rememberMe) {
        localStorage.setItem("remembered_owner_email", form.email);
      } else {
        localStorage.removeItem("remembered_owner_email");
      }

      // Update Navbar
      window.dispatchEvent(new Event("storage"));

      // Redirect
      router.replace("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding owner-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-crown"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Owner Portal</h1>
            <p>Access your complete restaurant management dashboard. Monitor sales, manage staff, and grow your business.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Sales Analytics</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-users-cog"></i>
                <span>Staff Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-boxes"></i>
                <span>Inventory Control</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-file-invoice-dollar"></i>
                <span>Financial Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge owner-badge-form">
                <i className="fas fa-crown"></i>
                <span>Owner Access</span>
              </div>
              <h2>Owner Login</h2>
              <p>Sign in to your restaurant management dashboard</p>
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
                    placeholder="Enter your email"
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

              {/* Remember Me & Forgot Password */}
              <div className="form-row">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link href="/owner/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
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

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Admin Section */}
            <div className="owner-section admin-section">
              <div className="owner-section-header">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <h3>Super Admin?</h3>
                  <p>Access the super admin panel for system management</p>
                </div>
              </div>
              <Link href="/superadmin/login" className="owner-register-btn admin-register-btn">
                <i className="fas fa-shield-alt"></i>
                Admin Login
              </Link>
            </div>

            {/* Register Link */}
            <p className="auth-switch">
              New restaurant owner?{" "}
              <Link href="/owner/register">Register Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}