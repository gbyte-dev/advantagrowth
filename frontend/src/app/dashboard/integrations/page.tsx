"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  showSuccess,
  showError,
  showWarning,
  confirmDialog,
} from "@/lib/feedback";
/* =========================================================
   TYPES
   ========================================================= */

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

type PosRestaurantOption = {
  restaurant_guid?: string | null;
  restaurant_name?: string | null;
  location_name?: string | null;
  management_group_guid?: string | null;
};

type PosTestResult = {
  success: boolean;

  message?: string;

  merchant?: PosMerchant;

  locations?: PosLocation[];

  restaurants_count?: number;

  restaurants?: PosRestaurantOption[];
};

type ApiConnection = {
  id: number;

  provider: string;
  label: string;

  status: string;

  external_merchant_id?: string | null;

  last_connected_at?: string | null;
  last_synced_at?: string | null;

  locations_count?: number;

  is_active?: boolean;
};

type SyncLog = {
  id: number;

  pos_connection_id: number;

  connection_label?: string | null;
  provider?: string | null;

  sync_type: string;

  status:
    | "pending"
    | "running"
    | "success"
    | "failed";

  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;

  message?: string | null;
  error_message?: string | null;

  started_at?: string | null;
  completed_at?: string | null;
};

/* =========================================================
   PROVIDERS
   ========================================================= */

const connectionProviders = [
  "Toast POS",
  "Restolution",
];

