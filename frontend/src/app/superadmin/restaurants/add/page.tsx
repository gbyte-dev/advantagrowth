"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 hover:bg-gray-50/70 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-500";

const TIMEZONES: string[] = (() => {
    try {
        return Intl.supportedValuesOf("timeZone");
    } catch {
        return ["UTC"];
    }
})();

const CURRENCIES: string[] = (() => {
    try {
        return Intl.supportedValuesOf("currency");
    } catch {
        return ["INR", "USD", "EUR", "GBP"];
    }
})();

export default function AddRestaurantPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const saved = localStorage.getItem("superAdminSidebarCollapsed");
        if (saved === "true") setSidebarCollapsed(true);

        const handleSidebarToggle = (e: CustomEvent) => {
            setSidebarCollapsed(e.detail.collapsed);
        };

        window.addEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
        return () => window.removeEventListener("superAdminSidebarToggle", handleSidebarToggle as EventListener);
    }, []);

    const [form, setForm] = useState({
        name: "",
        legal_name: "",
        business_category: "",
        vat_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        postal_code: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        currency: "",
        timezone: "",
        opening_time: "",
        closing_time: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[e.target.name];
                return next;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Restaurant name is required.";
        if (!form.phone.trim()) newErrors.phone = "Phone is required.";
        if (!form.email.trim()) newErrors.email = "Email is required.";
        return newErrors;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);

        api
            .post("/superadmin/restaurants", form)
            .then(() => {
                router.push("/superadmin/restaurants");
            })
            .catch((err) => {
                alert(err.response?.data?.message || "Failed to create restaurant");
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <div className="superadmin-layout">
            <SuperAdminSidebar />
            <main className={`superadmin-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
                <div className="mx-auto max-w-3xl p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <Link
                        href="/superadmin/restaurants"
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 no-underline hover:text-violet-600"
                    >
                        <ArrowLeft size={15} />
                        Back to Restaurants
                    </Link>

                    <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Restaurant</h1>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Basic Information</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Restaurant Name *</label>
                                    <input
                                        name="name"
                                        autoComplete="off"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={`${inputClass} ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Legal Name</label>
                                    <input name="legal_name" autoComplete="off" value={form.legal_name} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Business Category</label>
                                    <input name="business_category" autoComplete="off" value={form.business_category} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>VAT Number</label>
                                    <input name="vat_number" autoComplete="off" value={form.vat_number} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Contact</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Phone *</label>
                                    <input
                                        name="phone"
                                        autoComplete="off"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className={`${inputClass} ${errors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`${inputClass} ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Website</label>
                                    <input name="website" autoComplete="off" value={form.website} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Address</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Address Line 1</label>
                                    <input name="address_line_1" autoComplete="off" value={form.address_line_1} onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Address Line 2</label>
                                    <input name="address_line_2" autoComplete="off" value={form.address_line_2} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input name="city" autoComplete="off" value={form.city} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Postal Code</label>
                                    <input name="postal_code" autoComplete="off" value={form.postal_code} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input name="country" autoComplete="off" value={form.country} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Operations</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Currency</label>
                                    <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                                        <option value="">Select currency</option>
                                        {CURRENCIES.map((code) => (
                                            <option key={code} value={code}>
                                                {code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Timezone</label>
                                    <select name="timezone" value={form.timezone} onChange={handleChange} className={inputClass}>
                                        <option value="">Select timezone</option>
                                        {TIMEZONES.map((tz) => (
                                            <option key={tz} value={tz}>
                                                {tz}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Opening Time</label>
                                    <input type="time" name="opening_time" value={form.opening_time} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Closing Time</label>
                                    <input type="time" name="closing_time" value={form.closing_time} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href="/superadmin/restaurants"
                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 no-underline hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Restaurant"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
