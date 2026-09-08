"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/services/auth";

export default function OwnerForgotPasswordPage() {
  const router =
    useRouter();

  const [currentStep, setCurrentStep] =
    useState(1);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [resendSeconds, setResendSeconds] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setResendSeconds(
          (seconds) =>
            seconds > 0
              ? seconds - 1
              : 0
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [resendSeconds]);

  const getApiError = (
    requestError: any,
    fallback: string
  ): string => {
    const errors =
      requestError?.response?.data
        ?.errors;

    if (errors) {
      const firstError =
        Object.values(errors)[0];

      if (
        Array.isArray(firstError) &&
        firstError.length > 0
      ) {
        return String(
          firstError[0]
        );
      }
    }

    return (
      requestError?.response?.data
        ?.message ||
      fallback
    );
  };

  const normalizeEmail = () =>
    email
      .trim()
      .toLowerCase();

  const handleRequestOtp = async (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!normalizeEmail()) {
      setError(
        "Email is required."
      );
      return;
    }

    if (
      !/\S+@\S+\.\S+/.test(
        normalizeEmail()
      )
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await requestPasswordResetOtp({
          email:
            normalizeEmail(),
        });

      const seconds =
        Number(
          response.data?.data
            ?.resend_after_seconds
        ) || 60;

      setEmail(
        normalizeEmail()
      );

      setResendSeconds(
        seconds
      );

      setCurrentStep(2);

      setMessage(
        response.data?.message ||
          "Password reset code sent."
      );
    } catch (requestError: any) {
      setError(
        getApiError(
          requestError,
          "Unable to send the password reset code."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOtpChange = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
    setError("");
  };

  const handleOtpContinue = (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !/^\d{6}$/.test(otp)
    ) {
      setError(
        "Enter the complete 6-digit verification code."
      );
      return;
    }

    setCurrentStep(3);
  };

  const handleResendOtp =
    async () => {
      if (
        resending ||
        resendSeconds > 0
      ) {
        return;
      }

      setResending(true);
      setMessage("");
      setError("");

      try {
        const response =
          await requestPasswordResetOtp({
            email:
              normalizeEmail(),
          });

        const seconds =
          Number(
            response.data?.data
              ?.resend_after_seconds
          ) || 60;

        setOtp("");
        setResendSeconds(
          seconds
        );

        setMessage(
          response.data?.message ||
            "A new password reset code has been sent."
        );
      } catch (requestError: any) {
        setError(
          getApiError(
            requestError,
            "Unable to resend the password reset code."
          )
        );
      } finally {
        setResending(false);
      }
    };

  const handleResetPassword =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setMessage("");
      setError("");

      if (
        newPassword.length < 8
      ) {
        setError(
          "Password must be at least 8 characters."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Password confirmation does not match."
        );
        return;
      }

      try {
        setSaving(true);

        const response =
          await resetPasswordWithOtp({
            email:
              normalizeEmail(),

            otp,

            new_password:
              newPassword,

            new_password_confirmation:
              confirmPassword,
          });

        setMessage(
          response.data?.message ||
            "Password reset successfully."
        );

        setNewPassword("");
        setConfirmPassword("");

        window.setTimeout(() => {
          router.push(
            "/owner/login"
          );
        }, 1200);
      } catch (requestError: any) {
        setError(
          getApiError(
            requestError,
            "Unable to reset the password."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-wrapper">
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge">
                <i className="fas fa-key"></i>

                <span>
                  Account Recovery
                </span>
              </div>

              <h2>
                {currentStep === 1
                  ? "Forgot Password"
                  : currentStep === 2
                    ? "Enter Verification Code"
                    : "Create New Password"}
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
                  Email
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
                  OTP
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
                  Password
                </span>
              </div>
            </div>

            {message && (
              <div className="auth-banner auth-banner-success">
                <i className="fas fa-check-circle"></i>

                <span>
                  {message}
                </span>
              </div>
            )}

            {error && (
              <div className="auth-banner auth-banner-error">
                <i className="fas fa-exclamation-circle"></i>

                <span>
                  {error}
                </span>
              </div>
            )}

            {currentStep === 1 && (
              <form
                onSubmit={
                  handleRequestOtp
                }
                className="auth-form"
              >
                <div className="form-group">
                  <label htmlFor="reset-email">
                    Email Address
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>

                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="owner@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Reset Code
                    </>
                  )}
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <form
                onSubmit={
                  handleOtpContinue
                }
                className="auth-form"
              >
                <div className="form-group">
                  <label htmlFor="reset-otp">
                    Verification Code
                  </label>

                  <p>
                    Enter the 6-digit code
                    sent to{" "}
                    <strong>
                      {email}
                    </strong>
                  </p>

                  <div className="input-wrapper">
                    <i className="fas fa-shield-alt input-icon"></i>

                    <input
                      id="reset-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={
                        handleOtpChange
                      }
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                    otp.length !== 6
                  }
                >
                  Continue
                  <i className="fas fa-arrow-right"></i>
                </button>

                <p className="auth-switch">
                  Didn&apos;t receive
                  the code?{" "}

                  <button
                    type="button"
                    onClick={
                      handleResendOtp
                    }
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

                <p className="auth-switch">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setOtp("");
                      setMessage("");
                      setError("");
                    }}
                  >
                    Change email
                  </button>
                </p>
              </form>
            )}

            {currentStep === 3 && (
              <form
                onSubmit={
                  handleResetPassword
                }
                className="auth-form"
              >
                <div className="form-group">
                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-lock input-icon"></i>

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
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
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">
                    Confirm Password
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-lock input-icon"></i>

                    <input
                      id="confirm-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      Reset Password
                    </>
                  )}
                </button>

                <p className="auth-switch">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      setMessage("");
                      setError("");
                    }}
                    disabled={saving}
                  >
                    <i className="fas fa-arrow-left"></i>{" "}
                    Back to verification code
                  </button>
                </p>
              </form>
            )}

            <p className="auth-switch">
              <Link href="/owner/login">
                <i className="fas fa-arrow-left"></i>{" "}
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}