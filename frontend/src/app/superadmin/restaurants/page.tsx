"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Pencil, Trash2, Store, Plus, AlertTriangle, RefreshCw, Ban, CheckCircle } from "lucide-react";
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
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [successMessage, setSuccessMessage] = useState("");

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

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
        if (searchParams.get("added") === "true") {
            setSuccessMessage("Restaurant added successfully.");
            setTimeout(() => setSuccessMessage(""), 4000);
            router.replace("/superadmin/restaurants");
        } else if (searchParams.get("updated") === "true") {
            setSuccessMessage("Restaurant updated successfully.");
            setTimeout(() => setSuccessMessage(""), 4000);
            router.replace("/superadmin/restaurants");
        }
    }, [searchParams, router]);

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
                setSuccessMessage("Restaurant deleted successfully.");
                setTimeout(() => setSuccessMessage(""), 4000);
            })

            .catch((err) => {
                alert(err.response?.data?.message || "Failed to delete restaurant");
            })
            .finally(() => {
                setDeletingId(null);
            });
    };

    const handleToggleStatus = (id: number) => {
        setTogglingId(id);
        api
            .patch(`/superadmin/restaurants/${id}/toggle-status`)
            .then((res) => {
                setRestaurants((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, is_active: res.data.is_active } : r))
                );
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to update restaurant status");
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const totalPages = Math.max(1, Math.ceil(restaurants.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedRestaurants = restaurants.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
    );

    return (
        <div className="superadmin-layout">
            <SuperAdminSidebar />
            <main className={`superadmin-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
                <div className="overflow-x-hidden pt-20 sm:pt-24 lg:pt-0">
                    {loading ? (
                        <div className="flex min-h-[calc(100vh-42px)] flex-col items-center justify-center gap-3">

                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                            <p className="text-sm text-gray-500">Loading restaurants...</p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[calc(100vh-42px)] items-center justify-center">
                            <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                    <AlertTriangle size={26} className="text-red-500" />
                                </div>
                                <h2 className="mb-1.5 text-base font-semibold text-gray-900">Couldn&apos;t load restaurants</h2>
                                <p className="mb-6 text-sm text-gray-500">{error}</p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                                >
                                    <RefreshCw size={17} />
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Restaurants</h1>
                                    <p className="mt-1 text-sm text-gray-500">{restaurants.length} total</p>
                                </div>
                                <Link
                                    href='/superadmin/restaurants/add'
                                    className="no-underline inline-flex w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                                >
                                    <Plus size={14} className="sm:hidden" />
                                    <Plus size={16} className="hidden sm:block" />
                                    Add Restaurant
                                </Link>
                            </div>

                            {successMessage && (
                                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                    {successMessage}
                                </div>
                            )}


                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
                                <div className="overflow-x-auto px-2 py-2 sm:px-4">
                                    <table className="min-w-full text-base">
                                        <thead>
                                            <tr className="divide-x divide-gray-200 border-b-2 border-gray-200 bg-gray-50">
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Restaurant</th>
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Category</th>
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Email</th>

                                                <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                                <th className="px-5 py-3.5 text-right text-sm font-semibold uppercase tracking-wider text-gray-500">Actions</th>
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

                                            {paginatedRestaurants.map((r) => (
                                                <tr key={r.id} className="divide-x divide-gray-100 transition-colors hover:bg-gray-50/80">
                                                    <td className="px-5 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                                                                <Store size={17} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="m-0 truncate font-normal text-gray-700">{r.name}</p>
                                                                <p className="m-0 truncate font-mono text-sm text-gray-400">{r.slug}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="max-w-[160px] truncate px-5 py-2.5 font-normal text-gray-700">{r.business_category || "—"}</td>
                                                    <td className="px-5 py-2.5 whitespace-nowrap font-normal text-gray-700">{r.phone}</td>
                                                    <td className="px-5 py-2.5 whitespace-nowrap font-normal text-gray-700">{r.email}</td>

                                                    <td className="px-5 py-2.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${r.is_active
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-700"
                                                                }`}
                                                        >
                                                            <span className={`h-2 w-2 rounded-full ${r.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                                            {r.is_active ? "Active" : "Blocked"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-2.5">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/superadmin/restaurants/${r.id}/edit`}
                                                                aria-label="Edit restaurant"
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow"
                                                            >
                                                                <Pencil size={17} />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleStatus(r.id)}
                                                                disabled={togglingId === r.id}
                                                                aria-label={r.is_active ? "Block restaurant" : "Unblock restaurant"}
                                                                title={r.is_active ? "Block restaurant" : "Unblock restaurant"}
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {r.is_active ? <Ban size={17} /> : <CheckCircle size={17} />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(r.id)}
                                                                disabled={deletingId === r.id}
                                                                aria-label="Delete restaurant"
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        disabled={safePage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        Page {safePage} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={safePage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
