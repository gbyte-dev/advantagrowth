"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ownerRegister } from "@/services/auth";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    restaurant_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({
    restaurant_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
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
      if (!form.confirm_password) {
        newErrors.confirm_password = "Please confirm your password";
        isValid = false;
      } else if (form.password !== form.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
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
    <div className="auth-page owner-register-page">
      <div className="auth-wrapper">

        {/* =========================================================
            LEFT SIDE - BRANDING
        ========================================================= */}

        <div className="auth-branding owner-branding balanced-branding">
          <div className="branding-content">

            <Link href="/" className="branding-logo balanced-logo">
              <i className="fas fa-utensils"></i>
              <span>Advanta Growth</span>
            </Link>

            <h1>Grow Your Restaurant Business</h1>

            <p>
              Join thousands of restaurant owners who trust Advanta Growth 
              for their business management.
            </p>

            <div className="branding-features balanced-features">

              <div className="feature-item balanced-feature">
                <i className="fas fa-check-circle"></i>
                <span>Complete POS System</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-check-circle"></i>
                <span>Inventory Management</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-check-circle"></i>
                <span>Staff Management</span>
              </div>

              <div className="feature-item balanced-feature">
                <i className="fas fa-check-circle"></i>
                <span>Real-time Analytics</span>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT SIDE - REGISTRATION FORM
        ========================================================= */}

        <div className="auth-form-section balanced-form-section">
          <div className="auth-form-container balanced-form-container">

            {/* Header */}

            <div className="auth-form-header balanced-header">

              <div className="form-badge owner-badge-form balanced-badge">
                <i className="fas fa-crown"></i>
                <span>Owner Registration</span>
              </div>

              <h2>Set Up Your Account</h2>

              <p>
                Step {currentStep} of 2
              </p>

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

            {/* =====================================================
                REGISTRATION FORM
            ===================================================== */}

            <form onSubmit={handleSubmit} className="auth-form balanced-form">

              {/* ===================================================
                  STEP 1: BUSINESS INFORMATION
              =================================================== */}

              <div className={`form-step ${currentStep === 1 ? "step-visible" : "step-hidden"}`}>

                {/* Restaurant Name */}

                <div className="form-group balanced-group">

                  <label htmlFor="restaurant_name">
                    Restaurant Name
                  </label>

                  <div className="input-wrapper balanced-input-wrapper">

                    <i className="fas fa-store input-icon"></i>

                    <input
                      id="restaurant_name"
                      type="text"
                      name="restaurant_name"
                      placeholder="Enter your restaurant name"
                      value={form.restaurant_name}
                      onChange={handleChange}
                      className={
                        errors.restaurant_name
                          ? "input-error"
                          : ""
                      }
                    />

                  </div>

                  {errors.restaurant_name && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.restaurant_name}
                    </span>
                  )}

                </div>

                {/* Owner Name */}

                <div className="form-group balanced-group">

                  <label htmlFor="owner_name">
                    Owner Name
                  </label>

                  <div className="input-wrapper balanced-input-wrapper">

                    <i className="fas fa-user-tie input-icon"></i>

                    <input
                      id="owner_name"
                      type="text"
                      name="owner_name"
                      placeholder="Enter your full name"
                      value={form.owner_name}
                      onChange={handleChange}
                      className={
                        errors.owner_name
                          ? "input-error"
                          : ""
                      }
                    />

                  </div>

                  {errors.owner_name && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.owner_name}
                    </span>
                  )}

                </div>

                <button
                  type="button"
                  className="submit-btn balanced-submit"
                  onClick={nextStep}
                >
                  Continue
                  <i className="fas fa-arrow-right"></i>
                </button>

              </div>

              {/* ===================================================
                  STEP 2: ACCOUNT SETUP
              =================================================== */}

              <div className={`form-step ${currentStep === 2 ? "step-visible" : "step-hidden"}`}>

                {/* Email */}

                <div className="form-group balanced-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="input-wrapper balanced-input-wrapper">

                    <i className="fas fa-envelope input-icon"></i>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className={
                        errors.email
                          ? "input-error"
                          : ""
                      }
                    />

                  </div>

                  {errors.email && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.email}
                    </span>
                  )}

                </div>

                {/* Phone */}

                <div className="form-group balanced-group">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <div className="input-wrapper balanced-input-wrapper">

                    <i className="fas fa-phone input-icon"></i>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit number"
                      value={form.phone}
                      onChange={handleChange}
                      className={
                        errors.phone
                          ? "input-error"
                          : ""
                      }
                    />

                  </div>

                  {errors.phone && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.phone}
                    </span>
                  )}

                </div>

                {/* Password */}

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
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      className={
                        errors.password
                          ? "input-error"
                          : ""
                      }
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

                {/* Confirm Password */}

                <div className="form-group balanced-group">

                  <label htmlFor="confirm_password">
                    Confirm Password
                  </label>

                  <div className="input-wrapper balanced-input-wrapper">

                    <i className="fas fa-shield-alt input-icon"></i>

                    <input
                      id="confirm_password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirm_password"
                      placeholder="Confirm your password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      className={
                        errors.confirm_password
                          ? "input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <i
                        className={`fas ${
                          showConfirmPassword
                            ? "fa-eye-slash"
                            : "fa-eye"
                        }`}
                      ></i>
                    </button>

                  </div>

                  {errors.confirm_password && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.confirm_password}
                    </span>
                  )}

                </div>

                {/* Step 2 Buttons */}

                <div className="form-step-buttons">

                  <button
                    type="button"
                    className="back-btn balanced-back-btn"
                    onClick={prevStep}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </button>

                  <button
                    type="submit"
                    className="submit-btn balanced-submit"
                    disabled={loading}
                  >

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

            <div className="auth-divider balanced-divider">
              <span>OR</span>
            </div>

            {/* Login Link */}

            <p className="auth-switch balanced-switch">

              Already have an account?{" "}

              <Link href="/owner/login">
                Sign In
              </Link>

            </p>

          </div>
        </div>

      </div>
    </div>
  );
}