const supportedProviders = [
  "Toast POS",
  "Restolution",
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function IntegrationsPage() {
  /* =========================================================
     FORM / ACTION STATES
     ========================================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const [connecting, setConnecting] =
    useState(false);

  /* =========================================================
     TEST RESULT
     ========================================================= */

  const [testResult, setTestResult] =
    useState<PosTestResult | null>(null);

  const [testError, setTestError] =
    useState("");

  /* =========================================================
     CONNECTIONS
     ========================================================= */

  const [connections, setConnections] =
    useState<Connection[]>([]);

  const [
    connectionsLoading,
    setConnectionsLoading,
  ] = useState(true);

  const [
    connectionsError,
    setConnectionsError,
  ] = useState("");

  /* =========================================================
     SYNC HISTORY
     ========================================================= */

  const [syncLogs, setSyncLogs] =
    useState<SyncLog[]>([]);

  const [
    syncHistoryLoading,
    setSyncHistoryLoading,
  ] = useState(true);

  const [
    syncHistoryError,
    setSyncHistoryError,
  ] = useState("");

  /* =========================================================
     FORM
     ========================================================= */

  const [form, setForm] = useState({
    provider: "",
    label: "",
    apiKey: "",
    accessToken: "",
    baseUrl: "",
    restaurantGuid: "",
  });

  const isToast =
    form.provider === "Toast POS";

  const isRestolution =
    form.provider === "Restolution";

  const isMockToast = isToast &&
    (
      form.baseUrl.includes("127.0.0.1") ||
      form.baseUrl.includes("localhost")
    );
    
  const hasSelectableRestaurants =
    (
      (isToast && !isMockToast) ||
      isRestolution
    ) &&
    Array.isArray(testResult?.restaurants) &&
    testResult.restaurants.length > 0;

  /* =========================================================
     PROVIDER FIELD LABELS
     ========================================================= */

  const credentialLabels = {
    apiKey: isToast
      ? "Client ID"
      : "API Key",

    accessToken: isToast
      ? "Client Secret"
      : isRestolution
      ? "Secret"
      : "Access Token",

    apiKeyPlaceholder: isToast
      ? "Enter Toast Client ID"
      : isRestolution
      ? "Enter Restolution API Key"
      : "Enter API Key",

    accessTokenPlaceholder: isToast
      ? "Enter Toast Client Secret"
      : isRestolution
      ? "Enter Restolution Secret"
      : "Enter Access Token",

    baseUrlPlaceholder: isToast
      ? "e.g. http://127.0.0.1:8001/api/mock-pos"
      : isRestolution
      ? "https://restolution.fi/resto/api"
      : "https://api.example.com",
  };

  /* =========================================================
     LOAD CONNECTIONS
     ========================================================= */

  const loadConnections = async () => {
    try {
      setConnectionsLoading(true);
      setConnectionsError("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setConnectionsError(
          "Login session not found. Please login again."
        );

        return;
      }

      const response = await api.get(
        "/owner/pos-connections",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const items: ApiConnection[] =
        response.data?.connections || [];

      setConnections(
        items.map((item) => ({
          id: item.id,

          provider:
            item.provider,

          label:
            item.label,

          status:
            item.status === "syncing"
              ? "syncing"
              : item.status === "error"
              ? "error"
              : "connected",

          lastSync:
            item.last_synced_at ||
            item.last_connected_at ||
            "Not synced yet",

          records:
            item.locations_count || 0,
        }))
      );
    } catch (err: any) {
      console.error(
        "POS connections load error:",
        err
      );

      setConnectionsError(
        err?.response?.data?.message ||
          "Unable to load POS connections."
      );
    } finally {
      setConnectionsLoading(false);
    }
  };

  /* =========================================================
     LOAD SYNC HISTORY
     ========================================================= */

  const loadSyncHistory = async () => {
    try {
      setSyncHistoryLoading(true);
      setSyncHistoryError("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setSyncHistoryError(
          "Login session not found. Please login again."
        );

        return;
      }

      const response = await api.get(
        "/owner/pos-sync-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const logs: SyncLog[] =
        response.data?.logs || [];

      setSyncLogs(logs);
    } catch (err: any) {
      console.error(
        "POS sync history load error:",
        err
      );

      setSyncHistoryError(
        err?.response?.data?.message ||
          "Unable to load POS sync history."
      );
    } finally {
      setSyncHistoryLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadConnections();
    loadSyncHistory();
  }, []);

  /* =========================================================
     HANDLE FORM CHANGE
     ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } =
      e.target;

    /*
     * Restaurant selection must NOT clear
     * the successful POS test result.
     */

    if (name === "restaurantGuid") {
      setForm((prev) => ({
        ...prev,
        restaurantGuid: value,
      }));

      setTestError("");

      return;
    }

    /*
     * Any connection credential/provider change
     * invalidates the previous test.
     */

    setForm((prev) => ({
      ...prev,

      [name]: value,

      restaurantGuid: "",
    }));

    setTestResult(null);
    setTestError("");
  };

  /* =========================================================
     RESET FORM
     ========================================================= */

  const resetForm = () => {
    setForm({
      provider: "",
      label: "",
      apiKey: "",
      accessToken: "",
      baseUrl: "",
      restaurantGuid: "",
    });

    setTestResult(null);
    setTestError("");
  };

  /* =========================================================
     OPEN FORM
     ========================================================= */

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  /* =========================================================
     CANCEL FORM
     ========================================================= */

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  /* =========================================================
     TEST CONNECTION
     ========================================================= */

  const handleTestConnection =
    async () => {
      if (
        !form.provider ||
        !form.label.trim() ||
        !form.baseUrl.trim()
      ) {
        setTestError(
          "Provider, Label and Base URL are required."
        );

        return;
      }

      /*
       * Toast requires Client ID + Secret.
       */

      if (
        isToast &&
        !isMockToast &&
        (
          !form.apiKey.trim() ||
          !form.accessToken.trim()
        )
      ) {
        setTestError(
          "Toast Client ID and Client Secret are required."
        );

        return;
      }

      /*
       * Restolution adapter currently requires
       * at least one credential.
       */

      if (
        isRestolution &&
        (
          !form.apiKey.trim() ||
          !form.accessToken.trim()
        )
      ) {
        setTestError(
          "Restolution API Key and Secret are required."
        );

        return;
      }

      try {
        setTesting(true);

        setTestError("");
        setTestResult(null);

        /*
         * Old selected POS restaurant
         * should be cleared before a new test.
         */

        setForm((prev) => ({
          ...prev,
          restaurantGuid: "",
        }));

        const token =
          sessionStorage.getItem("token");

        if (!token) {
          setTestError(
            "Login session not found. Please login again."
          );

          return;
        }

        const response =
          await api.post(
            "/owner/pos-connections/test",
            {
              provider:
                form.provider,

              label:
                form.label.trim(),

              api_key:
                form.apiKey.trim() ||
                null,

              access_token:
                form.accessToken.trim() ||
                null,

              base_url:
                form.baseUrl.trim(),
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response.data?.success
        ) {
          setTestResult(
            response.data as PosTestResult
          );

          /*
           * If Toast or Restolution has exactly one accessible
           * restaurant, automatically select it.
           */

          const restaurants:
            PosRestaurantOption[] =
              response.data?.restaurants ||
              [];

          if (
            (
              form.provider === "Toast POS" ||
              form.provider === "Restolution"
            ) &&
            restaurants.length === 1 &&
            restaurants[0]
              ?.restaurant_guid
          ) {
            setForm((prev) => ({
              ...prev,

              restaurantGuid:
                restaurants[0]
                  .restaurant_guid ||
                "",
            }));
          }

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

  /* =========================================================
     CONNECT AND SAVE
     ========================================================= */

  const handleConnect =
  async () => {
    if (
      !form.provider ||
      !form.label.trim() ||
      !form.baseUrl.trim()
    ) {
      showWarning(
        "Provider, Label and Base URL are required."
      );

      return;
    }

    if (
      isToast &&
      !isMockToast &&
      (
        !form.apiKey.trim() ||
        !form.accessToken.trim()
      )
    ) {
      showWarning(
        "Toast Client ID and Client Secret are required."
      );

      return;
    }

    if (
      isRestolution &&
      (
        !form.apiKey.trim() ||
        !form.accessToken.trim()
      )
    ) {
      showWarning(
        "Restolution API Key and Secret are required."
      );

      return;
    }

    /*
     * Must test current credentials first.
     */

    if (!testResult?.success) {
      showWarning(
        "Please test the POS connection first."
      );

      return;
    }

    /*
     * Real Toast and Restolution require a selected restaurant
     * whenever the provider returns selectable restaurants.
     */

    if (
      hasSelectableRestaurants &&
      !form.restaurantGuid
    ) {
      showWarning(
        isRestolution
          ? "Please select a Restolution restaurant."
          : "Please select a Toast restaurant."
      );

      return;
    }

    try {
      setConnecting(true);

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        showError(
          "Login session not found. Please login again."
        );

        return;
      }

      const response =
        await api.post(
          "/owner/pos-connections",
          {
            provider:
              form.provider,

            label:
              form.label.trim(),

            api_key:
              form.apiKey.trim() ||
              null,

            access_token:
              form.accessToken.trim() ||
              null,

            base_url:
              form.baseUrl.trim(),

            external_merchant_id:
              (isToast || isRestolution)
                ? form.restaurantGuid ||
                  null
                : null,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        !response.data?.success
      ) {
        showError(
          response.data?.message ||
            "Unable to add POS connection."
        );

        return;
      }

      await loadConnections();
      await loadSyncHistory();

      resetForm();
      setShowForm(false);

      showSuccess(
        response.data?.message ||
          "POS connection added successfully."
      );
    } catch (err: any) {
      console.error(
        "POS connection save error:",
        err
      );

      showError(
        err?.response?.data?.error ||
          err?.response?.data
            ?.message ||
          "Unable to add POS connection."
      );
    } finally {
      setConnecting(false);
    }
  };

  /* =========================================================
     DELETE CONNECTION
     ========================================================= */
const handleDelete = async (
  id: number
) => {
  const connection =
    connections.find(
      (item) =>
        item.id === id
    );

  const confirmed =
    await confirmDialog({
      title:
        "Delete POS Connection?",

      message:
        `Are you sure you want to delete ${
          connection?.label ||
          "this POS connection"
        }? Synced data from this POS connection will also be removed.`,

      confirmText:
        "Delete Connection",

      cancelText:
        "Cancel",

      danger:
        true,
    });

  if (!confirmed) {
    return;
  }

  try {
    const token =
      sessionStorage.getItem("token");

    if (!token) {
      showError(
        "Login session not found. Please login again."
      );

      return;
    }

    const response =
      await api.delete(
        `/owner/pos-connections/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (
      !response.data?.success
    ) {
      showError(
        response.data?.message ||
          "Unable to delete POS connection."
      );

      return;
    }

    await loadConnections();
    await loadSyncHistory();

    showSuccess(
      response.data?.message ||
        "POS connection deleted successfully."
    );
  } catch (err: any) {
    console.error(
      "POS connection delete error:",
      err
    );

    showError(
      err?.response?.data?.message ||
        "Unable to delete POS connection."
    );
  }
};

  /* =========================================================
     SYNC NOW
     ========================================================= */

 const handleSyncNow = async (
  id: number
) => {
  try {
    const token =
      sessionStorage.getItem("token");

    if (!token) {
      showError(
        "Login session not found. Please login again."
      );

      return;
    }

    setConnections(
      (prev) =>
        prev.map(
          (connection) =>
            connection.id === id
              ? {
                  ...connection,

                  status:
                    "syncing",
                }
              : connection
        )
    );

    const response =
      await api.post(
        `/owner/pos-connections/${id}/sync`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (
      !response.data?.success
    ) {
      await loadConnections();
      await loadSyncHistory();

      showError(
        response.data?.message ||
          "POS synchronization failed."
      );

      return;
    }

    await loadConnections();
    await loadSyncHistory();

    showSuccess(
      response.data?.message ||
        "POS synchronization completed successfully."
    );
  } catch (err: any) {
    console.error(
      "POS synchronization error:",
      err
    );

    await loadConnections();
    await loadSyncHistory();

    showError(
      err?.response?.data?.error ||
        err?.response?.data
          ?.message ||
        "POS synchronization failed."
    );
  }
};
  /* =========================================================
     DATE FORMATTER
     ========================================================= */

  const formatDateTime = (
    value?: string | null
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString();
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="dashboard-page integrations-page">
      <div className="dashboard-container">

        {/* HEADER */}

        <div className="integrations-header">

          <div>

            <h1>
              POS Integrations
            </h1>

            <p>
              Connect and manage your restaurant POS
              systems, sync orders, payments and sales
              data automatically.
            </p>

          </div>

          <button
            type="button"
            className="integrations-add-btn"
            onClick={
              handleOpenForm
            }
          >
            <i className="fas fa-plus"></i>
            Add Connection
          </button>

        </div>

        {/* INFO BANNER */}

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

        {/* NEW CONNECTION */}

        {showForm && (
          <div className="dashboard-section integration-form-wrapper">

            <div className="section-header-row integration-form-header">

              <div>

                <h2>
                  New POS Connection
                </h2>

                <p>
                  Enter POS credentials and test the
                  connection before saving.
                </p>

              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  handleCancel
                }
                disabled={
                  testing ||
                  connecting
                }
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>

            </div>

            <div className="form-section">

              <div className="form-grid">

                {/* PROVIDER */}

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
                      value={
                        form.provider
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select POS Provider
                      </option>

                      {connectionProviders.map(
                        (provider) => (
                          <option
                            key={
                              provider
                            }
                            value={
                              provider
                            }
                          >
                            {provider}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* LABEL */}

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
                      value={
                        form.label
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Main Restaurant POS"
                    />

                  </div>

                </div>

                {/* API KEY / CLIENT ID */}

                <div className="form-group">

                  <label>
                    {credentialLabels.apiKey}

                    {(
                      (isToast && !isMockToast) ||
                      isRestolution
                    ) && (
                      <span className="required">
                        *
                      </span>
                    )}
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-key input-icon"></i>

                    <input
                      type={
                        isToast
                          ? "text"
                          : "password"
                      }
                      name="apiKey"
                      value={
                        form.apiKey
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        credentialLabels.apiKeyPlaceholder
                      }
                      autoComplete="off"
                    />

                  </div>

                </div>

                {/* ACCESS TOKEN / CLIENT SECRET */}

                <div className="form-group">

                  <label>
                    {credentialLabels.accessToken}

                    {(
                      (isToast && !isMockToast) ||
                      isRestolution
                    ) && (
                      <span className="required">
                        *
                      </span>
                    )}
                  </label>

                  <div className="input-wrapper">

                    <i className="fas fa-lock input-icon"></i>

                    <input
                      type="password"
                      name="accessToken"
                      value={
                        form.accessToken
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        credentialLabels.accessTokenPlaceholder
                      }
                      autoComplete="new-password"
                    />

                  </div>

                </div>

                {/* BASE URL */}

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
                      value={
                        form.baseUrl
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        credentialLabels.baseUrlPlaceholder
                      }
                    />

                  </div>

                </div>

                {/* POS RESTAURANT SELECTOR */}

                {hasSelectableRestaurants && (
                  <div className="form-group full-width">

                    <label>
                      {isRestolution
                        ? "Restolution Restaurant"
                        : "Toast Restaurant"}

                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="input-wrapper">

                      <i className="fas fa-building input-icon"></i>

                      <select
                        name="restaurantGuid"
                        value={
                          form.restaurantGuid
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="">
                          {isRestolution
                            ? "Select Restolution Restaurant"
                            : "Select Toast Restaurant"}
                        </option>

                        {testResult!.restaurants!.map(
                          (
                            restaurant,
                            index
                          ) => (
                            <option
                              key={
                                restaurant.restaurant_guid ||
                                index
                              }
                              value={
                                restaurant.restaurant_guid ||
                                ""
                              }
                            >
                              {restaurant.restaurant_name ||
                                restaurant.location_name ||
                                `Restaurant ${
                                  index + 1
                                }`}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>
                )}

              </div>

              {/* SECURITY */}

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

              {/* ERROR */}

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

              {/* SUCCESS / PREVIEW */}

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
                          ?.postal_code ||
                          "—"}
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
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      ", "
                                    ) ||
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

              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    handleTestConnection
                  }
                  disabled={
                    testing ||
                    connecting
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
                  onClick={
                    handleConnect
                  }
                  disabled={
                    testing ||
                    connecting ||
                    !testResult?.success ||
                    (hasSelectableRestaurants &&
                      !form.restaurantGuid)
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

        {/* CONNECTIONS */}

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

            <button
              type="button"
              className="secondary-btn"
              onClick={
                loadConnections
              }
              disabled={
                connectionsLoading
              }
            >
              <i
                className={`fas fa-sync-alt ${
                  connectionsLoading
                    ? "fa-spin"
                    : ""
                }`}
              ></i>

              Refresh
            </button>

          </div>

          <div className="integration-connections-list">

            {connectionsLoading ? (
              <div className="integration-empty-state">

                <i className="fas fa-spinner fa-spin"></i>

                <h3>
                  Loading Connections
                </h3>

                <p>
                  Loading saved POS connections from
                  the database.
                </p>

              </div>
            ) : connectionsError ? (
              <div className="integration-empty-state">

                <i className="fas fa-exclamation-circle"></i>

                <h3>
                  Unable to Load Connections
                </h3>

                <p>
                  {connectionsError}
                </p>

              </div>
            ) : connections.length === 0 ? (
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
                    key={
                      connection.id
                    }
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
                          {formatDateTime(
                            connection.lastSync
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          POS Locations
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
                        disabled={
                          connection.status ===
                          "syncing"
                        }
                      >

                        <i
                          className={`fas fa-sync-alt ${
                            connection.status ===
                            "syncing"
                              ? "fa-spin"
                              : ""
                          }`}
                        ></i>

                        {connection.status ===
                        "syncing"
                          ? "Syncing..."
                          : "Sync Now"}

                      </button>

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          handleDelete(
                            connection.id
                          )
                        }
                        disabled={
                          connection.status ===
                          "syncing"
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

        {/* SYNC HISTORY */}

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

            <button
              type="button"
              className="secondary-btn"
              onClick={
                loadSyncHistory
              }
              disabled={
                syncHistoryLoading
              }
            >
              <i
                className={`fas fa-sync-alt ${
                  syncHistoryLoading
                    ? "fa-spin"
                    : ""
                }`}
              ></i>

              Refresh
            </button>

          </div>

          <div className="integration-sync-history">

            {syncHistoryLoading ? (
              <div className="integration-empty-state">

                <i className="fas fa-spinner fa-spin"></i>

                <h3>
                  Loading Sync History
                </h3>

                <p>
                  Fetching POS synchronization
                  activity.
                </p>

              </div>
            ) : syncHistoryError ? (
              <div className="integration-empty-state">

                <i className="fas fa-exclamation-circle"></i>

                <h3>
                  Unable to Load Sync History
                </h3>

                <p>
                  {syncHistoryError}
                </p>

              </div>
            ) : syncLogs.length === 0 ? (
              <div className="integration-empty-state">

                <i className="fas fa-clock"></i>

                <h3>
                  No Sync History
                </h3>

                <p>
                  Sync activity will appear here after
                  your first POS synchronization.
                </p>

              </div>
            ) : (
              syncLogs.map(
                (log) => (
                  <div
                    key={
                      log.id
                    }
                    className="integration-sync-row"
                  >

                    <div
                      className={`sync-icon ${
                        log.status ===
                        "success"
                          ? "success"
                          : log.status ===
                            "failed"
                          ? "failed"
                          : ""
                      }`}
                    >

                      {log.status ===
                        "success" && (
                        <i className="fas fa-check"></i>
                      )}

                      {log.status ===
                        "failed" && (
                        <i className="fas fa-times"></i>
                      )}

                      {log.status ===
                        "running" && (
                        <i className="fas fa-spinner fa-spin"></i>
                      )}

                      {log.status ===
                        "pending" && (
                        <i className="fas fa-clock"></i>
                      )}

                    </div>

                    <div className="sync-main">

                      <strong>
                        {log.status ===
                        "success"
                          ? "Sync Successful"
                          : log.status ===
                            "failed"
                          ? "Sync Failed"
                          : log.status ===
                            "running"
                          ? "Sync Running"
                          : "Sync Pending"}
                      </strong>

                      <span>
                        {log.connection_label ||
                          log.provider ||
                          "POS Connection"}
                      </span>

                      <span>
                        {formatDateTime(
                          log.completed_at ||
                            log.started_at
                        )}
                      </span>

                    </div>

                    {log.status ===
                    "success" ? (
                      <>
                        <div className="sync-records">
                          Processed:{" "}
                          {
                            log.records_processed
                          }
                        </div>

                        <div className="sync-records">
                          Created:{" "}
                          {
                            log.records_created
                          }
                        </div>
                      </>
                    ) : log.status ===
                      "failed" ? (
                      <div className="sync-error">

                        {log.error_message ||
                          log.message ||
                          "Synchronization failed"}

                      </div>
                    ) : (
                      <div className="sync-records">

                        {log.status ===
                        "running"
                          ? "Synchronizing..."
                          : "Waiting..."}

                      </div>
                    )}

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* SUPPORTED PROVIDERS */}

        <div className="dashboard-section">

          <div className="section-header-row">

            <div>
              <h2>
                POS Systems We Support
              </h2>

              <p>
                POS providers available for restaurant
                integration.
              </p>
            </div>

          </div>

          <div className="integration-provider-grid">

            {supportedProviders.map(
              (provider) => (
                <div
                  key={
                    provider
                  }
                  className="integration-provider-card"
                >

                  <div className="integration-provider-logo">
                    <i className="fas fa-cash-register"></i>
                  </div>

                  <h3>
                    {provider}
                  </h3>

                  <span className="integration-available">
                    Supported
                  </span>

                </div>
              )
            )}

          </div>

        </div>

        {/* WHAT GETS SYNCED */}

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
                <h3>
                  Orders
                </h3>

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