"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface WeatherCurrent {
    temperature: number | null;
    feels_like: number | null;
    humidity: number | null;
    wind_speed: number | null;
    wind_direction: number | null;
    condition: string;
    icon: string;
}

interface ForecastItem {
    date: string;
    condition: string;
    icon: string;
    temperature_max: number | null;
    temperature_min: number | null;
    precipitation: number;
    precipitation_probability: number | null;
}

interface WeatherResponse {
    success: boolean;
    location: { name: string; country: string | null };
    current: WeatherCurrent;
    forecast: ForecastItem[];
    units: { temperature: string; wind_speed: string; precipitation: string };
}

const weatherIconClass = (icon: string) => {
    switch (icon) {
        case "sun":
            return "fas fa-sun";
        case "cloud-sun":
            return "fas fa-cloud-sun";
        case "cloud":
            return "fas fa-cloud";
        case "cloud-rain":
            return "fas fa-cloud-showers-heavy";
        case "snowflake":
            return "fas fa-snowflake";
        case "bolt":
            return "fas fa-bolt";
        case "smog":
            return "fas fa-smog";
        default:
            return "fas fa-cloud-sun";
    }
};

const formatForecastDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        full: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
};

export default function WeatherCard() {
    const [data, setData] = useState<WeatherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchWeather = (params?: { latitude: number; longitude: number }) => {
            api
                .get("/superadmin/weather", { params })
                .then((res) => setData(res.data))
                .catch((err) => setError(err.response?.data?.message || "Failed to load weather."))
                .finally(() => setLoading(false));
        };

        if (!navigator.geolocation) {
            // No geolocation support at all — fall back straight to the server's IP-based location.
            fetchWeather();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                // Permission denied or unavailable — fall back to the server's IP-based location
                // instead of giving up, so the widget still shows something useful.
                fetchWeather();
            }
        );
    }, []);

    if (loading) {
        return (
            <div className="mb-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <i className="fas fa-cloud-sun mb-2 text-2xl text-gray-300"></i>
                <p className="text-sm text-gray-500">{error || "Weather data unavailable."}</p>
            </div>
        );
    }

    const { current, forecast, location, units } = data;

    return (
        <div className="mb-6 space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="text-4xl font-bold text-gray-900">
                            {current.temperature ?? "-"}
                            {units.temperature}
                            <span className="ml-2 align-middle text-sm font-normal text-gray-400">
                                Feels like: {current.feels_like ?? "-"}{units.temperature}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <i className={`${weatherIconClass(current.icon)} text-violet-500`}></i>
                            {current.condition}
                        </div>
                    </div>

                    <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                        {forecast.map((item) => {
                            const d = formatForecastDate(item.date);
                            return (
                                <div
                                    key={item.date}
                                    className="w-24 shrink-0 rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center"
                                >
                                    <p className="m-0 text-xs font-semibold text-gray-700">{d.day}</p>
                                    <p className="m-0 text-[11px] text-gray-400">{d.full}</p>
                                    <i className={`${weatherIconClass(item.icon)} my-2 block text-lg text-violet-500`}></i>
                                    <p className="m-0 text-xs font-semibold text-gray-800">
                                        {item.temperature_max ?? "-"}{units.temperature}
                                    </p>
                                    <p className="m-0 text-[11px] text-gray-400">
                                        {item.temperature_min ?? "-"}{units.temperature}
                                    </p>
                                    <p className="m-0 mt-1 text-[10px] text-blue-500">
                                        <i className="fas fa-tint"></i> {item.precipitation_probability ?? 0}%
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-400">Humidity</p>
                    <p className="m-0 mt-1 text-sm font-bold text-gray-900">{current.humidity ?? "-"}%</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-400">Wind</p>
                    <p className="m-0 mt-1 text-sm font-bold text-gray-900">{current.wind_speed ?? "-"} {units.wind_speed}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-400">Wind Dir</p>
                    <p className="m-0 mt-1 text-sm font-bold text-gray-900">{current.wind_direction ?? "-"}°</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-400">Location</p>
                    <p className="m-0 mt-1 truncate text-sm font-bold text-gray-900">{location.name}</p>
                </div>
            </div>
        </div>
    );
}
