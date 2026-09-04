"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";

// =========================================================
// TYPES
// =========================================================

type Period =
  | "day"
  | "week"
  | "month"
  | "custom";

type AnalyticsSummary = {
  revenue: number;
  previous_revenue?: number;
  revenue_change: number;

  orders: number;
  previous_orders?: number;
  orders_change: number;

  average_order_value: number;
  previous_average_order_value?: number;
  average_order_value_change: number;
};

type RevenueTrendItem = {
  label: string;
  orders: number;
  revenue: number;
};

type ProductItem = {
  name: string;
  quantity: number;
  revenue: number;
};

type PaymentMethodItem = {
  payment_method: string;
  orders: number;
  revenue: number;
};

type OrderStatus = {
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
};

type PeriodRange = {
  start?: string;
  end?: string;
  start_date?: string;
  end_date?: string;
};

type AnalyticsResponse = {
  success: boolean;

  period: Period;

  currency: string;

  period_range?: PeriodRange;

  previous_period_range?: PeriodRange;

  summary: AnalyticsSummary;

  revenue_trend: RevenueTrendItem[];

  top_products: ProductItem[];

  low_products: ProductItem[];

  order_status: OrderStatus;

  payment_methods: PaymentMethodItem[];
};

// =========================================================
// AI RECOMMENDATION TYPES
// =========================================================

type DashboardRecommendation = {
  id: number;
  title: string;
  category:
  | "Operations"
  | "Menu"
  | "Marketing"
  | "Inventory";
  description: string;
  problem: string;
  solution: string;
  expected_impact: string;
};

type RecommendationApiResponse = {
  success: boolean;

  data: {
    generation: {
      id: number;

      recommendations:
      DashboardRecommendation[];
    } | null;
  };
};

// =========================================================
// DATE HELPERS
// =========================================================

