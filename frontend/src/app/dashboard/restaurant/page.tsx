"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type RestaurantProfileForm = {
  name: string;
  legal_name: string;
  business_category: string;
  vat_number: string;

  address_line_1: string;
  address_line_2: string;
  city: string;
  postal_code: string;
  country: string;

  phone: string;
  email: string;
  website: string;

  currency: string;
  timezone: string;
  opening_time: string;
  closing_time: string;
};

const initialForm: RestaurantProfileForm = {
  name: "",
  legal_name: "",
  business_category: "",
  vat_number: "",

  address_line_1: "",
  address_line_2: "",
  city: "",
  postal_code: "",
  country: "",

  phone: "",
  email: "",
  website: "",

  currency: "",
  timezone: "",
  opening_time: "",
  closing_time: "",
};

export default function RestaurantProfilePage() {
  const [form, setForm] =
    useState<RestaurantProfileForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login session not found.");
        return;
      }

      const response = await api.get(
        "/restaurant/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const restaurant =
        response.data?.restaurant;

      if (restaurant) {
        setForm({
          name: restaurant.name ?? "",
          legal_name:
            restaurant.legal_name ?? "",
          business_category:
            restaurant.business_category ?? "",
          vat_number:
            restaurant.vat_number ?? "",

          address_line_1:
            restaurant.address_line_1 ?? "",
          address_line_2:
            restaurant.address_line_2 ?? "",
          city: restaurant.city ?? "",
          postal_code:
            restaurant.postal_code ?? "",
          country: restaurant.country ?? "",

          phone: restaurant.phone ?? "",
          email: restaurant.email ?? "",
          website: restaurant.website ?? "",

          currency:
            restaurant.currency ?? "",
          timezone:
            restaurant.timezone ?? "",
          opening_time:
            restaurant.opening_time ?? "",
          closing_time:
            restaurant.closing_time ?? "",
        });
      }
    } catch (err: any) {
      console.error(
        "Restaurant profile load error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load restaurant profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccess("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login session not found.");
        return;
      }

      const response = await api.put(
        "/restaurant/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setSuccess(
          "Restaurant profile updated successfully."
        );

        const restaurant =
          response.data.restaurant;

        if (restaurant) {
          setForm({
            name: restaurant.name ?? "",
            legal_name:
              restaurant.legal_name ?? "",
            business_category:
              restaurant.business_category ?? "",
            vat_number:
              restaurant.vat_number ?? "",

            address_line_1:
              restaurant.address_line_1 ?? "",
            address_line_2:
              restaurant.address_line_2 ?? "",
            city: restaurant.city ?? "",
            postal_code:
              restaurant.postal_code ?? "",
            country:
              restaurant.country ?? "",

            phone: restaurant.phone ?? "",
            email: restaurant.email ?? "",
            website:
              restaurant.website ?? "",

            currency:
              restaurant.currency ?? "",
            timezone:
              restaurant.timezone ?? "",
            opening_time:
              restaurant.opening_time ?? "",
            closing_time:
              restaurant.closing_time ?? "",
          });
        }
      }
    } catch (err: any) {
      console.error(
        "Restaurant profile save error:",
        err
      );

      if (err?.response?.status === 422) {
        const validationErrors =
          err?.response?.data?.errors;

        if (validationErrors) {
          const firstError = Object.values(
            validationErrors
          )[0];

          if (
            Array.isArray(firstError) &&
            firstError.length > 0
          ) {
            setError(String(firstError[0]));
            return;
          }
        }
      }

      setError(
        err?.response?.data?.message ||
          "Unable to update restaurant profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      
  <div className="dashboard-page restaurant-profile-page">
        <div className="dashboard-container">
          <div className="dashboard-section">
            <div className="empty-state">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Loading Restaurant Profile</h3>
              <p>
                Please wait while we load your
                restaurant information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Page Header */}

        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-left">

              <div className="page-badge">
                <i className="fas fa-store"></i>
                <span>Restaurant</span>
              </div>

              <h1>Restaurant Profile</h1>

              <p>
                Manage your restaurant business,
                location, contact and operational
                information.
              </p>

            </div>

            <div className="welcome-illustration">
              <i className="fas fa-building"></i>
            </div>
          </div>
        </div>

        {/* Success */}

        {success && (
          <div
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#eaf8ef",
              color: "#187a3d",
              fontWeight: 600,
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{ marginRight: "8px" }}
            ></i>

            {success}
          </div>
        )}

        {/* Error */}

        {error && (
          <div
            style={{
              padding: "14px 18px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff0f0",
              color: "#c62828",
              fontWeight: 600,
            }}
          >
            <i
              className="fas fa-exclamation-circle"
              style={{ marginRight: "8px" }}
            ></i>

            {error}
          </div>
        )}

        <form onSubmit={handleSave}>

          {/* Basic Information */}

          <div className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2>Basic Information</h2>
                <p>
                  General business information for
                  your restaurant.
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Restaurant Name
                    <span className="required">
                      *
                    </span>
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-store input-icon"></i>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Restaurant name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Legal Name</label>

                  <div className="input-wrapper">
                    <i className="fas fa-file-signature input-icon"></i>

                    <input
                      type="text"
                      name="legal_name"
                      value={form.legal_name}
                      onChange={handleChange}
                      placeholder="Registered legal name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Business Category
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-briefcase input-icon"></i>

                    <input
                      type="text"
                      name="business_category"
                      value={
                        form.business_category
                      }
                      onChange={handleChange}
                      placeholder="e.g. Restaurant"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>VAT Number</label>

                  <div className="input-wrapper">
                    <i className="fas fa-receipt input-icon"></i>

                    <input
                      type="text"
                      name="vat_number"
                      value={form.vat_number}
                      onChange={handleChange}
                      placeholder="VAT number"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Location */}

          <div className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2>Location</h2>
                <p>
                  Restaurant physical location and
                  address details.
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">

                <div className="form-group full-width">
                  <label>
                    Address Line 1
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-map-marker-alt input-icon"></i>

                    <input
                      type="text"
                      name="address_line_1"
                      value={
                        form.address_line_1
                      }
                      onChange={handleChange}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>
                    Address Line 2
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-map-pin input-icon"></i>

                    <input
                      type="text"
                      name="address_line_2"
                      value={
                        form.address_line_2
                      }
                      onChange={handleChange}
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>City</label>

                  <div className="input-wrapper">
                    <i className="fas fa-city input-icon"></i>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Postal Code</label>

                  <div className="input-wrapper">
                    <i className="fas fa-mail-bulk input-icon"></i>

                    <input
                      type="text"
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Country</label>

                  <div className="input-wrapper">
                    <i className="fas fa-globe input-icon"></i>

                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Country"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Contact Information */}

          <div className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2>
                  Contact Information
                </h2>

                <p>
                  Public and business contact
                  information.
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">

                <div className="form-group">
                  <label>Phone</label>

                  <div className="input-wrapper">
                    <i className="fas fa-phone input-icon"></i>

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Restaurant email"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Website</label>

                  <div className="input-wrapper">
                    <i className="fas fa-link input-icon"></i>

                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Operational Settings */}

          <div className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2>
                  Operational Settings
                </h2>

                <p>
                  Configure restaurant currency,
                  timezone and business hours.
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">

                <div className="form-group">
                  <label>Currency</label>

                  <div className="input-wrapper">
                    <i className="fas fa-money-bill-wave input-icon"></i>

                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select currency
                      </option>
                      <option value="INR">
                        INR - Indian Rupee
                      </option>
                      <option value="USD">
                        USD - US Dollar
                      </option>
                      <option value="EUR">
                        EUR - Euro
                      </option>
                      <option value="GBP">
                        GBP - British Pound
                      </option>
                      <option value="AED">
                        AED - UAE Dirham
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Timezone</label>

                  <div className="input-wrapper">
                    <i className="fas fa-clock input-icon"></i>

                    <select
                      name="timezone"
                      value={form.timezone}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select timezone
                      </option>

                      <option value="Asia/Kolkata">
                        Asia/Kolkata
                      </option>

                      <option value="Asia/Dubai">
                        Asia/Dubai
                      </option>

                      <option value="Europe/London">
                        Europe/London
                      </option>

                      <option value="America/New_York">
                        America/New_York
                      </option>

                      <option value="America/Los_Angeles">
                        America/Los_Angeles
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Opening Time
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-door-open input-icon"></i>

                    <input
                      type="time"
                      name="opening_time"
                      value={form.opening_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Closing Time
                  </label>

                  <div className="input-wrapper">
                    <i className="fas fa-door-closed input-icon"></i>

                    <input
                      type="time"
                      name="closing_time"
                      value={form.closing_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Save */}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={loadProfile}
              disabled={saving}
            >
              <i className="fas fa-undo"></i>
              Reset
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}