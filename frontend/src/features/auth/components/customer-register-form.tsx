"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerRegister } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      await customerRegister(form);
      alert("Registration successful! Please login.");
      router.push("/customer/login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-chart-line"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Start Your Journey</h1>
            <p>Create your account and experience seamless restaurant management.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Easy table reservations</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Quick online ordering</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Exclusive member benefits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? "input-error" : ""}
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

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

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <i className="fas fa-phone input-icon"></i>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit phone number"
                    value={form.phone}
                    onChange={handleChange}
                    className={errors.phone ? "input-error" : ""}
                  />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                    placeholder="Create a strong password"
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

              {/* Terms */}
              <div className="terms-checkbox">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Owner Section */}
            <div className="owner-section">
              <div className="owner-section-header">
                <i className="fas fa-store-alt"></i>
                <div>
                  <h3>Restaurant Owner?</h3>
                  <p>Manage your restaurant with powerful tools</p>
                </div>
              </div>
              <Link href="/owner/register" className="owner-register-btn">
                <i className="fas fa-crown"></i>
                Register as Owner
              </Link>
            </div>

            {/* Login Link */}
            <p className="auth-switch">
              Already have an account?{" "}
              <Link href="/customer/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}