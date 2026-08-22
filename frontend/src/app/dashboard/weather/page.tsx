"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type WeatherCurrent = {
  temperature: number | null;
  feels_like: number | null;
  humidity: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  weather_code: number;
  condition: string;
  icon: string;
  time: string | null;
};

type ForecastItem = {
  date: string;
  weather_code: number;
  condition: string;
  icon: string;
  temperature_max: number | null;
  temperature_min: number | null;
  precipitation: number;
  precipitation_probability: number | null;
};

type WeatherResponse = {
  success: boolean;

  restaurant: {
    id: number;
    name: string;
    city: string;
    country: string;
    timezone: string;
  };

  location: {
    name: string;
    admin1?: string | null;
    country?: string | null;
    country_code?: string | null;
    latitude: number;
    longitude: number;
    timezone?: string | null;
  };

  current: WeatherCurrent;

  forecast: ForecastItem[];

  units: {
    temperature: string;
    wind_speed: string;
    precipitation: string;
  };
};

export default function WeatherPage() {
  const [data, setData] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response =
        await api.get(
          "/owner/weather",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Unable to load weather."
        );

        return;
      }

      setData(response.data);
    } catch (err: any) {
      console.error(
        "Weather load error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load weather."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const weatherEmoji = (
    icon: string
  ) => {
    switch (icon) {
      case "sun":
        return "☀️";

      case "cloud-sun":
        return "🌤️";

      case "cloud":
        return "☁️";

      case "cloud-rain":
        return "🌧️";

      case "snowflake":
        return "❄️";

      case "bolt":
        return "⛈️";

      case "smog":
        return "🌫️";

      default:
        return "🌥️";
    }
  };

  const formatDate = (
    value: string
  ) => {
    const date =
      new Date(
        `${value}T00:00:00`
      );

    return {
      day:
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),

      full:
        date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
    };
  };

  const formatTime = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-section">
            <div className="empty-state">
              <i className="fas fa-spinner fa-spin" />

              <h3>
                Loading Weather
              </h3>

              <p>
                Fetching current weather
                and forecast.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-section">
            <div className="empty-state">
              <i className="fas fa-cloud-sun" />

              <h3>
                Weather Unavailable
              </h3>

              <p>
                {error ||
                  "Weather data not found."}
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={loadWeather}
              >
                <i className="fas fa-sync-alt" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current =
    data.current;

  const forecast =
    data.forecast || [];

  const locationLabel =
    [
      data.location.name,
      data.location.country,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div className="dashboard-page weather-page">
      <div className="dashboard-container">

        {/* HEADER */}

        <div className="weather-header">
          <div>
            <h1>
              Weather Dashboard
            </h1>

            <p>
              Current weather and
              7-day forecast for your
              restaurant location.
            </p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadWeather}
          >
            <i className="fas fa-sync-alt" />
            Refresh
          </button>
        </div>

        {/* CURRENT WEATHER */}

        <div className="weather-section-title">
          Current Weather —{" "}
          {locationLabel}
        </div>

        <div className="weather-current-card">

          <div className="weather-current-top">

            <div>
              <div className="weather-temperature">
                {current.temperature ?? "-"}
                {data.units.temperature}
              </div>

              <div className="weather-condition">
                <span>
                  {weatherEmoji(
                    current.icon
                  )}
                </span>

                {current.condition}
              </div>

              <div className="weather-feels">
                Feels like:{" "}
                {current.feels_like ?? "-"}
                {data.units.temperature}
              </div>
            </div>

            <div className="weather-current-icon-block">
              <div className="weather-big-icon">
                {weatherEmoji(
                  current.icon
                )}
              </div>

              <span>
                Updated:{" "}
                {formatTime(
                  current.time
                )}
              </span>
            </div>

          </div>

          <div className="weather-metrics-grid">

            <div className="weather-metric-card">
              <span>
                Humidity
              </span>

              <strong>
                {current.humidity ?? "-"}%
              </strong>
            </div>

            <div className="weather-metric-card">
              <span>
                Wind
              </span>

              <strong>
                {current.wind_speed ?? "-"}{" "}
                {data.units.wind_speed}
              </strong>
            </div>

            <div className="weather-metric-card">
              <span>
                Wind Dir
              </span>

              <strong>
                {current.wind_direction ?? "-"}°
              </strong>
            </div>

            <div className="weather-metric-card">
              <span>
                Location
              </span>

              <strong>
                {locationLabel}
              </strong>
            </div>

          </div>

        </div>

        {/* 7 DAY FORECAST */}

        <div className="weather-forecast-card">

          <div className="weather-card-header">
            <h2>
              7-Day Forecast
            </h2>
          </div>

          <div className="weather-forecast-grid">

            {forecast.map(
              (item) => {
                const date =
                  formatDate(
                    item.date
                  );

                return (
                  <div
                    className="weather-forecast-item"
                    key={item.date}
                  >
                    <div className="weather-forecast-day">
                      {date.day}
                    </div>

                    <div className="weather-forecast-date">
                      {date.full}
                    </div>

                    <div className="weather-forecast-icon">
                      {weatherEmoji(
                        item.icon
                      )}
                    </div>

                    <div className="weather-forecast-condition">
                      {item.condition}
                    </div>

                    <div className="weather-forecast-high">
                      {item.temperature_max ?? "-"}
                      {data.units.temperature}
                    </div>

                    <div className="weather-forecast-low">
                      {item.temperature_min ?? "-"}
                      {data.units.temperature}
                    </div>

                    <div className="weather-forecast-rain">
                      💧{" "}
                      {item.precipitation}
                      {data.units.precipitation}
                    </div>

                    {item
                      .precipitation_probability !==
                      null && (
                      <div className="weather-forecast-probability">
                        {
                          item
                            .precipitation_probability
                        }
                        % chance
                      </div>
                    )}
                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>
    </div>
  );
}