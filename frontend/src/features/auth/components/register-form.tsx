"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ownerRegister,
  resendRegistrationOtp,
  verifyRegistrationEmail,
} from "@/services/auth";

export default function OwnerRegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [message, setMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

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

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) =>
        seconds > 0 ? seconds - 1 : 0
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendSeconds]);

  const getApiError = (
    error: any,
    fallback: string
  ): string => {
    const validationErrors =
      error?.response?.data?.errors;

    if (validationErrors) {
      const firstError =
        Object.values(validationErrors)[0];

      if (
        Array.isArray(firstError) &&
        firstError.length > 0
      ) {
        return String(firstError[0]);
      }
    }

    return (
      error?.response?.data?.message ||
      fallback
    );
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    setGeneralError("");
  };

  const handleOtpChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
    setOtpError("");
    setGeneralError("");
  };

  const validateStep = (
    step: number
  ): boolean => {
    const newErrors = {
      restaurant_name: "",
      owner_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    };

    let isValid = true;

    if (step === 1) {
      if (!form.restaurant_name.trim()) {
        newErrors.restaurant_name =
          "Restaurant name is required";
        isValid = false;
      }

      if (!form.owner_name.trim()) {
        newErrors.owner_name =
          "Owner name is required";
        isValid = false;
      }
    }

    if (step === 2) {
      if (!form.email.trim()) {
        newErrors.email =
          "Email is required";
        isValid = false;
      } else if (
        !/\S+@\S+\.\S+/.test(
          form.email.trim()
        )
      ) {
        newErrors.email =
          "Please enter a valid email";
        isValid = false;
      }

      const normalizedPhone =
        form.phone.replace(
          /[\s-]/g,
          ""
        );

      if (!form.phone.trim()) {
        newErrors.phone =
          "Phone number is required";
        isValid = false;
      } else if (
        !/^\d{10}$/.test(
          normalizedPhone
        )
      ) {
        newErrors.phone =
          "Enter valid 10-digit number";
        isValid = false;
      }

      if (!form.password) {
        newErrors.password =
          "Password is required";
        isValid = false;
      } else if (
        form.password.length < 8
      ) {
        newErrors.password =
          "Minimum 8 characters required";
        isValid = false;
      }

      if (!form.confirm_password) {
        newErrors.confirm_password =
          "Please confirm your password";
        isValid = false;
      } else if (
        form.password !==
        form.confirm_password
      ) {
        newErrors.confirm_password =
          "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);

    return isValid;
  };

  const nextStep = () => {
    if (validateStep(1)) {
      setCurrentStep(2);
      setGeneralError("");
    }
  };

  const previousStep = () => {
    setCurrentStep(1);
    setGeneralError("");
  };

  const handleRegistration = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (currentStep !== 2) {
      return;
    }

    if (!validateStep(2)) {
      return;
    }

    setLoading(true);
    setMessage("");
    setGeneralError("");

    try {
      const response =
        await ownerRegister({
          ...form,

          email:
            form.email
              .trim()
              .toLowerCase(),

          phone:
            form.phone.replace(
              /[\s-]/g,
              ""
            ),
        });

      const seconds =
        Number(
          response.data?.data
            ?.resend_after_seconds
        ) || 60;

      setResendSeconds(seconds);
      setOtp("");
      setCurrentStep(3);

      setMessage(
        response.data?.message ||
          "Verification code sent to your email."
      );
    } catch (error: any) {
      const code =
        error?.response?.data?.code;

      const responseEmail =
        error?.response?.data?.data?.email;

      /*
       * The account was created but the first
       * email delivery failed. Show OTP screen
       * so the owner can request another code.
       */
      if (
        code ===
          "VERIFICATION_EMAIL_FAILED" &&
        responseEmail
      ) {
        setForm((previous) => ({
          ...previous,
          email: responseEmail,
        }));

        setCurrentStep(3);
        setResendSeconds(0);

        setGeneralError(
          getApiError(
            error,
            "Account created, but verification email could not be sent."
          )
        );

        return;
      }

      setGeneralError(
        getApiError(
          error,
          "Registration failed. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setOtpError(
        "Enter the complete 6-digit verification code."
      );
      return;
    }

    setLoading(true);
    setOtpError("");
    setMessage("");
    setGeneralError("");

    try {
      const response =
        await verifyRegistrationEmail({
          email:
            form.email
              .trim()
              .toLowerCase(),

          otp,
        });

      setMessage(
        response.data?.message ||
          "Email verified successfully."
      );

      window.setTimeout(() => {
        router.push("/owner/login");
      }, 1000);
    } catch (error: any) {
      setOtpError(
        getApiError(
          error,
          "Unable to verify the code."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (
      resending ||
      resendSeconds > 0
    ) {
      return;
    }

    setResending(true);
    setOtpError("");
    setMessage("");
    setGeneralError("");

    try {
      const response =
        await resendRegistrationOtp(
          form.email
            .trim()
            .toLowerCase()
        );

      setOtp("");
      setResendSeconds(60);

      setMessage(
        response.data?.message ||
          "A new verification code has been sent."
      );
    } catch (error: any) {
      setGeneralError(
        getApiError(
          error,
          "Unable to resend the verification code."
        )
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page owner-register-page">
      <div className="auth-wrapper">
        <div className="auth-branding owner-branding balanced-branding">
          <div className="branding-content">
            <Link
              href="/"
              className="branding-logo balanced-logo"
            >
              <i className="fas fa-utensils"></i>
              <span>Advanta Growth</span>
            </Link>

            <h1>
              Grow Your Restaurant Business
            </h1>

            <p>
              Join thousands of restaurant
              owners who trust Advanta Growth
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

        <div className="auth-form-section balanced-form-section">
          <div className="auth-form-container balanced-form-container">
            <div className="auth-form-header balanced-header">
              <div className="form-badge owner-badge-form balanced-badge">
                <i className="fas fa-crown"></i>
                <span>Owner Registration</span>
              </div>

              <h2>
                {currentStep === 3
                  ? "Verify Your Email"
                  : "Set Up Your Account"}
              </h2>

              <p>
                Step {currentStep} of 3
              </p>
            </div>

            <div className="progress-steps">
              <div
                className={`step ${
                  currentStep >= 1
                    ? "step-active"
                    : ""
                } ${
                  currentStep > 1
                    ? "step-completed"
                    : ""
                }`}
              >
                <div className="step-number">
                  {currentStep > 1 ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    "1"
                  )}
                </div>

                <span className="step-label">
                  Business Info
                </span>
              </div>

              <div className="step-connector">
                <div
                  className={`connector-line ${
                    currentStep > 1
                      ? "connector-filled"
                      : ""
                  }`}
                ></div>
              </div>

              <div
                className={`step ${
                  currentStep >= 2
                    ? "step-active"
                    : ""
                } ${
                  currentStep > 2
                    ? "step-completed"
                    : ""
                }`}
              >
                <div className="step-number">
                  {currentStep > 2 ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    "2"
                  )}
                </div>

                <span className="step-label">
                  Account Setup
                </span>
              </div>

              <div className="step-connector">
                <div
                  className={`connector-line ${
                    currentStep > 2
                      ? "connector-filled"
                      : ""
                  }`}
                ></div>
              </div>

              <div
                className={`step ${
                  currentStep >= 3
                    ? "step-active"
                    : ""
                }`}
              >
                <div className="step-number">
                  3
                </div>

                <span className="step-label">
                  Verify Email
                </span>
              </div>
            </div>

            {message && (
              <div className="auth-banner auth-banner-success">
                <i className="fas fa-check-circle"></i>
                <span>{message}</span>
              </div>
            )}

            {generalError && (
              <div className="auth-banner auth-banner-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{generalError}</span>
              </div>
            )}

            <form
              onSubmit={handleRegistration}
              className="auth-form balanced-form"
            >
              <div
                className={`form-step ${
                  currentStep === 1
                    ? "step-visible"
                    : "step-hidden"
                }`}
              >
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

              <div
                className={`form-step ${
                  currentStep === 2
                    ? "step-visible"
                    : "step-hidden"
                }`}
              >
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
                      autoComplete="email"
                    />
                  </div>

                  {errors.email && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.email}
                    </span>
                  )}
                </div>

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
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>

                  {errors.phone && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {errors.phone}
                    </span>
                  )}
                </div>

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
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className={
                        errors.password
                          ? "input-error"
                          : ""
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (visible) =>
                            !visible
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
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (visible) =>
                            !visible
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

                <div className="form-step-buttons">
                  <button
                    type="button"
                    className="back-btn balanced-back-btn"
                    onClick={previousStep}
                    disabled={loading}
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
                        <i className="fas fa-envelope"></i>
                        Create & Verify
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`form-step ${
                  currentStep === 3
                    ? "step-visible"
                    : "step-hidden"
                }`}
              >
                <div className="form-group balanced-group">
                  <label htmlFor="verification-otp">
                    Verification Code
                  </label>

                  <p>
                    We sent a 6-digit code to{" "}
                    <strong>
                      {form.email}
                    </strong>
                  </p>

                  <div className="input-wrapper balanced-input-wrapper">
                    <i className="fas fa-shield-alt input-icon"></i>

                    <input
                      id="verification-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={handleOtpChange}
                      maxLength={6}
                      className={
                        otpError
                          ? "input-error"
                          : ""
                      }
                    />
                  </div>

                  {otpError && (
                    <span className="error-message balanced-error">
                      <i className="fas fa-exclamation-circle"></i>{" "}
                      {otpError}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="submit-btn balanced-submit"
                  onClick={handleVerifyOtp}
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Verify Email
                    </>
                  )}
                </button>

                <p className="auth-switch balanced-switch">
                  Didn&apos;t receive the code?{" "}

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={
                      resending ||
                      resendSeconds > 0
                    }
                  >
                    {resending
                      ? "Sending..."
                      : resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "Resend Code"}
                  </button>
                </p>
              </div>
            </form>

            <div className="auth-divider balanced-divider">
              <span>OR</span>
            </div>

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