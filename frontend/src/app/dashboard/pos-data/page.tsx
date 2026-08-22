"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type MenuItem = {
  id: number;
  name: string;
  price: number | string;
  food_type: string;
  is_available: boolean;
  pos_connection_id?: number | null;
};

type MenuCategory = {
  id: number;
  name: string;
  pos_connection_id?: number | null;
  items?: MenuItem[];
};

type OrderItem = {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
};

type Order = {
  id: number;
  external_order_id?: string | null;
  source?: string | null;
  customer_name?: string | null;
  total: number | string;
  status: string;
  payment_status: string;
  order_type?: string | null;
  table_number?: string | null;
  pos_connection_id?: number | null;
  items?: OrderItem[];
};

export default function PosDataPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authConfig = () => {
    const token = sessionStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const [ordersResponse, menuResponse] = await Promise.all([
        api.get("/owner/orders", authConfig()),
        api.get("/auth/menu", authConfig()),
      ]);

      const allOrders: Order[] =
        ordersResponse.data?.orders || [];

      const posOrders =
        allOrders.filter(
          (order) => order.pos_connection_id
        );

      setOrders(posOrders);

      const allCategories: MenuCategory[] =
        menuResponse.data?.categories || [];

      const posCategories =
        allCategories
          .map((category) => ({
            ...category,
            items:
              category.items?.filter(
                (item) => item.pos_connection_id
              ) || [],
          }))
          .filter(
            (category) =>
              category.pos_connection_id ||
              (category.items &&
                category.items.length > 0)
          );

      setCategories(posCategories);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load POS data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Loading POS Data...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div>
          <h1>POS Data</h1>
          <p>
            Menu and orders imported from connected POS systems.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            padding: "1px 1px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fff1f1",
            padding: 15,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* ================= ORDERS ================= */}

      <section style={{ marginBottom: 50 }}>
        <h2>POS Orders ({orders.length})</h2>

        {orders.length === 0 ? (
          <p>No POS orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 20,
                marginTop: 15,
              }}
            >
              <h3>
                {order.external_order_id ||
                  `Order #${order.id}`}
              </h3>

              <p>
                <strong>Source:</strong>{" "}
                {order.source || "-"}
              </p>

              <p>
                <strong>Customer:</strong>{" "}
                {order.customer_name || "POS Customer"}
              </p>

              <p>
                <strong>Type:</strong>{" "}
                {order.order_type || "-"}
              </p>

              <p>
                <strong>Table:</strong>{" "}
                {order.table_number || "-"}
              </p>

              <p>
                <strong>Total:</strong> ₹
                {Number(order.total).toFixed(2)}
              </p>

              <p>
                <strong>Payment:</strong>{" "}
                {order.payment_status}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order.status}
              </p>

              <h4>Items</h4>

              {order.items?.map((item) => (
                <div key={item.id}>
                  {item.item_name} × {item.quantity}
                  {" — "}₹
                  {Number(
                    item.total_price
                  ).toFixed(2)}
                </div>
              ))}
            </div>
          ))
        )}
      </section>

      {/* ================= MENU ================= */}

      <section>
        <h2>POS Menu</h2>

        {categories.length === 0 ? (
          <p>No POS menu found.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 20,
                marginTop: 15,
              }}
            >
              <h3>{category.name}</h3>

              {category.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 0",
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  <strong>{item.name}</strong>

                  <div>
                    ₹{Number(item.price).toFixed(2)}
                    {" • "}
                    {item.food_type}
                    {" • "}
                    {item.is_available
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}