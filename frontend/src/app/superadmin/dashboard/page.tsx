// app/superadmin/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import WeatherCard from "@/components/WeatherCard";
import api from "@/lib/axios";
import { getCurrencySymbol, getCurrencyIcon } from "@/lib/subscriptionFormat";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type RangeKey = "today" | "7d" | "30d" | "90d";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 Days", days: 7 },
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
];

interface DashboardStats {
  total_restaurants: number;
  active_restaurants: number;
  inactive_restaurants: number;
  total_revenue: number;
}

interface RevenueTrendPoint {
  date: string;
  current: number;
  previous: number;
}

const topRestaurants = [
  { rank: 1, name: "Spice Villa", owner: "Ramesh Kumar", plan: "Premium", orders: 1240, subscriptionDays: 365 },
  { rank: 2, name: "La Bella Italia", owner: "Priya Singh", plan: "Premium", orders: 980, subscriptionDays: 365 },
  { rank: 3, name: "Biryani House", owner: "Arjun Mehta", plan: "Standard", orders: 875, subscriptionDays: 180 },
  { rank: 4, name: "Dragon Bowl", owner: "Sana Khan", plan: "Standard", orders: 620, subscriptionDays: 180 },
  { rank: 5, name: "Cafe Mocha", owner: "Vikram Rao", plan: "Basic", orders: 410, subscriptionDays: 30 },
];

const planStyles: Record<string, { bg: string; color: string }> = {
  Premium: { bg: "#f5f3ff", color: "#7c3aed" },
  Standard: { bg: "#eff6ff", color: "#2563eb" },
  Basic: { bg: "#f1f5f9", color: "#64748b" },
};

