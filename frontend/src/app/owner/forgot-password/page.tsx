"use client";

import Link from "next/link";
import { useState } from "react";
import api from "@/lib/axios";

export default function OwnerForgotPasswordPage() {
  const [login, setLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!login.trim()) {
      setError("Email is required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/auth/reset-password", {
        login: login.trim(),
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setMessage(
        response.data?.message || "Password reset successfully."
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errors = err?.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(String(firstError[0]));
          return;
        }
      }

      setError(
        err?.response?.data?.message || "Unable to reset password."
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
                <span>Account Recovery</span>
              </div>

              <h2>Reset Password</h2>

              <p>
                Enter your owner email and choose a new password.
              </p>
            </div>

            {message && (
              <div className="auth-banner auth-banner-success">
                <i className="fas fa-check-circle"></i>
                {message}
              </div>
            )}

            {error && (
              <div className="auth-banner auth-banner-error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="login">Email</label>

                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>

                  <input
                    id="login"
                    type="email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="owner@example.com"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>

                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>

                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
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
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            </form>

            <p className="auth-switch">
              <Link href="/owner/login">
                <i className="fas fa-arrow-left"></i> Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
