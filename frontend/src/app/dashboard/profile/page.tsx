"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

import {
  showSuccess,
  showError,
  showWarning,
  confirmDialog,
} from "@/lib/feedback";

type User = {
  id: number;
  owner_name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [profile, setProfile] =
    useState({
      owner_name: "",
      email: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });

  const authConfig = () => {
    const token =
      sessionStorage.getItem("token");

    return {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Load Profile
  |--------------------------------------------------------------------------
  */

  const loadProfile = async () => {
    try {
      setLoading(true);

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        router.replace(
          "/owner/login"
        );

        return;
      }

      const response =
        await api.get(
          "/auth/me",
          authConfig()
        );

      const user: User =
        response.data;

      setProfile({
        owner_name:
          user.owner_name || "",

        email:
          user.email || "",
      });
    } catch (error: any) {
      console.error(
        "Profile loading error:",
        error
      );

      if (
        error?.response?.status ===
        401
      ) {
        sessionStorage.clear();

        router.replace(
          "/owner/login"
        );

        return;
      }

      showError(
        error?.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  const updateProfile = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !profile.owner_name.trim()
    ) {
      showWarning(
        "Owner name is required."
      );

      return;
    }

    if (
      !profile.email.trim()
    ) {
      showWarning(
        "Email is required."
      );

      return;
    }

    try {
      setSavingProfile(true);

      const response =
        await api.put(
          "/auth/profile",
          {
            owner_name:
              profile.owner_name.trim(),

            email:
              profile.email.trim(),
          },
          authConfig()
        );

      const user =
        response.data?.user;

      if (user) {
        setProfile({
          owner_name:
            user.owner_name || "",

          email:
            user.email || "",
        });

        window.dispatchEvent(
          new CustomEvent(
            "ownerProfileUpdated",
            {
              detail: {
                owner_name:
                  user.owner_name,

                email:
                  user.email,
              },
            }
          )
        );
      }

      showSuccess(
        response.data?.message ||
          "Profile updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Profile update error:",
        error
      );

      const errors =
        error?.response?.data
          ?.errors;

      if (errors) {
        const firstError =
          Object.values(
            errors
          )?.[0];

        if (
          Array.isArray(
            firstError
          )
        ) {
          showWarning(
            firstError[0]
          );

          return;
        }
      }

      showError(
        error?.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Change Password
  |--------------------------------------------------------------------------
  */

  const changePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !passwordForm
        .current_password
    ) {
      showWarning(
        "Current password is required."
      );

      return;
    }

    if (
      passwordForm
        .new_password.length < 6
    ) {
      showWarning(
        "New password must be at least 6 characters."
      );

      return;
    }

    if (
      passwordForm
        .new_password !==
      passwordForm
        .new_password_confirmation
    ) {
      showWarning(
        "Password confirmation does not match."
      );

      return;
    }

    try {
      setSavingPassword(true);

      const response =
        await api.put(
          "/auth/change-password",
          passwordForm,
          authConfig()
        );

      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation:
          "",
      });

      showSuccess(
        response.data?.message ||
          "Password updated successfully."
      );
    } catch (error: any) {
      console.error(
        "Password update error:",
        error
      );

      showError(
        error?.response?.data?.message ||
          "Unable to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Account
  |--------------------------------------------------------------------------
  */

  const deleteAccount = async () => {
    const firstConfirm =
      await confirmDialog({
        title:
          "Delete Account?",

        message:
          "Are you sure you want to delete your account?",

        confirmText:
          "Continue",

        cancelText:
          "Cancel",

        danger:
          true,
      });

    if (!firstConfirm) {
      return;
    }

    const secondConfirm =
      await confirmDialog({
        title:
          "Permanently Delete Account?",

        message:
          "This action cannot be undone. Your account access will be permanently removed.",

        confirmText:
          "Delete Permanently",

        cancelText:
          "Cancel",

        danger:
          true,
      });

    if (!secondConfirm) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        "/auth/account",
        authConfig()
      );

      sessionStorage.clear();

      window.dispatchEvent(
        new Event("storage")
      );

      showSuccess(
        "Account deleted successfully."
      );

      router.replace(
        "/owner/login"
      );
    } catch (error: any) {
      console.error(
        "Delete account error:",
        error
      );

      showError(
        error?.response?.data?.message ||
          "Unable to delete account."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="dashboard-page profile-page">
        <div className="dashboard-container">
          <div className="dashboard-section">
            <div className="empty-state">
              <i className="fas fa-spinner fa-spin" />

              <h3>
                Loading Profile
              </h3>

              <p>
                Please wait while we load
                your account information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page profile-page">
      <div className="dashboard-container">

        {/* PROFILE HEADER */}

        <div className="profile-page-header">

          <div className="profile-page-header-left">

            <h1>
              Manage Your Profile
            </h1>

            <p>
              Update your account information,
              secure your password and manage
              your Advanta Growth account.
            </p>

          </div>

        </div>

        {/* PROFILE INFORMATION */}

        <section className="dashboard-section profile-card">

          <div className="section-header-row">
            <div>

              <h2>
                Profile Information
              </h2>

              <p>
                Update your account name
                and email address.
              </p>

            </div>
          </div>

          <form
            onSubmit={
              updateProfile
            }
          >

            <div className="form-section">

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Owner Name
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-user input-icon" />

                    <input
                      type="text"
                      value={
                        profile.owner_name
                      }
                      onChange={(e) =>
                        setProfile({
                          ...profile,

                          owner_name:
                            e.target.value,
                        })
                      }
                      placeholder="Owner name"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-envelope input-icon" />

                    <input
                      type="email"
                      value={
                        profile.email
                      }
                      onChange={(e) =>
                        setProfile({
                          ...profile,

                          email:
                            e.target.value,
                        })
                      }
                      placeholder="Email address"
                    />

                  </div>

                </div>

              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={
                  savingProfile
                }
              >
                {savingProfile ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save" />
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </form>

        </section>

        {/* UPDATE PASSWORD */}

        <section className="dashboard-section profile-card">

          <div className="section-header-row">
            <div>

              <h2>
                Update Password
              </h2>

              <p>
                Use a strong password to
                keep your account secure.
              </p>

            </div>
          </div>

          <form
            onSubmit={
              changePassword
            }
          >

            <div className="form-section">

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Current Password
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-lock input-icon" />

                    <input
                      type="password"
                      value={
                        passwordForm
                          .current_password
                      }
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,

                          current_password:
                            e.target.value,
                        })
                      }
                      placeholder="Current password"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    New Password
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-key input-icon" />

                    <input
                      type="password"
                      value={
                        passwordForm
                          .new_password
                      }
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,

                          new_password:
                            e.target.value,
                        })
                      }
                      placeholder="New password"
                    />

                  </div>

                </div>

                <div className="form-group full-width">

                  <label>
                    Confirm Password
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-shield-alt input-icon" />

                    <input
                      type="password"
                      value={
                        passwordForm
                          .new_password_confirmation
                      }
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,

                          new_password_confirmation:
                            e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />

                  </div>

                </div>

              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={
                  savingPassword
                }
              >
                {savingPassword ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key" />
                    Save Password
                  </>
                )}
              </button>

            </div>

          </form>

        </section>

        {/* DELETE ACCOUNT */}

        <section className="dashboard-section profile-danger-card">

          <div className="section-header-row">
            <div>

              <h2>
                Delete Account
              </h2>

              <p>
                Permanently delete your
                account. This action cannot
                be undone.
              </p>

            </div>
          </div>

          <div className="profile-danger-content">

            <div className="profile-danger-icon">
              <i className="fas fa-exclamation-triangle" />
            </div>

            <div>

              <h3>
                Danger Zone
              </h3>

              <p>
                Once your account is deleted,
                you will permanently lose
                access to your account.
              </p>

            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                deleteAccount
              }
              className="danger-btn"
            >
              {deleting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt" />
                  Delete Account
                </>
              )}
            </button>

          </div>

        </section>

      </div>
    </div>
  );
}