"use client";

import { useState } from "react";
import api from "@/lib/axios";

type Connection = {
  id: number;
  provider: string;
  label: string;
  status: "connected" | "syncing" | "error";
  lastSync: string;
  records: number;
};

type PosMerchant = {
  external_merchant_id?: string | null;
  name?: string | null;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  currency?: string | null;
  timezone?: string | null;
};

type PosLocation = {
  external_location_id?: string | null;
  external_business_id?: string | null;
  name?: string | null;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  currency?: string | null;
  timezone?: string | null;
};

type PosTestResult = {
  success: boolean;
  message?: string;
  merchant?: PosMerchant;
  locations?: PosLocation[];
};

const providers = [
  "Square POS",
  "Toast POS",
  "Clover POS",
  "Lightspeed",
  "Restolution",
  "Custom API",
];

export default function IntegrationsPage() {
  const [showForm, setShowForm] = useState(false);

  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [testResult, setTestResult] =
    useState<PosTestResult | null>(null);

  const [testError, setTestError] = useState("");

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 1,
      provider: "Restolution",
      label: "Main Restaurant POS",
      status: "connected",
      lastSync: "19 Aug 2026, 11:32 AM",
      records: 24683,
    },
  ]);

  const [form, setForm] = useState({
    provider: "",
    label: "",
    apiKey: "",
    accessToken: "",
    baseUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    /*
     * Credentials changed.
     * Previous test result should no longer be trusted.
     */
    setTestResult(null);
    setTestError("");
  };

  const resetForm = () => {
    setForm({
      provider: "",
      label: "",
      apiKey: "",
      accessToken: "",
      baseUrl: "",
    });

    setTestResult(null);
    setTestError("");
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  /*
  |--------------------------------------------------------------------------
  | REAL TEST CONNECTION
  |--------------------------------------------------------------------------
  */

  const handleTestConnection = async () => {
    if (
      !form.provider ||
      !form.label ||
      !form.baseUrl
    ) {
      setTestError(
        "Provider, Label and Base URL are required."
      );

      return;
    }

    try {
      setTesting(true);
      setTestError("");
      setTestResult(null);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setTestError(
          "Login session not found. Please login again."
        );

        return;
      }

      const response = await api.post(
        "/owner/pos-connections/test",
        {
          provider: form.provider,
          label: form.label,

          api_key:
            form.apiKey.trim() || null,

          access_token:
            form.accessToken.trim() || null,

          base_url:
            form.baseUrl.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setTestResult(
          response.data as PosTestResult
        );

        return;
      }

      setTestError(
        response.data?.message ||
          "POS connection test failed."
      );
    } catch (err: any) {
      console.error(
        "POS test connection error:",
        err
      );

      setTestError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Unable to test POS connection."
      );
    } finally {
      setTesting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONNECT
  |--------------------------------------------------------------------------
  |
  | This is still frontend/static for now.
  | Next step will connect this to the real Laravel save endpoint.
  |
  */

const handleConnect = async () => {
  if (
    !form.provider ||
    !form.label ||
    !form.baseUrl
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    setConnecting(true);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login session not found.");
      return;
    }

    const response = await api.post(
      "/owner/pos-connections",
      {
        provider: form.provider,
        label: form.label,
        api_key: form.apiKey || null,
        access_token: form.accessToken || null,
        base_url: form.baseUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data?.success) {
      alert(
        response.data?.message ||
          "Unable to add POS connection."
      );
      return;
    }

    const connection =
      response.data.connection;

    const newConnection: Connection = {
      id: connection.id,
      provider: connection.provider,
      label: connection.label,
      status: "connected",
      lastSync: "Not synced yet",
      records: 0,
    };

    setConnections((prev) => [
      ...prev,
      newConnection,
    ]);

    resetForm();
    setTestResult(null);
    setTestError("");
    setShowForm(false);

    alert(
      response.data?.message ||
        "POS connection added successfully."
    );
  } catch (err: any) {
    console.error(
      "POS connection save error:",
      err
    );

    alert(
      err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to add POS connection."
    );
  } finally {
    setConnecting(false);
  }
};
  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this POS connection?"
      );

    if (!confirmed) {
      return;
    }

    setConnections((prev) =>
      prev.filter(
        (connection) =>
          connection.id !== id
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SYNC NOW
  |--------------------------------------------------------------------------
  |
  | Still frontend/static.
  | Real backend sync comes later.
  |
  */

  const handleSyncNow = async (
    id: number
  ) => {
    setConnections((prev) =>
      prev.map((connection) =>
        connection.id === id
          ? {
              ...connection,
              status: "syncing",
            }
          : connection
      )
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    setConnections((prev) =>
      prev.map((connection) =>
        connection.id === id
          ? {
              ...connection,
              status: "connected",
              lastSync:
                new Date().toLocaleString(),
            }
          : connection
      )
    );
  };

  return (
    <div className="dashboard-page integrations-page">
      <div className="dashboard-container">

        {/* =====================================================
            POS HEADER
        ===================================================== */}

        <div className="integrations-header">

          <div>
            <div className="integrations-eyebrow">
              <i className="fas fa-plug"></i>
              POS Management
            </div>

            <h1>POS Integrations</h1>

            <p>
              Connect and manage your restaurant POS
              systems, sync orders, payments and sales
              data automatically.
            </p>
          </div>

          <button
            type="button"
            className="integrations-add-btn"
            onClick={handleOpenForm}
          >
            <i className="fas fa-plus"></i>
            Add Connection
          </button>

        </div>

        {/* =====================================================
            POS INFO BANNER
        ===================================================== */}

        <div className="integrations-info-banner">

          <div className="integrations-info-icon">
            <i className="fas fa-cash-register"></i>
          </div>

          <div className="integrations-info-content">
            <strong>
              Manage your POS connections
            </strong>

            <p>
              Monitor connection status, sync activity
              and manage all POS integrations from one
              place.
            </p>
          </div>

          <div className="integrations-info-status">
            <i className="fas fa-shield-alt"></i>
            Secure Integration
          </div>

        </div>

        {/* =====================================================
            NEW CONNECTION FORM
        ===================================================== */}

        {showForm && (
          <div className="dashboard-section integration-form-wrapper">

            <div className="section-header-row integration-form-header">

              <div>
                <h2>New POS Connection</h2>

                <p>
                  Enter POS credentials and test the
                  connection before saving.
                </p>
              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleCancel}
                disabled={
                  testing || connecting
                }
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>

            </div>

            <div className="form-section">

              <div className="form-grid">

                {/* Provider */}

                <div className="form-group">

                  <label>
                    Provider
                    <span className="required">
                      *
                    </span>
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-store input-icon"></i>

                    <select
                      name="provider"
                      value={form.provider}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select POS Provider
                      </option>

                      {providers.map(
                        (provider) => (
                          <option
                            key={provider}
                            value={provider}
                          >
                            {provider}
                          </option>
                        )
                      )}
                    </select>

                  </div>
                </div>

                {/* Label */}

                <div className="form-group">

                  <label>
                    Label
                    <span className="required">
                      *
                    </span>
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-tag input-icon"></i>

                    <input
                      type="text"
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      placeholder="e.g. Main Restaurant POS"
                    />

                  </div>
                </div>

                {/* API Key */}

                <div className="form-group">

                  <label>
                    API Key
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-key input-icon"></i>

                    <input
                      type="password"
                      name="apiKey"
                      value={form.apiKey}
                      onChange={handleChange}
                      placeholder="Enter API Key"
                      autoComplete="off"
                    />

                  </div>
                </div>

                {/* Access Token */}

                <div className="form-group">

                  <label>
                    Access Token
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-lock input-icon"></i>

                    <input
                      type="password"
                      name="accessToken"
                      value={form.accessToken}
                      onChange={handleChange}
                      placeholder="Enter Access Token"
                      autoComplete="off"
                    />

                  </div>
                </div>

                {/* Base URL */}

                <div className="form-group full-width">

                  <label>
                    Base URL
                    <span className="required">
                      *
                    </span>
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-link input-icon"></i>

                    <input
                      type="url"
                      name="baseUrl"
                      value={form.baseUrl}
                      onChange={handleChange}
                      placeholder="https://api.example.com"
                    />

                  </div>
                </div>

              </div>

              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div className="integration-security-note">

                <i className="fas fa-shield-alt"></i>

                <div>
                  <strong>
                    Secure & Encrypted
                  </strong>

                  <p>
                    API credentials will be stored
                    securely and encrypted.
                  </p>
                </div>

              </div>

              {/* =================================================
                  CONNECTION ERROR
              ================================================= */}

              {testError && (
                <div className="integration-test-error">

                  <i className="fas fa-exclamation-circle"></i>

                  <div>
                    <strong>
                      Connection Failed
                    </strong>

                    <p>
                      {testError}
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  TEST SUCCESS + POS DETAILS
              ================================================= */}

              {testResult?.success && (
                <div className="integration-test-result">

                  <div className="integration-test-success">

                    <i className="fas fa-check-circle"></i>

                    <div>
                      <strong>
                        POS Connection Successful
                      </strong>

                      <p>
                        Restaurant information was
                        fetched successfully from the
                        POS system.
                      </p>
                    </div>

                  </div>

                  {/* =============================================
                      RESTAURANT DETAILS
                  ============================================= */}

                  <div className="integration-preview-grid">

                    <div>
                      <span>
                        Restaurant Name
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.name || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Legal Name
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.legal_name || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Merchant ID
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.external_merchant_id ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.phone || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.email || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Address Line 1
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.address_line_1 ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Address Line 2
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.address_line_2 ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        City
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.city || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Postal Code
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.postal_code || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Country
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.country || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Currency
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.currency || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Timezone
                      </span>

                      <strong>
                        {testResult.merchant
                          ?.timezone || "—"}
                      </strong>
                    </div>

                  </div>

                  {/* =============================================
                      LOCATIONS
                  ============================================= */}

                  {Array.isArray(
                    testResult.locations
                  ) &&
                    testResult.locations.length >
                      0 && (
                      <div className="integration-location-preview">

                        <h4>
                          POS Locations
                        </h4>

                        {testResult.locations.map(
                          (
                            location,
                            index
                          ) => (
                            <div
                              key={
                                location.external_location_id ||
                                index
                              }
                              className="integration-location-row"
                            >

                              <div>
                                <strong>
                                  {location.name ||
                                    `Location ${
                                      index + 1
                                    }`}
                                </strong>

                                <span>
                                  {[
                                    location.address_line_1,
                                    location.city,
                                    location.postal_code,
                                    location.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") ||
                                    "Location details unavailable"}
                                </span>
                              </div>

                              <span>
                                {location.currency ||
                                  ""}
                              </span>

                            </div>
                          )
                        )}

                      </div>
                    )}

                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    handleTestConnection
                  }
                  disabled={
                    testing || connecting
                  }
                >
                  {testing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Testing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wifi"></i>
                      Test Connection
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleConnect}
                  disabled={
                    testing ||
                    connecting ||
                    !testResult?.success
                  }
                >
                  {connecting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plug"></i>
                      Connect
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            YOUR POS CONNECTIONS
        ===================================================== */}

        <div className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2>
                Your POS Connections
              </h2>

              <p>
                Manage and monitor all connected POS
                systems.
              </p>
            </div>

          </div>

          <div className="integration-connections-list">

            {connections.length === 0 ? (
              <div className="integration-empty-state">

                <i className="fas fa-plug"></i>

                <h3>
                  No POS Connections
                </h3>

                <p>
                  Click Add Connection to connect your
                  first POS system.
                </p>

              </div>
            ) : (
              connections.map(
                (connection) => (
                  <div
                    key={connection.id}
                    className="integration-connection-card"
                  >

                    <div className="integration-connection-top">

                      <div className="integration-pos-avatar">
                        {connection.provider.charAt(
                          0
                        )}
                      </div>

                      <div className="integration-pos-info">

                        <h3>
                          {connection.label}
                        </h3>

                        <p>
                          {connection.provider}
                        </p>

                      </div>

                      <span
                        className={`integration-status-badge status-${connection.status}`}
                      >
                        {connection.status ===
                          "connected" && (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Connected
                          </>
                        )}

                        {connection.status ===
                          "syncing" && (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Syncing
                          </>
                        )}

                        {connection.status ===
                          "error" && (
                          <>
                            <i className="fas fa-exclamation-circle"></i>
                            Error
                          </>
                        )}
                      </span>

                    </div>

                    <div className="integration-connection-meta">

                      <div>
                        <span>
                          Last Sync
                        </span>

                        <strong>
                          {connection.lastSync}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Records
                        </span>

                        <strong>
                          {connection.records}
                        </strong>
                      </div>

                    </div>

                    <div className="integration-connection-actions">

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          handleSyncNow(
                            connection.id
                          )
                        }
                      >
                        <i className="fas fa-sync-alt"></i>
                        Sync Now
                      </button>

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          handleDelete(
                            connection.id
                          )
                        }
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* =====================================================
            SYNC HISTORY
        ===================================================== */}

        <div className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2>
                Sync History
              </h2>

              <p>
                Latest POS synchronization activity.
              </p>
            </div>

          </div>

          <div className="integration-sync-history">

            <div className="integration-sync-row">

              <div className="sync-icon success">
                <i className="fas fa-check"></i>
              </div>

              <div className="sync-main">
                <strong>
                  Sync Successful
                </strong>

                <span>
                  19 Aug 2026, 11:32 AM
                </span>
              </div>

              <div className="sync-records">
                Orders: 128
              </div>

              <div className="sync-records">
                Payments: 87
              </div>

            </div>

            <div className="integration-sync-row">

              <div className="sync-icon success">
                <i className="fas fa-check"></i>
              </div>

              <div className="sync-main">
                <strong>
                  Sync Successful
                </strong>

                <span>
                  19 Aug 2026, 10:17 AM
                </span>
              </div>

              <div className="sync-records">
                Orders: 96
              </div>

              <div className="sync-records">
                Payments: 64
              </div>

            </div>

            <div className="integration-sync-row">

              <div className="sync-icon failed">
                <i className="fas fa-times"></i>
              </div>

              <div className="sync-main">
                <strong>
                  Sync Failed
                </strong>

                <span>
                  18 Aug 2026, 08:30 PM
                </span>
              </div>

              <div className="sync-error">
                Connection timeout
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            SUPPORTED POS
        ===================================================== */}

        <div className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2>
                POS Systems We Support
              </h2>

              <p>
                Available providers for restaurant
                integrations.
              </p>
            </div>

          </div>

          <div className="integration-provider-grid">

            {providers.map(
              (provider) => (
                <div
                  key={provider}
                  className="integration-provider-card"
                >

                  <div className="integration-provider-logo">
                    <i className="fas fa-cash-register"></i>
                  </div>

                  <h3>
                    {provider}
                  </h3>

                  <span className="integration-available">
                    Available
                  </span>

                </div>
              )
            )}

          </div>

        </div>

        {/* =====================================================
            WHAT GETS SYNCED
        ===================================================== */}

        <div className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2>
                What Gets Synced?
              </h2>

              <p>
                Data automatically imported from your
                POS.
              </p>
            </div>

          </div>

          <div className="integration-sync-grid">

            <div className="integration-sync-item">

              <i className="fas fa-receipt"></i>

              <div>
                <h3>Orders</h3>

                <p>
                  Import new POS orders.
                </p>
              </div>

            </div>

            <div className="integration-sync-item">

              <i className="fas fa-utensils"></i>

              <div>
                <h3>
                  Order Items
                </h3>

                <p>
                  Items, quantity and pricing.
                </p>
              </div>

            </div>

            <div className="integration-sync-item">

              <i className="fas fa-credit-card"></i>

              <div>
                <h3>
                  Payments
                </h3>

                <p>
                  Payment status and method.
                </p>
              </div>

            </div>

            <div className="integration-sync-item">

              <i className="fas fa-sync"></i>

              <div>
                <h3>
                  Order Status
                </h3>

                <p>
                  Keep order status updated.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}