"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type OrderItem = {
  id: number;
  menu_item_id: number;
  item_name: string;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  subtotal: number | string;
  delivery_charge: number | string;
  total: number | string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  payment_status: string;
  special_instructions?: string | null;
  created_at: string;
  items: OrderItem[];
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
  status: "confirmed" | "pending" | "cancelled";
  tableNumber?: number;
};

export default function OrderingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "orders" | "reservations"
  >("orders");

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");

    if (saved === "true") {
      setSidebarCollapsed(true);
    }

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
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

  // ============================================================
  // LOAD OWNER ORDERS
  // ============================================================

  const loadOrders = async () => {
    try {
      setOrderLoading(true);
      setOrderError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setOrderError(
          "Owner authentication token not found. Please login again."
        );
        return;
      }

      const response = await api.get("/owner/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error("Order loading error:", error);

      if (error.response?.status === 401) {
        setOrderError(
          "Your owner session has expired. Please login again."
        );
      } else {
        setOrderError(
          error.response?.data?.message ||
            "Unable to load orders."
        );
      }
    } finally {
      setOrderLoading(false);
    }
  };

  // ============================================================
  // LOAD OWNER RESERVATIONS
  // ============================================================

  const loadReservations = async () => {
    try {
      setReservationLoading(true);
      setReservationError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setReservationError(
          "Owner authentication token not found. Please login again."
        );
        return;
      }

      const response = await api.get("/owner/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.reservations || [];

      const formattedReservations: Reservation[] = data.map(
        (res: any) => ({
          id: res.id,
          customerName: res.customer_name,
          phone: res.phone,
          email: res.email,
          guests: res.guests,
          date: res.reservation_date,
          time: res.reservation_time,
          specialRequests: res.special_requests,
          status: res.status,
          tableNumber: res.table_number || undefined,
        })
      );

      setReservations(formattedReservations);
    } catch (error: any) {
      console.error(
        "Reservation loading error:",
        error
      );

      if (error.response?.status === 401) {
        setReservationError(
          "Your owner session has expired. Please login again."
        );
      } else {
        setReservationError(
          error.response?.data?.message ||
            "Unable to load reservations."
        );
      }
    } finally {
      setReservationLoading(false);
    }
  };

  // ============================================================
  // INITIAL ORDERS LOAD
  // ============================================================

  useEffect(() => {
  loadOrders();
  loadReservations();
}, []);


  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  const updateOrderStatus = async (
    orderId: number,
    status:
      | "pending"
      | "preparing"
      | "ready"
      | "completed"
      | "cancelled"
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Owner authentication token not found.");
        return;
      }

      setUpdatingId(orderId);

      const response = await api.patch(
        `/owner/orders/${orderId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data.order;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
        )
      );
    } catch (error: any) {
      console.error(
        "Order status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // UPDATE RESERVATION STATUS
  // ============================================================

  const updateReservationStatus = async (
    reservationId: number,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Owner authentication token not found.");
        return;
      }

      const message =
        status === "confirmed"
          ? "Are you sure you want to confirm this reservation?"
          : "Are you sure you want to cancel this reservation?";

      if (!window.confirm(message)) {
        return;
      }

      setUpdatingId(reservationId);

      const response = await api.patch(
        `/owner/reservations/${reservationId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedReservation =
        response.data.reservation;

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                status: updatedReservation.status,
              }
            : reservation
        )
      );

      alert(
        status === "confirmed"
          ? "Reservation confirmed successfully."
          : "Reservation cancelled successfully."
      );
    } catch (error: any) {
      console.error(
        "Reservation status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update reservation."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");

    if (!hours || !minutes) {
      return time;
    }

    const hour = Number(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${String(formattedHour).padStart(
      2,
      "0"
    )}:${minutes} ${period}`;
  };

  const getOrderItemsCount = (order: Order) => {
    return (
      order.items?.reduce(
        (count, item) =>
          count + Number(item.quantity),
        0
      ) || 0
    );
  };

  const getOrderStatusLabel = (status: string) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

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
                    Manage online orders, table
                    reservations and customer bookings
                  </p>

                </div>

                <div className="header-stats">

                  <div className="header-stat">

                    <span className="header-stat-number">
                      {orders.length}
                    </span>

                    <span className="header-stat-label">
                      Orders
                    </span>

                  </div>

                  <div className="header-stat">

                    <span className="header-stat-number">
                      {reservations.length}
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
                className={`tab-btn ${
                  activeTab === "orders"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("orders")
                }
              >

                <i className="fas fa-shopping-cart"></i>

                Orders

              </button>

              <button
                className={`tab-btn ${
                  activeTab === "reservations"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("reservations")
                }
              >

                <i className="fas fa-calendar-check"></i>

                Reservations

              </button>

            </div>

            {/* ==================================================
                ORDERS
            ================================================== */}

            {activeTab === "orders" && (

              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>

                    <h2>
                      Recent Orders
                    </h2>

                    <p>
                      Track and manage customer orders
                    </p>

                  </div>

                  <button
                    type="button"
                    className="tab-btn"
                    onClick={loadOrders}
                    disabled={orderLoading}
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

                {/* ERROR */}

                {orderError && (

                  <div
                    style={{
                      padding: "15px 20px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      background: "#fff1f1",
                      color: "#d32f2f",
                    }}
                  >

                    <i className="fas fa-exclamation-circle"></i>{" "}

                    {orderError}

                  </div>

                )}

                {/* LOADING */}

                {orderLoading ? (

                  <div className="empty-state">

                    <div className="empty-state-icon">

                      <i className="fas fa-spinner fa-spin"></i>

                    </div>

                    <h3>
                      Loading Orders...
                    </h3>

                    <p>
                      Please wait while we fetch customer orders.
                    </p>

                  </div>

                ) : orders.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-state-icon">

                      <i className="fas fa-shopping-cart"></i>

                    </div>

                    <h3>
                      No Orders Yet
                    </h3>

                    <p>
                      Orders will appear here when
                      customers place them.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="menu-table">

                      <thead>

                        <tr>

                          <th>
                            Order #
                          </th>

                          <th>
                            Customer
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

                        {orders.map((order) => (

                          <tr key={order.id}>

                            {/* ORDER */}

                            <td>

                              <span className="item-name">

                                #
                                {order.order_number ||
                                  order.id}

                              </span>

                            </td>

                            {/* CUSTOMER */}

                            <td>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >

                                <strong>
                                  {order.customer_name}
                                </strong>

                                {order.customer_phone && (

                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#777",
                                    }}
                                  >

                                    <i className="fas fa-phone"></i>{" "}

                                    {order.customer_phone}

                                  </span>

                                )}

                              </div>

                            </td>

                            {/* ==================================================
                                ITEMS - ACTUAL ITEM NAMES
                            ================================================== */}

                            <td>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "7px",
                                  minWidth: "220px",
                                }}
                              >

                                {order.items &&
                                order.items.length > 0 ? (

                                  order.items.map(
                                    (item) => (

                                      <div
                                        key={item.id}
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "2px",
                                          paddingBottom: "6px",
                                          borderBottom:
                                            "1px solid #f0f0f0",
                                        }}
                                      >

                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent:
                                              "space-between",
                                            alignItems:
                                              "center",
                                            gap: "12px",
                                          }}
                                        >

                                          <strong
                                            style={{
                                              fontSize: "14px",
                                              color: "#222",
                                            }}
                                          >
                                            {item.item_name}
                                          </strong>

                                          <span
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: 600,
                                              color: "#555",
                                              whiteSpace:
                                                "nowrap",
                                            }}
                                          >
                                            × {item.quantity}
                                          </span>

                                        </div>

                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent:
                                              "space-between",
                                            alignItems:
                                              "center",
                                            fontSize: "12px",
                                            color: "#777",
                                          }}
                                        >

                                          <span>
                                            ₹
                                            {Number(
                                              item.unit_price
                                            ).toFixed(2)}{" "}
                                            each
                                          </span>

                                          <span
                                            style={{
                                              fontWeight: 600,
                                              color: "#333",
                                            }}
                                          >
                                            ₹
                                            {Number(
                                              item.total_price
                                            ).toFixed(2)}
                                          </span>

                                        </div>

                                      </div>

                                    )
                                  )

                                ) : (

                                  <span
                                    style={{
                                      color: "#999",
                                      fontSize: "13px",
                                    }}
                                  >
                                    No item details
                                  </span>

                                )}

                                {/* TOTAL ITEM COUNT */}

                                {getOrderItemsCount(order) >
                                  0 && (

                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#888",
                                      marginTop: "2px",
                                    }}
                                  >

                                    Total:{" "}
                                    {getOrderItemsCount(
                                      order
                                    )}{" "}
                                    item
                                    {getOrderItemsCount(
                                      order
                                    ) !== 1
                                      ? "s"
                                      : ""}

                                  </span>

                                )}

                              </div>

                            </td>

                            {/* TOTAL */}

                            <td>

                              <span className="price-tag">

                                ₹
                                {Number(
                                  order.total
                                ).toFixed(2)}

                              </span>

                            </td>

                            {/* PAYMENT */}

                            <td>

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

                                {order.payment_status ||
                                  "pending"}

                              </span>

                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={`status-toggle status-${order.status}`}
                              >

                                <span
                                  className={`status-dot-sm dot-${order.status}`}
                                ></span>

                                {getOrderStatusLabel(
                                  order.status
                                )}

                              </span>

                            </td>

                            {/* TIME */}

                            <td>

                              {formatDateTime(
                                order.created_at
                              )}

                            </td>

                            {/* ACTION */}

                            <td>

                              <select
                                value={order.status}
                                disabled={
                                  updatingId ===
                                  order.id
                                }
                                onChange={(e) => {

                                  updateOrderStatus(
                                    order.id,
                                    e.target.value as
                                      | "pending"
                                      | "preparing"
                                      | "ready"
                                      | "completed"
                                      | "cancelled"
                                  );

                                }}
                                style={{
                                  border:
                                    "1px solid #ddd",
                                  borderRadius: "7px",
                                  padding:
                                    "7px 10px",
                                  background: "#fff",
                                  cursor:
                                    "pointer",
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

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            )}

            {/* ==================================================
                RESERVATIONS
            ================================================== */}

            {activeTab === "reservations" && (

              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>

                    <h2>
                      Table Reservations
                    </h2>

                    <p>
                      Manage customer bookings and
                      reservation requests
                    </p>

                  </div>

                  <button
                    type="button"
                    className="tab-btn"
                    onClick={loadReservations}
                    disabled={reservationLoading}
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

                {/* ERROR */}

                {reservationError && (

                  <div
                    style={{
                      padding: "15px 20px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      background: "#fff1f1",
                      color: "#d32f2f",
                    }}
                  >

                    <i className="fas fa-exclamation-circle"></i>{" "}

                    {reservationError}

                  </div>

                )}

                {/* LOADING */}

                {reservationLoading ? (

                  <div className="empty-state">

                    <div className="empty-state-icon">

                      <i className="fas fa-spinner fa-spin"></i>

                    </div>

                    <h3>
                      Loading Reservations...
                    </h3>

                    <p>
                      Please wait while we fetch
                      customer reservations.
                    </p>

                  </div>

                ) : reservations.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-state-icon">

                      <i className="fas fa-calendar-check"></i>

                    </div>

                    <h3>
                      No Reservations Yet
                    </h3>

                    <p>
                      Reservations will appear here when
                      customers book tables.
                    </p>

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
                          (res) => (

                            <tr key={res.id}>

                              <td>

                                <span className="item-name">
                                  {res.customerName}
                                </span>

                              </td>

                              <td>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    flexDirection:
                                      "column",
                                    gap: "4px",
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

                                    {res.phone}

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

                                    {res.email}

                                  </a>

                                </div>

                              </td>

                              <td>
                                {res.guests} guests
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
                                      .length > 30
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

                                  {res.status}

                                </span>

                              </td>

                              <td>

                                {res.status ===
                                "pending" ? (

                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      gap: "8px",
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

      </main>

    </div>
  );
}
