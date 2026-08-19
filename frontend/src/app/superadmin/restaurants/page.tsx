"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, Trash2, Store, Plus } from "lucide-react";
import api from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    phone: string;
    email: string;
    business_category: string | null;
    address: string | null;
    is_active: boolean;
}

export default function RestaurantPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        api
            .get("/superadmin/restaurants")
            .then((response) => {
                setRestaurants(response.data.data);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to load restaurants. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("superAdminSidebarCollapsed");
        if (saved === "true") setSidebarCollapsed(true);

        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };

        window.addEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
        return () => window.removeEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
    }, []);

    const handleDelete = (id: number) => {
        if (!window.confirm("Delete this restaurant? This cannot be undone.")) return;

        setDeletingId(id);
        api
            .delete(`/superadmin/restaurants/${id}`)
            .then(() => {
                setRestaurants((prev) => prev.filter((r) => r.id !== id));
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to delete restaurant");
            })
            .finally(() => {
                setDeletingId(null);
            });
    };

    return (
        <div className="superadmin-layout">
            <SuperAdminSidebar />
            <main className={`superadmin-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
                <div className="p-6">
                    {loading ? (
                        <div className="flex min-h-[calc(100vh-42px)] flex-col items-center justify-center gap-3">

                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                            <p className="text-sm text-gray-500">Loading restaurants...</p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[calc(100vh-42px)] flex-col items-center justify-center gap-3 text-center">
                            <p className="text-sm font-medium text-red-600">{error}</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
                                    <p className="mt-1 text-sm text-gray-500">{restaurants.length} total</p>
                                </div>
                                <Link
                                    href='/superadmin/restaurants/add'
                                    className="no-underline inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                                >
                                    <Plus size={16} />
                                    Add Restaurant
                                </Link>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
                                <div className="overflow-x-auto px-4 py-2">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="divide-x divide-gray-200 border-b-2 border-gray-200 bg-gray-50">
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Restaurant</th>
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>

                                                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {restaurants.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-gray-500">
                                                        No restaurants found.
                                                    </td>
                                                </tr>
                                            )}

                                            {restaurants.map((r) => (
                                                <tr key={r.id} className="divide-x divide-gray-100 transition-colors hover:bg-gray-50/80">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                                                                <Store size={16} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-gray-900">{r.name}</p>
                                                                <p className="truncate font-mono text-xs text-gray-400">{r.slug}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500">{r.business_category || "—"}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{r.phone}</td>
                                                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">{r.email}</td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${r.is_active
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-700"
                                                                }`}
                                                        >
                                                            <span className={`h-1.5 w-1.5 rounded-full ${r.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                                            {r.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/superadmin/restaurants/${r.id}/edit`}
                                                                aria-label="Edit restaurant"
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow"
                                                            >
                                                                <Pencil size={15} />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(r.id)}
                                                                disabled={deletingId === r.id}
                                                                aria-label="Delete restaurant"
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
