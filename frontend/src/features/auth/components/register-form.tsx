"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ownerRegister } from "@/services/auth";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    restaurant_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    restaurant_name: "",
    owner_name: "",
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
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors = { ...errors };
    let isValid = true;

    if (step === 1) {
      if (!form.restaurant_name.trim()) {
        newErrors.restaurant_name = "Restaurant name is required";
        isValid = false;
      }
      if (!form.owner_name.trim()) {
        newErrors.owner_name = "Owner name is required";
        isValid = false;
      }
    }

    if (step === 2) {
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
        newErrors.phone = "Enter valid 10-digit number";
        isValid = false;
      }
      if (!form.password) {
        newErrors.password = "Password is required";
        isValid = false;
      } else if (form.password.length < 6) {
        newErrors.password = "Minimum 6 characters required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    setLoading(true);

    try {
      await ownerRegister(form);
      alert("Registration successful! Please login.");
      router.push("/owner/login");
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
        <div className="auth-branding owner-branding">
          <div className="branding-content">
            <Link href="/" className="branding-logo">
              <i className="fas fa-utensils"></i>
              <span>Advanta Growth</span>
            </Link>
            <h1>Grow Your Restaurant Business</h1>
            <p>Join thousands of restaurant owners who trust Advanta Growth for their business management.</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Complete POS System</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Inventory Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Staff Management</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge">
                <i className="fas fa-crown"></i>
                <span>Owner Registration</span>
              </div>
              <h2>Set Up Your Account</h2>
              <p>Step {currentStep} of 2</p>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? "step-active" : ""} ${currentStep > 1 ? "step-completed" : ""}`}>
                <div className="step-number">
                  {currentStep > 1 ? <i className="fas fa-check"></i> : "1"}
                </div>
                <span className="step-label">Business Info</span>
              </div>
              <div className="step-connector">
                <div className={`connector-line ${currentStep > 1 ? "connector-filled" : ""}`}></div>
              </div>
              <div className={`step ${currentStep >= 2 ? "step-active" : ""}`}>
                <div className="step-number">2</div>
                <span className="step-label">Account Setup</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Step 1: Business Information */}
              <div className={`form-step ${currentStep === 1 ? "step-visible" : "step-hidden"}`}>
                <div className="form-group">
                  <label htmlFor="restaurant_name">Restaurant Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-store input-icon"></i>
                    <input
                      id="restaurant_name"
                      type="text"
                      name="restaurant_name"
                      placeholder="Enter your restaurant name"
                      value={form.restaurant_name}
                      onChange={handleChange}
                      className={errors.restaurant_name ? "input-error" : ""}
                    />
                  </div>
                  {errors.restaurant_name && <span className="error-message">{errors.restaurant_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="owner_name">Owner Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user-tie input-icon"></i>
                    <input
                      id="owner_name"
                      type="text"
                      name="owner_name"
                      placeholder="Enter your full name"
                      value={form.owner_name}
                      onChange={handleChange}
                      className={errors.owner_name ? "input-error" : ""}
                    />
                  </div>
                  {errors.owner_name && <span className="error-message">{errors.owner_name}</span>}
                </div>

                <button type="button" className="submit-btn" onClick={nextStep}>
                  Continue
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              {/* Step 2: Account Details */}
              <div className={`form-step ${currentStep === 2 ? "step-visible" : "step-hidden"}`}>
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

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-phone input-icon"></i>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit number"
                      value={form.phone}
                      onChange={handleChange}
                      className={errors.phone ? "input-error" : ""}
                    />
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

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
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-step-buttons">
                  <button type="button" className="back-btn" onClick={prevStep}>
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                  <h3>Looking to Dine?</h3>
                  <p>Create a customer account for reservations & orders</p>
                </div>
              </div>
              <Link href="/register" className="owner-register-btn customer-register-btn">
                <i className="fas fa-user-plus"></i>
                Register as Customer
              </Link>
            </div>

            {/* Login Link */}
            <p className="auth-switch">
              Already have an account?{" "}
              <Link href="/owner/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}