"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";
import {
  resendRegistrationOtp,
  verifyRegistrationEmail,
} from "@/services/auth";

export default function OwnerVerifyEmailPage() {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
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
    const parameters =
      new URLSearchParams(
        window.location.search
      );

    const queryEmail =
      parameters.get("email");

    if (queryEmail) {
      setEmail(
        queryEmail
          .trim()
          .toLowerCase()
      );
    }
  }, []);

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
    const validationErrors =
      requestError?.response?.data
        ?.errors;

    if (validationErrors) {
      const firstError =
        Object.values(
          validationErrors
        )[0];

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

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

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

  const handleVerify = async (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!normalizedEmail) {
      setError(
        "Email is required."
      );
      return;
    }

    if (
      !/\S+@\S+\.\S+/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(otp)
    ) {
      setError(
        "Enter the complete 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await verifyRegistrationEmail({
          email:
            normalizedEmail,

          otp,
        });

      setMessage(
        response.data?.message ||
          "Email verified successfully."
      );

      window.setTimeout(() => {
        router.replace(
          "/owner/login"
        );
      }, 1200);
    } catch (requestError: any) {
      setError(
        getApiError(
          requestError,
          "Unable to verify the email."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");

    if (!normalizedEmail) {
      setError(
        "Enter your email address first."
      );
      return;
    }

    if (
      !/\S+@\S+\.\S+/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    if (
      resending ||
      resendSeconds > 0
    ) {
      return;
    }

    try {
      setResending(true);

      const response =
        await resendRegistrationOtp(
          normalizedEmail
        );

      setOtp("");
      setResendSeconds(60);

      setMessage(
        response.data?.message ||
          "A new verification code has been sent."
      );
    } catch (requestError: any) {
      setError(
        getApiError(
          requestError,
          "Unable to resend the verification code."
        )
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-wrapper">
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="form-badge">
                <i className="fas fa-envelope-circle-check"></i>

                <span>
                  Email Verification
                </span>
              </div>

              <h2>
                Verify Your Email
              </h2>

              <p>
                Enter the 6-digit code sent
                to your email address.
              </p>
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

            <form
              onSubmit={
                handleVerify
              }
              className="auth-form"
            >
              <div className="form-group">
                <label htmlFor="verification-email">
                  Email Address
                </label>

                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>

                  <input
                    id="verification-email"
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

              <div className="form-group">
                <label htmlFor="verification-otp">
                  Verification Code
                </label>

                <div className="input-wrapper">
                  <i className="fas fa-shield-alt input-icon"></i>

                  <input
                    id="verification-otp"
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
            </form>

            <p className="auth-switch">
              Didn&apos;t receive the code?{" "}

              <button
                type="button"
                onClick={
                  handleResend
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