const formatLocalDate = (
  date: Date
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getToday = () => {
  return formatLocalDate(
    new Date()
  );
};

const getDefaultStart = () => {
  const date =
    new Date();

  date.setDate(
    date.getDate() - 6
  );

  return formatLocalDate(
    date
  );
};

// =========================================================
// DASHBOARD PAGE
// =========================================================

export default function DashboardPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<Period>(
      "day"
    );

  const [
    analytics,
    setAnalytics,
  ] =
    useState<
      AnalyticsResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    showDateFilter,
    setShowDateFilter,
  ] =
    useState(false);

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      getDefaultStart()
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      getToday()
    );

  // =========================================================
  // AI RECOMMENDATION STATE
  // =========================================================

  const [
    aiRecommendations,
    setAiRecommendations,
  ] = useState<
    DashboardRecommendation[]
  >([]);

  const [
    recommendationsLoading,
    setRecommendationsLoading,
  ] = useState(true);

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics =
    async (
      period: Period,
      customStart?: string,
      customEnd?: string
    ) => {
      try {
        setLoading(true);
        setError("");

        const token =
          sessionStorage.getItem(
            "token"
          );

        if (!token) {
          setError(
            "Login session not found."
          );

          return;
        }

        let url =
          "/owner/analytics";

        if (
          period ===
          "custom"
        ) {
          if (
            !customStart ||
            !customEnd
          ) {
            setError(
              "Please select both dates."
            );

            return;
          }

          url +=
            `?start_date=${customStart}` +
            `&end_date=${customEnd}`;
        } else {
          url +=
            `?period=${period}`;
        }

        const response =
          await api.get(
            url,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          !response.data
            ?.success
        ) {
          setError(
            response.data
              ?.message ||
            "Unable to load analytics."
          );

          return;
        }

        setAnalytics(
          response.data
        );
      } catch (
      err: any
      ) {
        console.error(
          "Analytics loading error:",
          err
        );

        const errors =
          err?.response
            ?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(
              errors
            )[0];

          if (
            Array.isArray(
              firstError
            ) &&
            firstError.length
          ) {
            setError(
              String(
                firstError[0]
              )
            );

            return;
          }
        }

        setError(
          err?.response
            ?.data?.message ||
          "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================================
  // STANDARD PERIOD
  // =========================================================

  useEffect(() => {
    if (
      activeTab !==
      "custom"
    ) {
      loadAnalytics(
        activeTab
      );
    }
  }, [activeTab]);

    // =========================================================
  // LOAD LATEST AI RECOMMENDATIONS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations =
      async () => {
        try {
          setRecommendationsLoading(
            true
          );

          const response =
            await api.get<RecommendationApiResponse>(
              "/owner/recommendations"
            );

          const items =
            response.data.data
              ?.generation
              ?.recommendations ||
            [];

          if (!cancelled) {
            setAiRecommendations(
              items.slice(0, 3)
            );
          }
        } catch (requestError) {
          console.error(
            "Dashboard AI recommendation error:",
            requestError
          );

          if (!cancelled) {
            setAiRecommendations(
              []
            );
          }
        } finally {
          if (!cancelled) {
            setRecommendationsLoading(
              false
            );
          }
        }
      };

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // CUSTOM DATE RANGE
  // =========================================================
  
  const applyCustomRange =
    () => {
      if (
        !startDate ||
        !endDate
      ) {
        setError(
          "Please select both dates."
        );

        return;
      }

      if (
        startDate >
        endDate
      ) {
        setError(
          "Start date cannot be after end date."
        );

        return;
      }

      setActiveTab(
        "custom"
      );

      setShowDateFilter(
        false
      );

      loadAnalytics(
        "custom",
        startDate,
        endDate
      );
    };

  const resetDateFilter =
    () => {
      setStartDate(
        getDefaultStart()
      );

      setEndDate(
        getToday()
      );

      setShowDateFilter(
        false
      );

      setActiveTab(
        "day"
      );
    };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatMoney = (
    value:
      | number
      | string
  ) => {
    const currency =
      analytics?.currency ||
      "INR";

    try {
      return new Intl.NumberFormat(
        "en",
        {
          style:
            "currency",

          currency,

          minimumFractionDigits:
            2,

          maximumFractionDigits:
            2,
        }
      ).format(
        Number(
          value || 0
        )
      );
    } catch {
      return (
        `${currency} ` +
        Number(
          value || 0
        ).toFixed(2)
      );
    }
  };

  const formatPaymentMethod =
    (
      value: string
    ) => {
      if (!value) {
        return "Unknown";
      }

      return value
        .replace(
          /_/g,
          " "
        )
        .replace(
          /\b\w/g,
          (char) =>
            char.toUpperCase()
        );
    };

  const formatDisplayDate =
    (
      value?: string
    ) => {
      if (!value) {
        return "";
      }

      const parts =
        value.split("-");

      if (
        parts.length !==
        3
      ) {
        return value;
      }

      return (
        `${parts[2]}/` +
        `${parts[1]}/` +
        `${parts[0]}`
      );
    };

  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (
    loading &&
    !analytics
  ) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          <div className="dashboard-section">

            <div className="empty-state">

              <i className="fas fa-spinner fa-spin"></i>

              <h3>
                Loading Analytics
              </h3>

              <p>
                Please wait while we calculate
                your restaurant performance.
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // INITIAL ERROR
  // =========================================================

  if (
    error &&
    !analytics
  ) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          <div className="dashboard-section">

            <div className="empty-state">

              <i className="fas fa-exclamation-circle"></i>

              <h3>
                Unable to Load Analytics
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={() =>
                  loadAnalytics(
                    "day"
                  )
                }
              >
                <i className="fas fa-sync-alt"></i>

                Try Again
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // =========================================================
  // DATA
  // =========================================================

  const currentStats =
    analytics.summary;

  const currentRevenueData =
    analytics
      .revenue_trend ||
    [];

  const topProducts =
    analytics
      .top_products ||
    [];

  const lowProducts =
    analytics
      .low_products ||
    [];

  const paymentMethods =
    analytics
      .payment_methods ||
    [];

  const orderStatus =
    analytics
      .order_status;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="dashboard-header">

          <div>

            <h1 className="dashboard-title">
              Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Real-time restaurant analytics
              powered by your synced POS data.
            </p>

          </div>

          {/* =================================================
              RIGHT SIDE FILTERS
          ================================================= */}

          <div className="dashboard-header-actions">

            <div className="dashboard-tabs">

              <button
                type="button"
                className={`tab ${activeTab ===
                  "day"
                  ? "active"
                  : ""
                  }`}
                onClick={() => {
                  setShowDateFilter(
                    false
                  );

                  setActiveTab(
                    "day"
                  );
                }}
              >
                Day
              </button>

              <button
                type="button"
                className={`tab ${activeTab ===
                  "week"
                  ? "active"
                  : ""
                  }`}
                onClick={() => {
                  setShowDateFilter(
                    false
                  );

                  setActiveTab(
                    "week"
                  );
                }}
              >
                Week
              </button>

              <button
                type="button"
                className={`tab ${activeTab ===
                  "month"
                  ? "active"
                  : ""
                  }`}
                onClick={() => {
                  setShowDateFilter(
                    false
                  );

                  setActiveTab(
                    "month"
                  );
                }}
              >
                Month
              </button>

            </div>

            {/* DATE BUTTON */}

            <div className="dashboard-date-filter">

              <button
                type="button"
                className={`dashboard-date-button ${activeTab ===
                  "custom"
                  ? "dashboard-date-button-active"
                  : ""
                  }`}
                onClick={() =>
                  setShowDateFilter(
                    !showDateFilter
                  )
                }
              >
                <i className="fas fa-calendar-alt"></i>

                {activeTab ===
                  "custom" &&
                  analytics
                    .period_range
                    ?.start_date &&
                  analytics
                    .period_range
                    ?.end_date
                  ? `${formatDisplayDate(
                    analytics
                      .period_range
                      .start_date
                  )} - ${formatDisplayDate(
                    analytics
                      .period_range
                      .end_date
                  )}`
                  : "Date"}
              </button>

              {/* DATE POPUP */}

              {showDateFilter && (

                <div className="dashboard-date-popup">

                  <div className="dashboard-date-popup-header">

                    <div>

                      <strong>
                        Date Range
                      </strong>

                      <span>
                        Filter dashboard data
                      </span>

                    </div>

                    <button
                      type="button"
                      className="dashboard-date-close"
                      onClick={() =>
                        setShowDateFilter(
                          false
                        )
                      }
                    >
                      <i className="fas fa-times"></i>
                    </button>

                  </div>

                  <div className="dashboard-date-fields">

                    <div className="dashboard-date-field">

                      <label>
                        From
                      </label>

                      <input
                        type="date"
                        value={
                          startDate
                        }
                        max={
                          endDate
                        }
                        onChange={(
                          e
                        ) =>
                          setStartDate(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                    <div className="dashboard-date-field">

                      <label>
                        To
                      </label>

                      <input
                        type="date"
                        value={
                          endDate
                        }
                        min={
                          startDate
                        }
                        max={
                          getToday()
                        }
                        onChange={(
                          e
                        ) =>
                          setEndDate(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>

                  <div className="dashboard-date-actions">

                    <button
                      type="button"
                      className="dashboard-date-reset"
                      onClick={
                        resetDateFilter
                      }
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      className="primary-btn"
                      disabled={
                        loading
                      }
                      onClick={
                        applyCustomRange
                      }
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Applying...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i>
                          Apply
                        </>
                      )}
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            CUSTOM RANGE
        ===================================================== */}

        {activeTab ===
          "custom" &&
          analytics
            .period_range
            ?.start_date &&
          analytics
            .period_range
            ?.end_date && (

            <div className="dashboard-selected-range">

              <i className="fas fa-calendar-check"></i>

              Showing data from

              <strong>
                {formatDisplayDate(
                  analytics
                    .period_range
                    .start_date
                )}
              </strong>

              to

              <strong>
                {formatDisplayDate(
                  analytics
                    .period_range
                    .end_date
                )}
              </strong>

            </div>

          )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="dashboard-analytics-error">

            <i className="fas fa-exclamation-circle"></i>

            {error}

          </div>

        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="stats-grid">

          {/* REVENUE */}

          <div className="stat-card">

            <div className="stat-label">
              Revenue
            </div>

            <div className="stat-value">
              {formatMoney(
                currentStats
                  .revenue
              )}
            </div>

            <div
              className={`stat-change ${currentStats
                .revenue_change >=
                0
                ? "positive"
                : "negative"
                }`}
            >
              {currentStats
                .revenue_change >=
                0
                ? "↑"
                : "↓"}{" "}

              {Math.abs(
                currentStats
                  .revenue_change
              )}
              %
            </div>

          </div>

          {/* ORDERS */}

          <div className="stat-card">

            <div className="stat-label">
              Orders
            </div>

            <div className="stat-value">
              {
                currentStats
                  .orders
              }
            </div>

            <div
              className={`stat-change ${currentStats
                .orders_change >=
                0
                ? "positive"
                : "negative"
                }`}
            >
              {currentStats
                .orders_change >=
                0
                ? "↑"
                : "↓"}{" "}

              {Math.abs(
                currentStats
                  .orders_change
              )}
              %
            </div>

          </div>

          {/* AVG CUSTOMER SPEND */}

          <div className="stat-card">

            <div className="stat-label">
              Avg. Customer Spend
            </div>

            <div className="stat-value">
              {formatMoney(
                currentStats
                  .average_order_value
              )}
            </div>

            <div
              className={`stat-change ${currentStats
                .average_order_value_change >=
                0
                ? "positive"
                : "negative"
                }`}
            >
              {currentStats
                .average_order_value_change >=
                0
                ? "↑"
                : "↓"}{" "}

              {Math.abs(
                currentStats
                  .average_order_value_change
              )}
              %
            </div>

          </div>

        </div>

        {/* =====================================================
            REVENUE TREND + TOP PRODUCTS
        ===================================================== */}

        <div className="dashboard-row">

          {/* REVENUE TREND */}

          <div className="dashboard-col">

            <div className="card">

              <h3 className="card-title">
                Revenue Trend
              </h3>

              <div className="revenue-table">

                <div className="revenue-table-header">

                  <span>
                    Period
                  </span>

                  <span>
                    Revenue
                  </span>

                </div>

                {currentRevenueData.length ===
                  0 ? (

                  <div className="revenue-table-row">

                    <span>
                      No sales data
                    </span>

                    <span>
                      {formatMoney(
                        0
                      )}
                    </span>

                  </div>

                ) : (

                  currentRevenueData.map(
                    (
                      item
                    ) => (

                      <div
                        className="revenue-table-row"
                        key={
                          item.label
                        }
                      >

                        <span>
                          {
                            item.label
                          }
                        </span>

                        <span>
                          {formatMoney(
                            item
                              .revenue
                          )}
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

          {/* TOP PRODUCTS */}

          <div className="dashboard-col">

            <div className="card">

              <h3 className="card-title">
                Top Products
              </h3>

              <div className="top-products-table">

                <div className="top-products-header">

                  <span>
                    Product
                  </span>

                  <span>
                    Revenue
                  </span>

                </div>

                {topProducts.length ===
                  0 ? (

                  <div className="top-products-row">

                    <span>
                      No product data
                    </span>

                    <span>
                      {formatMoney(
                        0
                      )}
                    </span>

                  </div>

                ) : (

                  topProducts.map(
                    (
                      product
                    ) => (

                      <div
                        className="top-products-row"
                        key={
                          product.name
                        }
                      >

                        <span>

                          {
                            product.name
                          }

                          <small className="dashboard-product-meta">
                            {
                              product.quantity
                            }{" "}
                            sold
                          </small>

                        </span>

                        <span>
                          {formatMoney(
                            product
                              .revenue
                          )}
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            LOW PRODUCTS + PAYMENT METHODS
        ===================================================== */}

        <div className="dashboard-row">

          {/* LOW PRODUCTS */}

          <div className="dashboard-col">

            <div className="card">

              <h3 className="card-title">
                Low Selling Products
              </h3>

              <div className="top-products-table">

                <div className="top-products-header">

                  <span>
                    Product
                  </span>

                  <span>
                    Revenue
                  </span>

                </div>

                {lowProducts.length ===
                  0 ? (

                  <div className="top-products-row">

                    <span>
                      No product data
                    </span>

                    <span>
                      {formatMoney(
                        0
                      )}
                    </span>

                  </div>

                ) : (

                  lowProducts.map(
                    (
                      product
                    ) => (

                      <div
                        className="top-products-row"
                        key={
                          product.name
                        }
                      >

                        <span>

                          {
                            product.name
                          }

                          <small className="dashboard-product-meta">
                            {
                              product.quantity
                            }{" "}
                            sold
                          </small>

                        </span>

                        <span>
                          {formatMoney(
                            product
                              .revenue
                          )}
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

          {/* PAYMENT METHODS */}

          <div className="dashboard-col">

            <div className="card">

              <h3 className="card-title">
                Payment Methods
              </h3>

              <div className="top-products-table">

                <div className="top-products-header">

                  <span>
                    Method
                  </span>

                  <span>
                    Orders
                  </span>

                </div>

                {paymentMethods.length ===
                  0 ? (

                  <div className="top-products-row">

                    <span>
                      No payment data
                    </span>

                    <span>
                      0
                    </span>

                  </div>

                ) : (

                  paymentMethods.map(
                    (
                      payment
                    ) => (

                      <div
                        className="top-products-row"
                        key={
                          payment
                            .payment_method
                        }
                      >

                        <span>

                          {formatPaymentMethod(
                            payment
                              .payment_method
                          )}

                          <small className="dashboard-product-meta">
                            {formatMoney(
                              payment
                                .revenue
                            )}
                          </small>

                        </span>

                        <span>
                          {
                            payment
                              .orders
                          }
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            ORDER STATUS
        ===================================================== */}

        <div className="card dashboard-status-card">

          <h3 className="card-title">
            Order Status
          </h3>

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-label">
                Pending
              </div>

              <div className="stat-value">
                {
                  orderStatus
                    .pending
                }
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                Preparing
              </div>

              <div className="stat-value">
                {
                  orderStatus
                    .preparing
                }
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                Ready
              </div>

              <div className="stat-value">
                {
                  orderStatus
                    .ready
                }
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                Completed
              </div>

              <div className="stat-value">
                {
                  orderStatus
                    .completed
                }
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                Cancelled
              </div>

              <div className="stat-value">
                {
                  orderStatus
                    .cancelled
                }
              </div>

            </div>

          </div>

        </div>

                {/* =====================================================
            AI RECOMMENDATIONS
        ===================================================== */}

        <div className="ai-recommendations-section">
          <div className="ai-recommendations-header">
            <div>
              <h2 className="section-title">
                AI Recommendations
              </h2>

              <p className="dashboard-subtitle">
                Latest insights generated from your
               cis restaurant&apos;s performance data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="ai-badge">
                AI Powered
              </span>

              <Link
                href="/dashboard/recommendations"
                className="primary-btn"
              >
                View All

                <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>

          <div className="recommendations-grid-full">
            {recommendationsLoading ? (
              <div className="recommendation-card-full">
                <div className="recommendation-header">
                  <h4 className="recommendation Insurance-title">
                    <i className="fas fa-spinner fa-spin" />{" "}
                    Loading recommendations
                  </h4>
                </div>

                <p className="recommendation-description">
                  Fetching your latest saved AI
                  recommendations.
                </p>
              </div>
            ) : aiRecommendations.length === 0 ? (
              <div className="recommendation-card-full">
                <div className="recommendation-header">
                  <h4 className="recommendation-title">
                    No recommendations yet
                  </h4>
                </div>

                <p className="recommendation-description">
                  Generate recommendations after syncing
                  enough POS order data.
                </p>

                <Link
                  href="/dashboard/recommendations"
                  className="primary-btn"
                >
                  Open Recommendations

                  <i className="fas fa-arrow-right" />
                </Link>
              </div>
            ) : (
              aiRecommendations.map(
                (recommendation) => (
                  <article
                    key={recommendation.id}
                    className="recommendation-card-full"
                  >
                    <div className="recommendation-header">
                      <h4 className="recommendation-title">
                        {recommendation.title}
                      </h4>

                      <span
                        className={`recommendation-category category-${recommendation.category.toLowerCase()}`}
                      >
                        {recommendation.category}
                      </span>
                    </div>

                    <p className="recommendation-description">
                      {recommendation.description}
                    </p>

                    <div className="recommendation-action">
                      <strong>
                        Problem:
                      </strong>{" "}

                      {recommendation.problem}
                    </div>

                    <div className="recommendation-impact">
                      <strong>
                        Solution:
                      </strong>{" "}

                      {recommendation.solution}
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </div>

      </div>

    </div>
  );
}