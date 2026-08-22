"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "@/components/staff/StaffSidebar";
import api from "@/lib/axios";

type OrderItem = {
  id: number;
  order_id: number;
  menu_item_id: number;
  item_name: string;
  unit_price: string | number;
  quantity: number;
  total_price: string | number;
};

type Order = {
  id: number;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address?: string | null;
  subtotal: string | number;
  delivery_charge: string | number;
  total: string | number;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  special_instructions?: string | null;
  created_at: string;
  items: OrderItem[];
};

type Filter =
  | "all"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export default function StaffOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("staff_token")
    );
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await api.get("/staff/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data?.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(
          response.data?.message || "Unable to load orders."
        );
      }
    } catch (err: any) {
      console.error("Staff orders error:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You are not authorized to view orders.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load orders."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("staff_token");
    localStorage.removeItem("user");

    router.replace("/owner/login");
  };

  const updateStatus = async (
    orderId: number,
    status: string
  ) => {
    try {
      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      await api.patch(
        `/owner/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      await loadOrders();
    } catch (err: any) {
      console.error("Status update error:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to update order status."
      );
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status.toLowerCase() === filter
        );

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing"
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "ready"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string | number) => {
    return Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="staff-orders-layout">
      <StaffSidebar />

      <main className="staff-orders-main">
        <div className="staff-orders-container">

          {/* Header */}
          <div className="orders-header">
            <div>
              <div className="orders-title-row">
                <div className="orders-title-icon">
                  <i className="fas fa-shopping-cart" />
                </div>

                <div>
                  <h1>Orders</h1>
                  <p>
                    Manage and monitor restaurant orders
                  </p>
                </div>
              </div>
            </div>

            <button
              className="orders-refresh-btn"
              onClick={loadOrders}
              disabled={loading}
            >
              <i
                className={`fas ${
                  loading
                    ? "fa-spinner fa-spin"
                    : "fa-sync-alt"
                }`}
              />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Stats */}
          <div className="orders-stats">

            <div className="order-stat-card">
              <div className="order-stat-icon blue">
                <i className="fas fa-shopping-bag" />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>
            </div>

            <div className="order-stat-card">
              <div className="order-stat-icon orange">
                <i className="fas fa-clock" />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="order-stat-card">
              <div className="order-stat-icon purple">
                <i className="fas fa-fire" />
              </div>

              <div>
                <span>Preparing</span>
                <strong>{preparingCount}</strong>
              </div>
            </div>

            <div className="order-stat-card">
              <div className="order-stat-icon green">
                <i className="fas fa-check-circle" />
              </div>

              <div>
                <span>Ready</span>
                <strong>{readyCount}</strong>
              </div>
            </div>

            <div className="order-stat-card">
              <div className="order-stat-icon dark-green">
                <i className="fas fa-flag-checkered" />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>
            </div>

          </div>

          {/* Filters */}
          <div className="orders-toolbar">
            <div>
              <h2>Restaurant Orders</h2>
              <p>Live orders from your restaurant</p>
            </div>

            <div className="order-filters">
              {(
                [
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["confirmed", "Confirmed"],
                  ["preparing", "Preparing"],
                  ["ready", "Ready"],
                  ["completed", "Completed"],
                  ["cancelled", "Cancelled"],
                ] as [Filter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`order-filter ${
                    filter === value
                      ? "active"
                      : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="orders-loading">
              <i className="fas fa-spinner fa-spin" />
              <p>Loading orders...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="orders-error">
              <div className="orders-error-icon">
                <i className="fas fa-exclamation-triangle" />
              </div>

              <h3>Unable to Load Orders</h3>

              <p>{error}</p>

              <div className="error-actions">
                <button
                  onClick={loadOrders}
                  className="try-again-btn"
                >
                  <i className="fas fa-redo" />
                  Try Again
                </button>

                <button
                  onClick={logout}
                  className="login-again-btn"
                >
                  Login Again
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            filteredOrders.length === 0 && (
              <div className="orders-empty">
                <div className="orders-empty-icon">
                  <i className="fas fa-receipt" />
                </div>

                <h3>No Orders Found</h3>

                <p>
                  There are no orders in this category yet.
                </p>
              </div>
            )}

          {/* Orders */}
          {!loading &&
            !error &&
            filteredOrders.length > 0 && (
              <div className="orders-list">

                {filteredOrders.map((order) => {
                  const expanded =
                    expandedOrder === order.id;

                  return (
                    <div
                      className={`order-card ${
                        expanded
                          ? "order-card-expanded"
                          : ""
                      }`}
                      key={order.id}
                    >

                      {/* Order Top */}
                      <div className="order-card-top">

                        <div className="order-main-info">

                          <div className="order-number">
                            <i className="fas fa-receipt" />

                            <strong>
                              {order.order_number ||
                                `Order #${order.id}`}
                            </strong>
                          </div>

                          <div className="order-date">
                            <i className="far fa-clock" />
                            {formatDate(
                              order.created_at
                            )}
                          </div>

                        </div>

                        <span
                          className={`order-status status-${order.status}`}
                        >
                          {statusLabel(order.status)}
                        </span>

                      </div>

                      {/* Customer */}
                      <div className="order-customer">

                        <div className="customer-avatar">
                          <i className="fas fa-user" />
                        </div>

                        <div className="customer-details">
                          <strong>
                            {order.customer_name}
                          </strong>

                          <span>
                            <i className="fas fa-phone" />
                            {order.customer_phone}
                          </span>

                          {order.customer_email && (
                            <span>
                              <i className="fas fa-envelope" />
                              {order.customer_email}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Items */}
                      <div className="order-items">

                        {order.items?.map((item) => (
                          <div
                            className="order-item"
                            key={item.id}
                          >
                            <div className="order-item-name">
                              <span className="item-qty">
                                {item.quantity}x
                              </span>

                              <span>
                                {item.item_name}
                              </span>
                            </div>

                            <strong>
                              ₹
                              {formatPrice(
                                item.total_price
                              )}
                            </strong>
                          </div>
                        ))}

                      </div>

                      {/* Footer */}
                      <div className="order-card-footer">

                        <div className="order-total">
                          <span>Total</span>
                          <strong>
                            ₹{formatPrice(order.total)}
                          </strong>
                        </div>

                        <div className="order-payment">
                          <span
                            className={`payment-status payment-${order.payment_status}`}
                          >
                            {order.payment_status}
                          </span>
                        </div>

                        <button
                          className="view-order-btn"
                          onClick={() =>
                            setExpandedOrder(
                              expanded
                                ? null
                                : order.id
                            )
                          }
                        >
                          {expanded
                            ? "Hide Details"
                            : "View Details"}

                          <i
                            className={`fas fa-chevron-${
                              expanded
                                ? "up"
                                : "down"
                            }`}
                          />
                        </button>

                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="order-expanded">

                          {order.delivery_address && (
                            <div className="expanded-section">
                              <h4>
                                <i className="fas fa-map-marker-alt" />
                                Delivery Address
                              </h4>

                              <p>
                                {order.delivery_address}
                              </p>
                            </div>
                          )}

                          {order.special_instructions && (
                            <div className="expanded-section">
                              <h4>
                                <i className="fas fa-comment-alt" />
                                Special Instructions
                              </h4>

                              <p>
                                {
                                  order.special_instructions
                                }
                              </p>
                            </div>
                          )}

                          <div className="expanded-section">
                            <h4>
                              <i className="fas fa-tasks" />
                              Update Order Status
                            </h4>

                            <div className="status-actions">

                              {order.status !==
                                "preparing" &&
                                order.status !==
                                  "completed" &&
                                order.status !==
                                  "cancelled" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        order.id,
                                        "preparing"
                                      )
                                    }
                                    className="status-action preparing"
                                  >
                                    <i className="fas fa-fire" />
                                    Preparing
                                  </button>
                                )}

                              {order.status !==
                                "ready" &&
                                order.status !==
                                  "completed" &&
                                order.status !==
                                  "cancelled" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        order.id,
                                        "ready"
                                      )
                                    }
                                    className="status-action ready"
                                  >
                                    <i className="fas fa-check" />
                                    Ready
                                  </button>
                                )}

                              {order.status !==
                                "completed" &&
                                order.status !==
                                  "cancelled" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        order.id,
                                        "completed"
                                      )
                                    }
                                    className="status-action completed"
                                  >
                                    <i className="fas fa-check-double" />
                                    Complete
                                  </button>
                                )}

                              {order.status !==
                                "cancelled" &&
                                order.status !==
                                  "completed" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        order.id,
                                        "cancelled"
                                      )
                                    }
                                    className="status-action cancelled"
                                  >
                                    <i className="fas fa-times" />
                                    Cancel
                                  </button>
                                )}

                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

        </div>
      </main>
    </div>
  );
}
