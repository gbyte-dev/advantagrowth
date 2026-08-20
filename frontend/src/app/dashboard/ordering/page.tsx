"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  id: number;

  menu_item_id?: number | null;

  external_item_id?: string | null;

  external_menu_item_id?: string | null;

  item_name: string;

  unit_price: number | string;

  quantity: number;

  total_price: number | string;

  modifiers?: any[] | null;
};

type PosConnection = {
  id: number;

  provider: string;

  label: string;

  status: string;

  external_merchant_id?: string | null;

  last_synced_at?: string | null;
};

type PosPayment = {
  id: number;

  external_payment_id?: string | null;

  payment_method?: string | null;

  card_type?: string | null;

  amount: number | string;

  tip_amount: number | string;

  status: string;

  paid_at?: string | null;
};

type Order = {
  id: number;

  order_number?: string | null;

  restaurant_id: number;

  pos_connection_id?: number | null;

  source?: string | null;

  external_order_id?: string | null;

  external_location_id?: string | null;

  order_type?: string | null;

  table_number?: string | null;

  customer_name: string;

  customer_phone: string;

  customer_email?: string | null;

  delivery_address?: string | null;

  subtotal: number | string;

  tax_amount?: number | string;

  delivery_charge: number | string;

  tip_amount?: number | string;

  total: number | string;

  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";

  payment_status: string;

  payment_id?: string | null;

  payment_method?: string | null;

  special_instructions?: string | null;

  pos_created_at?: string | null;

  pos_updated_at?: string | null;

  created_at: string;

  updated_at?: string;

  items: OrderItem[];

  pos_connection?: PosConnection | null;

  pos_payments?: PosPayment[];
};

type OrderSummary = {
  total_orders: number;

  pending: number;

  preparing: number;

  ready: number;

  completed: number;

  cancelled: number;

  paid: number;

  pos_orders: number;

  website_orders: number;

  total_sales: number;
};

