"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerLogin } from "@/services/auth";

export default function CustomerLoginPage() {
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
      const response = await customerLogin(form);

      // Clear previous session
      localStorage.clear();

      // Save current login
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", "customer");
      localStorage.setItem("user", JSON.stringify(response.data.customer));

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("remembered_email", form.email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      // Refresh Navbar
      window.dispatchEvent(new Event("storage"));

      // Redirect
      router.replace("/customer/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding customer-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-chart-line"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Welcome Back!</h1>
            <p>Sign in to access your account, view reservations, and enjoy exclusive member benefits.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-calendar-check"></i>
                <span>Manage your reservations</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shopping-bag"></i>
                <span>Track your orders</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-heart"></i>
                <span>Save favorite restaurants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Customer Login</h2>
              <p>Enter your credentials to access your account</p>
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
                <Link href="/forgot-password" className="forgot-password">
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

            {/* Staff Section */}
            <div className="owner-section staff-section">
              <div className="owner-section-header">
                <i className="fas fa-users"></i>
                <div>
                  <h3>Restaurant Staff?</h3>
                  <p>Access your staff dashboard to manage operations</p>
                </div>
              </div>
              <Link href="/staff/login" className="owner-register-btn staff-register-btn">
                <i className="fas fa-user-tie"></i>
                Staff Login
              </Link>
            </div>

            {/* Register Link */}
            <p className="auth-switch">
              Don't have an account?{" "}
              <Link href="/customer/register">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}