export default function SuperAdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [range, setRange] = useState<RangeKey>("30d");
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_restaurants: 0,
    active_restaurants: 0,
    inactive_restaurants: 0,
    total_revenue: 0,
  });
  const [currency, setCurrency] = useState("INR");
  const [revenueData, setRevenueData] = useState<RevenueTrendPoint[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("superAdminSidebarCollapsed");
    if (saved === "true") setSidebarCollapsed(true);

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
    return () => window.removeEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
  }, []);

  useEffect(() => {
    api
      .get(`/superadmin/restaurants/stats/dashboard?currency=${currency}`)
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error("Failed to load dashboard stats:", err));
  }, [currency]);

  useEffect(() => {
    api
      .get("/superadmin/settings")
      .then((res) => setCurrency(res.data.data.currency))
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  const kpis = [
    {
      label: "Total Revenue",
      value: `${getCurrencySymbol(currency)}${Number(stats.total_revenue).toLocaleString("en-IN")}`,
      icon: getCurrencyIcon(currency),
      accent: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Total Restaurants",
      value: stats.total_restaurants.toLocaleString("en-IN"),
      icon: "fa-store",
      accent: "#2563eb",
      bg: "#eff6ff",
    },
    {
      label: "Active Restaurants",
      value: stats.active_restaurants.toLocaleString("en-IN"),
      icon: "fa-circle-check",
      accent: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Inactive Restaurants",
      value: stats.inactive_restaurants.toLocaleString("en-IN"),
      icon: "fa-circle-xmark",
      accent: "#dc2626",
      bg: "#fef2f2",
    },
  ];

  const activeRange = RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[2];

  useEffect(() => {
    api
      .get(`/superadmin/restaurants/stats/revenue-trend?days=${Math.max(activeRange.days, 2)}&currency=${currency}`)
      .then((res) => setRevenueData(res.data.data))
      .catch((err) => console.error("Failed to load revenue trend:", err));
  }, [activeRange.days, currency]);

  const rangeLabel = useMemo(() => {
    const today = new Date();
    if (activeRange.days === 1) {
      return today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
    const start = new Date(today);
    start.setDate(today.getDate() - (activeRange.days - 1));
    return `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  }, [activeRange.days]);

  return (
    <div className="superadmin-layout">
      <SuperAdminSidebar />
      <main className={`superadmin-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            <div className="superadmin-hero">
              <div className="superadmin-hero-glow superadmin-hero-glow-1"></div>
              <div className="superadmin-hero-glow superadmin-hero-glow-2"></div>
              <div className="superadmin-hero-content">
                <div className="superadmin-hero-left">
                  <span className="superadmin-hero-badge">
                    <i className="fas fa-shield-halved"></i>
                    Super Admin
                  </span>
                  <h1>Super Admin Dashboard</h1>
                  <p>Manage all restaurants and system settings from one place</p>
                </div>
              </div>
            </div>

            {/* Date range filter + period comparison */}
            <div className="sadash-filter-bar">
              <div className="sadash-range-group">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`sadash-range-btn ${range === opt.key ? "sadash-range-btn-active" : ""}`}
                    onClick={() => setRange(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="sadash-range-label">
                <i className="fas fa-calendar-days"></i>
                {rangeLabel}
              </span>
              <label className="sadash-compare-toggle">
                <input
                  type="checkbox"
                  checked={compareEnabled}
                  onChange={(e) => setCompareEnabled(e.target.checked)}
                />
                <span className="sadash-toggle-track">
                  <span className="sadash-toggle-thumb"></span>
                </span>
                Compare to previous period
              </label>
            </div>

            <WeatherCard />

            {/* KPI overview */}
            <div className="sadash-kpi-grid">
              {kpis.map((kpi) => (
                <div className="sadash-kpi-card" key={kpi.label}>
                  <div className="sadash-kpi-icon" style={{ background: kpi.bg, color: kpi.accent }}>
                    <i className={`fas ${kpi.icon}`}></i>
                  </div>
                  <div className="sadash-kpi-body">
                    <p className="sadash-kpi-label">{kpi.label}</p>
                    <h3 className="sadash-kpi-value">{kpi.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue trend */}
            <div className="sadash-panel">
              <div className="sadash-panel-header">
                <div>
                  <h2>Revenue Trend</h2>
                  <p>Revenue generated across all restaurants{compareEnabled ? " — current vs. previous period" : ""}</p>
                </div>
              </div>
              <div className="sadash-chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sadashCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sadashPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                      tickFormatter={(v: string) => new Date(`${v}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      interval={Math.max(0, Math.ceil(revenueData.length / 7) - 1)}
                      minTickGap={16}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${getCurrencySymbol(currency)}${Math.round(v / 1000)}k`}
                      width={48}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        name === "current" ? "Current period" : "Previous period",
                      ]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                    />
                    {compareEnabled && (
                      <Area
                        type="monotone"
                        dataKey="previous"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="url(#sadashPrevious)"
                        name="previous"
                      />
                    )}
                    <Area type="monotone" dataKey="current" stroke="#7c3aed" strokeWidth={2.5} fill="url(#sadashCurrent)" name="current" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top performing restaurants */}
            <div className="sadash-panel">
              <div className="sadash-panel-header">
                <div>
                  <h2>Top Performing Restaurants</h2>
                  <p>Ranked by revenue across the platform</p>
                </div>
              </div>
              <div className="sadash-restaurant-head" aria-hidden="true">
                <span></span>
                <span>Restaurant</span>
                <span className="sadash-head-center">Plan</span>
                <span className="sadash-head-center">Orders</span>
                <span className="sadash-head-center">Duration</span>
              </div>
              <div className="sadash-restaurant-list">
                {topRestaurants.map((r) => {
                  const plan = planStyles[r.plan];
                  return (
                    <div className="sadash-restaurant-row" key={r.rank}>
                      <span className="sadash-restaurant-rank">{r.rank}</span>
                      <div className="sadash-restaurant-info">
                        <p className="sadash-restaurant-name">{r.name}</p>
                        <p className="sadash-restaurant-owner">{r.owner}</p>
                      </div>
                      <span className="sadash-restaurant-plan" style={{ background: plan.bg, color: plan.color }}>
                        {r.plan}
                      </span>
                      <div className="sadash-restaurant-stats">
                        <span className="sadash-restaurant-orders">{r.orders} orders</span>
                        <span className="sadash-restaurant-duration">{r.subscriptionDays} days</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