type Reservation = {
  id: number;

  customerName: string;

  phone: string;

  email: string;

  guests: number;

  date: string;

  time: string;

  specialRequests?: string | null;

  status:
    | "confirmed"
    | "pending"
    | "cancelled";

  tableNumber?: number;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderingPage() {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [activeTab, setActiveTab] =
    useState<
      "orders" | "reservations"
    >("orders");

  /* =========================================================
     ORDERS
  ========================================================= */

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [summary, setSummary] =
    useState<OrderSummary>({
      total_orders: 0,

      pending: 0,

      preparing: 0,

      ready: 0,

      completed: 0,

      cancelled: 0,

      paid: 0,

      pos_orders: 0,

      website_orders: 0,

      total_sales: 0,
    });

  const [
    orderLoading,
    setOrderLoading,
  ] = useState(false);

  const [orderError, setOrderError] =
    useState("");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(null);

  const [
    orderDetailsLoading,
    setOrderDetailsLoading,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("all");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [
    orderTypeFilter,
    setOrderTypeFilter,
  ] = useState("all");

  /* =========================================================
     RESERVATIONS
  ========================================================= */

  const [
    reservations,
    setReservations,
  ] = useState<Reservation[]>([]);

  const [
    reservationLoading,
    setReservationLoading,
  ] = useState(false);

  const [
    reservationError,
    setReservationError,
  ] = useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  /* =========================================================
     SIDEBAR
  ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "sidebarCollapsed"
      );

    if (saved === "true") {
      setSidebarCollapsed(true);
    }

    const handleSidebarToggle = (
      e: CustomEvent
    ) => {
      setSidebarCollapsed(
        e.detail.collapsed
      );
    };

    window.addEventListener(
      "sidebarToggle",
      handleSidebarToggle as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarToggle",
        handleSidebarToggle as EventListener
      );
    };
  }, []);

  /* =========================================================
     LOAD OWNER ORDERS
  ========================================================= */

  const loadOrders = async () => {
    try {
      setOrderLoading(true);

      setOrderError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setOrderError(
          "Owner authentication token not found. Please login again."
        );

        return;
      }

      const response =
        await api.get(
          "/owner/orders",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            params: {
              search:
                search.trim() ||
                undefined,

              status:
                statusFilter !==
                "all"
                  ? statusFilter
                  : undefined,

              payment_status:
                paymentFilter !==
                "all"
                  ? paymentFilter
                  : undefined,

              source:
                sourceFilter !==
                "all"
                  ? sourceFilter
                  : undefined,

              order_type:
                orderTypeFilter !==
                "all"
                  ? orderTypeFilter
                  : undefined,
            },
          }
        );

      setOrders(
        response.data?.orders || []
      );

      setSummary(
        response.data?.summary || {
          total_orders: 0,
          pending: 0,
          preparing: 0,
          ready: 0,
          completed: 0,
          cancelled: 0,
          paid: 0,
          pos_orders: 0,
          website_orders: 0,
          total_sales: 0,
        }
      );
    } catch (error: any) {
      console.error(
        "Order loading error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setOrderError(
          "Your owner session has expired. Please login again."
        );
      } else {
        setOrderError(
          error.response?.data
            ?.message ||
            "Unable to load orders."
        );
      }
    } finally {
      setOrderLoading(false);
    }
  };

  /* =========================================================
     LOAD ORDER DETAILS
  ========================================================= */

  const loadOrderDetails =
    async (
      orderId: number
    ) => {
      try {
        setOrderDetailsLoading(
          true
        );

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          alert(
            "Owner authentication token not found."
          );

          return;
        }

        const response =
          await api.get(
            `/owner/orders/${orderId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setSelectedOrder(
          response.data?.order ||
            null
        );
      } catch (error: any) {
        console.error(
          "Order details error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to load order details."
        );
      } finally {
        setOrderDetailsLoading(
          false
        );
      }
    };

  /* =========================================================
     LOAD RESERVATIONS
  ========================================================= */

  const loadReservations =
    async () => {
      try {
        setReservationLoading(
          true
        );

        setReservationError("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setReservationError(
            "Owner authentication token not found. Please login again."
          );

          return;
        }

        const response =
          await api.get(
            "/owner/reservations",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          response.data
            ?.reservations ||
          [];

        const formattedReservations:
          Reservation[] =
            data.map(
              (res: any) => ({
                id: res.id,

                customerName:
                  res.customer_name,

                phone:
                  res.phone,

                email:
                  res.email,

                guests:
                  res.guests,

                date:
                  res.reservation_date,

                time:
                  res.reservation_time,

                specialRequests:
                  res.special_requests,

                status:
                  res.status,

                tableNumber:
                  res.table_number ||
                  undefined,
              })
            );

        setReservations(
          formattedReservations
        );
      } catch (error: any) {
        console.error(
          "Reservation loading error:",
          error
        );

        if (
          error.response?.status ===
          401
        ) {
          setReservationError(
            "Your owner session has expired. Please login again."
          );
        } else {
          setReservationError(
            error.response?.data
              ?.message ||
              "Unable to load reservations."
          );
        }
      } finally {
        setReservationLoading(
          false
        );
      }
    };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadOrders();

    loadReservations();
  }, []);

  /* =========================================================
     FILTER CHANGE
  ========================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          loadOrders();
        },
        300
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    search,
    statusFilter,
    paymentFilter,
    sourceFilter,
    orderTypeFilter,
  ]);

  /* =========================================================
     UPDATE ORDER STATUS
  ========================================================= */

  const updateOrderStatus =
    async (
      order: Order,
      status:
        | "pending"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
    ) => {
      /*
       * POS orders are controlled by
       * POS synchronization.
       */

      if (
        order.pos_connection_id
      ) {
        alert(
          "This order is managed by the connected POS system. Its status updates automatically during synchronization."
        );

        return;
      }

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          alert(
            "Owner authentication token not found."
          );

          return;
        }

        setUpdatingId(
          order.id
        );

        const response =
          await api.patch(
            `/owner/orders/${order.id}/status`,
            {
              status,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const updatedOrder =
          response.data?.order;

        setOrders(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                order.id
                  ? {
                      ...item,
                      ...updatedOrder,
                    }
                  : item
            )
        );

        if (
          selectedOrder?.id ===
          order.id
        ) {
          setSelectedOrder(
            (current) =>
              current
                ? {
                    ...current,
                    ...updatedOrder,
                  }
                : current
          );
        }

        await loadOrders();
      } catch (error: any) {
        console.error(
          "Order status update error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to update order status."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================================================
     UPDATE RESERVATION STATUS
  ========================================================= */

  const updateReservationStatus =
    async (
      reservationId: number,
      status:
        | "confirmed"
        | "cancelled"
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          alert(
            "Owner authentication token not found."
          );

          return;
        }

        const message =
          status ===
          "confirmed"
            ? "Are you sure you want to confirm this reservation?"
            : "Are you sure you want to cancel this reservation?";

        if (
          !window.confirm(message)
        ) {
          return;
        }

        setUpdatingId(
          reservationId
        );

        const response =
          await api.patch(
            `/owner/reservations/${reservationId}/status`,
            {
              status,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const updatedReservation =
          response.data
            ?.reservation;

        setReservations(
          (current) =>
            current.map(
              (reservation) =>
                reservation.id ===
                reservationId
                  ? {
                      ...reservation,

                      status:
                        updatedReservation.status,
                    }
                  : reservation
            )
        );

        alert(
          status ===
          "confirmed"
            ? "Reservation confirmed successfully."
            : "Reservation cancelled successfully."
        );
      } catch (error: any) {
        console.error(
          "Reservation status update error:",
          error
        );

        alert(
          error.response?.data
            ?.message ||
            "Unable to update reservation."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",

        month: "short",

        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    date?: string | null
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        hour12: true,
      }
    );
  };

  const formatTime = (
    time: string
  ) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.split(":");

    if (
      !hours ||
      !minutes
    ) {
      return time;
    }

    const hour =
      Number(hours);

    const period =
      hour >= 12
        ? "PM"
        : "AM";

    const formattedHour =
      hour % 12 || 12;

    return `${String(
      formattedHour
    ).padStart(
      2,
      "0"
    )}:${minutes} ${period}`;
  };

  const getOrderItemsCount = (
    order: Order
  ) => {
    return (
      order.items?.reduce(
        (
          count,
          item
        ) =>
          count +
          Number(
            item.quantity
          ),
        0
      ) || 0
    );
  };

  const getOrderStatusLabel = (
    status: string
  ) => {
    if (!status) {
      return "-";
    }

    return (
      status
        .charAt(0)
        .toUpperCase() +
      status.slice(1)
    );
  };

  const getSourceLabel = (
    order: Order
  ) => {
    if (
      !order.pos_connection_id
    ) {
      return "Website";
    }

    if (
      order.pos_connection
        ?.provider
    ) {
      return order
        .pos_connection
        .provider;
    }

    switch (
      order.source
    ) {
      case "toast":
        return "Toast POS";

      case "restolution":
        return "Restolution";

      case "custom_api":
        return "Custom API";

      default:
        return "POS";
    }
  };

  const getSourceClass = (
    order: Order
  ) => {
    if (
      !order.pos_connection_id
    ) {
      return "website";
    }

    switch (
      order.source
    ) {
      case "toast":
        return "toast";

      case "restolution":
        return "restolution";

      case "custom_api":
        return "custom";

      default:
        return "pos";
    }
  };

  const getDisplayOrderId = (
    order: Order
  ) => {
    return (
      order.external_order_id ||
      order.order_number ||
      String(order.id)
    );
  };

  const displayOrders =
    useMemo(
      () => orders,
      [orders]
    );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="owner-layout">
      <main
        className={`owner-main-content ${
          sidebarCollapsed
            ? "sidebar-collapsed-main"
            : "sidebar-expanded-main"
        }`}
      >
        <div className="dashboard-page">
          <div className="dashboard-container">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="dashboard-welcome">
              <div className="welcome-content">

                <div className="welcome-left">

                  <div className="page-badge">

                    <i className="fas fa-shopping-cart"></i>

                    <span>
                      Orders & Reservations
                    </span>

                  </div>

                  <h1>
                    Ordering & Reservations
                  </h1>

                  <p>
                    Manage website orders, POS orders,
                    table reservations and customer
                    bookings.
                  </p>

                </div>

                <div className="header-stats">

                  <div className="header-stat">

                    <span className="header-stat-number">
                      {
                        summary.total_orders
                      }
                    </span>

                    <span className="header-stat-label">
                      Orders
                    </span>

                  </div>

                  <div className="header-stat">

                    <span className="header-stat-number">
                      {
                        reservations.length
                      }
                    </span>

                    <span className="header-stat-label">
                      Reservations
                    </span>

                  </div>

                </div>

              </div>
            </div>

            {/* ==================================================
                TABS
            ================================================== */}

            <div className="tab-nav">

              <button
                type="button"
                className={`tab-btn ${
                  activeTab ===
                  "orders"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    "orders"
                  )
                }
              >
                <i className="fas fa-shopping-cart"></i>

                Orders
              </button>

              <button
                type="button"
                className={`tab-btn ${
                  activeTab ===
                  "reservations"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    "reservations"
                  )
                }
              >
                <i className="fas fa-calendar-check"></i>

                Reservations
              </button>

            </div>

            {/* ==================================================
                ORDERS
            ================================================== */}

            {activeTab ===
              "orders" && (
              <>
                {/* SUMMARY */}

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",

                    gap:
                      "15px",

                    marginBottom:
                      "20px",
                  }}
                >

                  {[
                    {
                      label:
                        "Total Orders",

                      value:
                        summary.total_orders,

                      icon:
                        "fa-receipt",
                    },

                    {
                      label:
                        "POS Orders",

                      value:
                        summary.pos_orders,

                      icon:
                        "fa-cash-register",
                    },

                    {
                      label:
                        "Website",

                      value:
                        summary.website_orders,

                      icon:
                        "fa-globe",
                    },

                    {
                      label:
                        "Paid",

                      value:
                        summary.paid,

                      icon:
                        "fa-credit-card",
                    },

                    {
                      label:
                        "Total Sales",

                      value:
                        `₹${Number(
                          summary.total_sales
                        ).toFixed(
                          2
                        )}`,

                      icon:
                        "fa-indian-rupee-sign",
                    },
                  ].map(
                    (stat) => (
                      <div
                        key={
                          stat.label
                        }
                        className="dashboard-section"
                        style={{
                          marginBottom:
                            0,

                          padding:
                            "18px",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "12px",
                          }}
                        >

                          <div
                            style={{
                              width:
                                "42px",

                              height:
                                "42px",

                              borderRadius:
                                "10px",

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              background:
                                "#f4f4f4",
                            }}
                          >
                            <i
                              className={`fas ${stat.icon}`}
                            ></i>
                          </div>

                          <div>

                            <strong
                              style={{
                                display:
                                  "block",

                                fontSize:
                                  "20px",
                              }}
                            >
                              {
                                stat.value
                              }
                            </strong>

                            <span
                              style={{
                                fontSize:
                                  "12px",

                                color:
                                  "#777",
                              }}
                            >
                              {
                                stat.label
                              }
                            </span>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

                <div className="dashboard-section">

                  <div className="section-header-row">

                    <div>
                      <h2>
                        Recent Orders
                      </h2>

                      <p>
                        Website and POS orders for your restaurant.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="tab-btn"
                      onClick={
                        loadOrders
                      }
                      disabled={
                        orderLoading
                      }
                    >
                      <i
                        className={`fas ${
                          orderLoading
                            ? "fa-spinner fa-spin"
                            : "fa-sync-alt"
                        }`}
                      ></i>

                      Refresh
                    </button>

                  </div>

                  {/* FILTERS */}

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "minmax(220px, 2fr) repeat(4, minmax(140px, 1fr))",

                      gap:
                        "12px",

                      marginBottom:
                        "20px",
                    }}
                  >

                    <input
                      type="text"
                      value={
                        search
                      }
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Search customer, order ID, phone, table..."
                      style={{
                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "8px",

                        padding:
                          "10px 12px",
                      }}
                    />

                    <select
                      value={
                        statusFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setStatusFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "8px",

                        padding:
                          "10px",
                      }}
                    >
                      <option value="all">
                        All Status
                      </option>

                      <option value="pending">
                        Pending
                      </option>

                      <option value="preparing">
                        Preparing
                      </option>

                      <option value="ready">
                        Ready
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>

                    <select
                      value={
                        paymentFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setPaymentFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "8px",

                        padding:
                          "10px",
                      }}
                    >
                      <option value="all">
                        All Payments
                      </option>

                      <option value="paid">
                        Paid
                      </option>

                      <option value="pending">
                        Pending
                      </option>
                    </select>

                    <select
                      value={
                        sourceFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setSourceFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "8px",

                        padding:
                          "10px",
                      }}
                    >
                      <option value="all">
                        All Sources
                      </option>

                      <option value="website">
                        Website
                      </option>

                      <option value="toast">
                        Toast
                      </option>

                      <option value="restolution">
                        Restolution
                      </option>

                      <option value="custom_api">
                        Custom API
                      </option>
                    </select>

                    <select
                      value={
                        orderTypeFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setOrderTypeFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "8px",

                        padding:
                          "10px",
                      }}
                    >
                      <option value="all">
                        All Types
                      </option>

                      <option value="dine_in">
                        Dine In
                      </option>

                      <option value="takeaway">
                        Takeaway
                      </option>

                      <option value="delivery">
                        Delivery
                      </option>
                    </select>

                  </div>

                  {/* ERROR */}

                  {orderError && (
                    <div
                      style={{
                        padding:
                          "15px 20px",

                        marginBottom:
                          "20px",

                        borderRadius:
                          "10px",

                        background:
                          "#fff1f1",

                        color:
                          "#d32f2f",
                      }}
                    >
                      <i className="fas fa-exclamation-circle"></i>{" "}

                      {
                        orderError
                      }
                    </div>
                  )}

                  {/* ORDERS CONTENT */}

                  {orderLoading ? (
                    <div className="empty-state">

                      <div className="empty-state-icon">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>

                      <h3>
                        Loading Orders...
                      </h3>

                      <p>
                        Please wait while orders are loaded.
                      </p>

                    </div>
                  ) : displayOrders.length ===
                    0 ? (
                    <div className="empty-state">

                      <div className="empty-state-icon">
                        <i className="fas fa-shopping-cart"></i>
                      </div>

                      <h3>
                        No Orders Found
                      </h3>

                      <p>
                        No orders match the selected filters.
                      </p>

                    </div>
                  ) : (
                    <div className="table-responsive">

                      <table className="menu-table">

                        <thead>
                          <tr>
                            <th>
                              Order
                            </th>

                            <th>
                              Source
                            </th>

                            <th>
                              Customer
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Items
                            </th>

                            <th>
                              Total
                            </th>

                            <th>
                              Payment
                            </th>

                            <th>
                              Status
                            </th>

                            <th>
                              Time
                            </th>

                            <th>
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>

                          {displayOrders.map(
                            (
                              order
                            ) => (
                              <tr
                                key={
                                  order.id
                                }
                              >

                                {/* ORDER */}

                                <td>

                                  <strong
                                    className="item-name"
                                  >
                                    #
                                    {
                                      getDisplayOrderId(
                                        order
                                      )
                                    }
                                  </strong>

                                  {order.table_number && (
                                    <div
                                      style={{
                                        fontSize:
                                          "12px",

                                        color:
                                          "#777",

                                        marginTop:
                                          "4px",
                                      }}
                                    >
                                      Table:{" "}
                                      {
                                        order.table_number
                                      }
                                    </div>
                                  )}

                                </td>

                                {/* SOURCE */}

                                <td>

                                  <span
                                    className={`order-source-badge source-${getSourceClass(
                                      order
                                    )}`}
                                  >
                                    <i
                                      className={`fas ${
                                        order.pos_connection_id
                                          ? "fa-cash-register"
                                          : "fa-globe"
                                      }`}
                                    ></i>{" "}

                                    {
                                      getSourceLabel(
                                        order
                                      )
                                    }
                                  </span>

                                </td>

                                {/* CUSTOMER */}

                                <td>

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      flexDirection:
                                        "column",

                                      gap:
                                        "4px",
                                    }}
                                  >

                                    <strong>
                                      {
                                        order.customer_name
                                      }
                                    </strong>

                                    {order.customer_phone &&
                                      order.customer_phone !==
                                        "N/A" && (
                                        <span
                                          style={{
                                            fontSize:
                                              "12px",

                                            color:
                                              "#777",
                                          }}
                                        >
                                          <i className="fas fa-phone"></i>{" "}

                                          {
                                            order.customer_phone
                                          }
                                        </span>
                                      )}

                                  </div>

                                </td>

                                {/* TYPE */}

                                <td>

                                  <span>
                                    {order.order_type
                                      ? order.order_type.replace(
                                          /_/g,
                                          " "
                                        )
                                      : "-"}
                                  </span>

                                </td>

                                {/* ITEMS */}

                                <td>

                                  <div
                                    style={{
                                      minWidth:
                                        "180px",
                                    }}
                                  >

                                    {order.items
                                      ?.slice(
                                        0,
                                        2
                                      )
                                      .map(
                                        (
                                          item
                                        ) => (
                                          <div
                                            key={
                                              item.id
                                            }
                                            style={{
                                              fontSize:
                                                "13px",

                                              marginBottom:
                                                "4px",
                                            }}
                                          >
                                            {
                                              item.item_name
                                            }{" "}
                                            ×{" "}
                                            {
                                              item.quantity
                                            }
                                          </div>
                                        )
                                      )}

                                    {order.items &&
                                      order.items.length >
                                        2 && (
                                        <small
                                          style={{
                                            color:
                                              "#777",
                                          }}
                                        >
                                          +
                                          {order
                                            .items
                                            .length -
                                            2}{" "}
                                          more
                                        </small>
                                      )}

                                    <div
                                      style={{
                                        fontSize:
                                          "11px",

                                        color:
                                          "#888",

                                        marginTop:
                                          "5px",
                                      }}
                                    >
                                      {
                                        getOrderItemsCount(
                                          order
                                        )
                                      }{" "}
                                      item(s)
                                    </div>

                                  </div>

                                </td>

                                {/* TOTAL */}

                                <td>
                                  <span className="price-tag">
                                    ₹
                                    {Number(
                                      order.total
                                    ).toFixed(
                                      2
                                    )}
                                  </span>
                                </td>

                                {/* PAYMENT */}

                                <td>

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      flexDirection:
                                        "column",

                                      gap:
                                        "4px",
                                    }}
                                  >

                                    <span
                                      className={`status-toggle status-${
                                        order.payment_status ===
                                        "paid"
                                          ? "completed"
                                          : "pending"
                                      }`}
                                    >
                                      <span
                                        className={`status-dot-sm dot-${
                                          order.payment_status ===
                                          "paid"
                                            ? "completed"
                                            : "pending"
                                        }`}
                                      ></span>

                                      {
                                        order.payment_status
                                      }
                                    </span>

                                    {order.payment_method && (
                                      <small
                                        style={{
                                          color:
                                            "#777",
                                        }}
                                      >
                                        {
                                          order.payment_method
                                        }
                                      </small>
                                    )}

                                  </div>

                                </td>

                                {/* STATUS */}

                                <td>
                                  <span
                                    className={`status-toggle status-${order.status}`}
                                  >
                                    <span
                                      className={`status-dot-sm dot-${order.status}`}
                                    ></span>

                                    {
                                      getOrderStatusLabel(
                                        order.status
                                      )
                                    }
                                  </span>
                                </td>

                                {/* TIME */}

                                <td>
                                  {formatDateTime(
                                    order.pos_created_at ||
                                      order.created_at
                                  )}
                                </td>

                                {/* ACTION */}

                                <td>

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      flexDirection:
                                        "column",

                                      gap:
                                        "7px",
                                    }}
                                  >

                                    <button
                                      type="button"
                                      className="secondary-btn"
                                      disabled={
                                        orderDetailsLoading
                                      }
                                      onClick={() =>
                                        loadOrderDetails(
                                          order.id
                                        )
                                      }
                                    >
                                      <i className="fas fa-eye"></i>

                                      View
                                    </button>

                                    {order.pos_connection_id ? (
                                      <span
                                        style={{
                                          fontSize:
                                            "11px",

                                          color:
                                            "#777",

                                          maxWidth:
                                            "140px",
                                        }}
                                      >
                                        <i className="fas fa-sync-alt"></i>{" "}

                                        POS managed
                                      </span>
                                    ) : (
                                      <select
                                        value={
                                          order.status
                                        }
                                        disabled={
                                          updatingId ===
                                          order.id
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          updateOrderStatus(
                                            order,
                                            e.target
                                              .value as
                                              | "pending"
                                              | "preparing"
                                              | "ready"
                                              | "completed"
                                              | "cancelled"
                                          )
                                        }
                                        style={{
                                          border:
                                            "1px solid #ddd",

                                          borderRadius:
                                            "7px",

                                          padding:
                                            "7px 10px",

                                          background:
                                            "#fff",
                                        }}
                                      >
                                        <option value="pending">
                                          Pending
                                        </option>

                                        <option value="preparing">
                                          Preparing
                                        </option>

                                        <option value="ready">
                                          Ready
                                        </option>

                                        <option value="completed">
                                          Completed
                                        </option>

                                        <option value="cancelled">
                                          Cancelled
                                        </option>
                                      </select>
                                    )}

                                  </div>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              </>
            )}

            {/* ==================================================
                RESERVATIONS
            ================================================== */}

            {activeTab ===
              "reservations" && (
              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>
                    <h2>
                      Table Reservations
                    </h2>

                    <p>
                      Manage customer bookings and reservation requests.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="tab-btn"
                    onClick={
                      loadReservations
                    }
                    disabled={
                      reservationLoading
                    }
                  >
                    <i
                      className={`fas ${
                        reservationLoading
                          ? "fa-spinner fa-spin"
                          : "fa-sync-alt"
                      }`}
                    ></i>

                    Refresh
                  </button>

                </div>

                {reservationError && (
                  <div
                    style={{
                      padding:
                        "15px 20px",

                      marginBottom:
                        "20px",

                      borderRadius:
                        "10px",

                      background:
                        "#fff1f1",

                      color:
                        "#d32f2f",
                    }}
                  >
                    <i className="fas fa-exclamation-circle"></i>{" "}

                    {
                      reservationError
                    }
                  </div>
                )}

                {reservationLoading ? (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>

                    <h3>
                      Loading Reservations...
                    </h3>

                  </div>
                ) : reservations.length ===
                  0 ? (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      <i className="fas fa-calendar-check"></i>
                    </div>

                    <h3>
                      No Reservations Yet
                    </h3>

                  </div>
                ) : (
                  <div className="table-responsive">

                    <table className="menu-table">

                      <thead>
                        <tr>
                          <th>
                            Customer
                          </th>

                          <th>
                            Contact
                          </th>

                          <th>
                            Guests
                          </th>

                          <th>
                            Date
                          </th>

                          <th>
                            Time
                          </th>

                          <th>
                            Special Request
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {reservations.map(
                          (
                            res
                          ) => (
                            <tr
                              key={
                                res.id
                              }
                            >

                              <td>
                                <span className="item-name">
                                  {
                                    res.customerName
                                  }
                                </span>
                              </td>

                              <td>
                                <div
                                  style={{
                                    display:
                                      "flex",

                                    flexDirection:
                                      "column",

                                    gap:
                                      "4px",
                                  }}
                                >
                                  <a
                                    href={`tel:${res.phone}`}
                                    style={{
                                      color:
                                        "inherit",

                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    <i className="fas fa-phone"></i>{" "}

                                    {
                                      res.phone
                                    }
                                  </a>

                                  <a
                                    href={`mailto:${res.email}`}
                                    style={{
                                      color:
                                        "inherit",

                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    <i className="fas fa-envelope"></i>{" "}

                                    {
                                      res.email
                                    }
                                  </a>
                                </div>
                              </td>

                              <td>
                                {
                                  res.guests
                                }{" "}
                                guests
                              </td>

                              <td>
                                {formatDate(
                                  res.date
                                )}
                              </td>

                              <td>
                                {formatTime(
                                  res.time
                                )}
                              </td>

                              <td>
                                {res.specialRequests ? (
                                  <span
                                    title={
                                      res.specialRequests
                                    }
                                  >
                                    {res
                                      .specialRequests
                                      .length >
                                    30
                                      ? `${res.specialRequests.slice(
                                          0,
                                          30
                                        )}...`
                                      : res.specialRequests}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      color:
                                        "#999",
                                    }}
                                  >
                                    None
                                  </span>
                                )}
                              </td>

                              <td>
                                <span
                                  className={`status-toggle status-${res.status}`}
                                >
                                  <span
                                    className={`status-dot-sm dot-${res.status}`}
                                  ></span>

                                  {
                                    res.status
                                  }
                                </span>
                              </td>

                              <td>

                                {res.status ===
                                "pending" ? (
                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      gap:
                                        "8px",

                                      flexWrap:
                                        "wrap",
                                    }}
                                  >

                                    <button
                                      type="button"
                                      disabled={
                                        updatingId ===
                                        res.id
                                      }
                                      onClick={() =>
                                        updateReservationStatus(
                                          res.id,
                                          "confirmed"
                                        )
                                      }
                                      style={{
                                        border:
                                          "none",

                                        borderRadius:
                                          "7px",

                                        padding:
                                          "7px 12px",

                                        background:
                                          "#198754",

                                        color:
                                          "#fff",

                                        cursor:
                                          "pointer",

                                        fontSize:
                                          "13px",
                                      }}
                                    >
                                      <i
                                        className={`fas ${
                                          updatingId ===
                                          res.id
                                            ? "fa-spinner fa-spin"
                                            : "fa-check"
                                        }`}
                                      ></i>{" "}

                                      Confirm
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        updatingId ===
                                        res.id
                                      }
                                      onClick={() =>
                                        updateReservationStatus(
                                          res.id,
                                          "cancelled"
                                        )
                                      }
                                      style={{
                                        border:
                                          "none",

                                        borderRadius:
                                          "7px",

                                        padding:
                                          "7px 12px",

                                        background:
                                          "#dc3545",

                                        color:
                                          "#fff",

                                        cursor:
                                          "pointer",

                                        fontSize:
                                          "13px",
                                      }}
                                    >
                                      <i className="fas fa-times"></i>{" "}

                                      Cancel
                                    </button>

                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      color:
                                        "#777",

                                      fontSize:
                                        "13px",
                                    }}
                                  >
                                    No Action
                                  </span>
                                )}

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* =====================================================
            ORDER DETAIL MODAL
        ===================================================== */}

        {selectedOrder && (
          <div
            onClick={() =>
              setSelectedOrder(
                null
              )
            }
            style={{
              position:
                "fixed",

              inset: 0,

              background:
                "rgba(0,0,0,0.45)",

              zIndex:
                9999,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                "20px",
            }}
          >

            <div
              onClick={(
                e
              ) =>
                e.stopPropagation()
              }
              style={{
                background:
                  "#fff",

                width:
                  "min(900px, 100%)",

                maxHeight:
                  "90vh",

                overflowY:
                  "auto",

                borderRadius:
                  "16px",

                padding:
                  "24px",
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "flex-start",

                  gap:
                    "20px",

                  marginBottom:
                    "22px",
                }}
              >

                <div>
                  <h2
                    style={{
                      margin:
                        "0 0 6px",
                    }}
                  >
                    Order #
                    {
                      getDisplayOrderId(
                        selectedOrder
                      )
                    }
                  </h2>

                  <p
                    style={{
                      margin: 0,

                      color:
                        "#777",
                    }}
                  >
                    {
                      getSourceLabel(
                        selectedOrder
                      )
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  <i className="fas fa-times"></i>

                  Close
                </button>

              </div>

              {/* BASIC INFO */}

              <div
                className="integration-preview-grid"
                style={{
                  marginBottom:
                    "24px",
                }}
              >

                <div>
                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      selectedOrder.customer_name
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {
                      selectedOrder.customer_phone ||
                      "-"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Order Type
                  </span>

                  <strong>
                    {
                      selectedOrder.order_type ||
                      "-"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Table
                  </span>

                  <strong>
                    {
                      selectedOrder.table_number ||
                      "-"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      getOrderStatusLabel(
                        selectedOrder.status
                      )
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Payment
                  </span>

                  <strong>
                    {
                      selectedOrder.payment_status
                    }
                  </strong>
                </div>

              </div>

              {/* ITEMS */}

              <h3>
                Order Items
              </h3>

              <div
                style={{
                  marginBottom:
                    "24px",
                }}
              >

                {selectedOrder.items?.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        gap:
                          "15px",

                        padding:
                          "12px 0",

                        borderBottom:
                          "1px solid #eee",
                      }}
                    >

                      <div>
                        <strong>
                          {
                            item.item_name
                          }
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "12px",

                            color:
                              "#777",

                            marginTop:
                              "3px",
                          }}
                        >
                          Qty:{" "}
                          {
                            item.quantity
                          }{" "}
                          × ₹
                          {Number(
                            item.unit_price
                          ).toFixed(
                            2
                          )}
                        </div>
                      </div>

                      <strong>
                        ₹
                        {Number(
                          item.total_price
                        ).toFixed(
                          2
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>

              {/* TOTALS */}

              <h3>
                Order Totals
              </h3>

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(140px, 1fr))",

                  gap:
                    "12px",

                  marginBottom:
                    "24px",
                }}
              >

                {[
                  [
                    "Subtotal",
                    selectedOrder.subtotal,
                  ],

                  [
                    "Tax",
                    selectedOrder.tax_amount ||
                      0,
                  ],

                  [
                    "Delivery",
                    selectedOrder.delivery_charge ||
                      0,
                  ],

                  [
                    "Tip",
                    selectedOrder.tip_amount ||
                      0,
                  ],

                  [
                    "Total",
                    selectedOrder.total,
                  ],
                ].map(
                  (
                    [
                      label,
                      value,
                    ]
                  ) => (
                    <div
                      key={
                        String(
                          label
                        )
                      }
                      style={{
                        background:
                          "#f8f8f8",

                        borderRadius:
                          "10px",

                        padding:
                          "12px",
                      }}
                    >
                      <small>
                        {
                          label
                        }
                      </small>

                      <strong
                        style={{
                          display:
                            "block",

                          marginTop:
                            "4px",
                        }}
                      >
                        ₹
                        {Number(
                          value
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </div>
                  )
                )}

              </div>

              {/* POS PAYMENTS */}

              {selectedOrder
                .pos_payments &&
                selectedOrder
                  .pos_payments
                  .length >
                  0 && (
                  <>
                    <h3>
                      POS Payments
                    </h3>

                    {selectedOrder.pos_payments.map(
                      (
                        payment
                      ) => (
                        <div
                          key={
                            payment.id
                          }
                          style={{
                            display:
                              "grid",

                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(120px, 1fr))",

                            gap:
                              "10px",

                            background:
                              "#f8f8f8",

                            padding:
                              "12px",

                            borderRadius:
                              "10px",

                            marginBottom:
                              "10px",
                          }}
                        >
                          <div>
                            <small>
                              Method
                            </small>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              {
                                payment.payment_method ||
                                "-"
                              }
                            </strong>
                          </div>

                          <div>
                            <small>
                              Amount
                            </small>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              ₹
                              {Number(
                                payment.amount
                              ).toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              Tip
                            </small>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              ₹
                              {Number(
                                payment.tip_amount
                              ).toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <div>
                            <small>
                              Card
                            </small>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              {
                                payment.card_type ||
                                "-"
                              }
                            </strong>
                          </div>

                        </div>
                      )
                    )}
                  </>
                )}

              {/* POS INFO */}

              {selectedOrder.pos_connection && (
                <>
                  <h3
                    style={{
                      marginTop:
                        "24px",
                    }}
                  >
                    POS Information
                  </h3>

                  <div className="integration-preview-grid">

                    <div>
                      <span>
                        Provider
                      </span>

                      <strong>
                        {
                          selectedOrder
                            .pos_connection
                            .provider
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Connection
                      </span>

                      <strong>
                        {
                          selectedOrder
                            .pos_connection
                            .label
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        External Order ID
                      </span>

                      <strong>
                        {
                          selectedOrder.external_order_id ||
                          "-"
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Last POS Update
                      </span>

                      <strong>
                        {formatDateTime(
                          selectedOrder.pos_updated_at
                        )}
                      </strong>
                    </div>

                  </div>
                </>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}