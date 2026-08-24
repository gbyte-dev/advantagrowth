"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "@/lib/axios";

import {
  showError,
  showSuccess,
  showWarning,
  confirmDialog,
} from "@/lib/feedback";

// =========================================================
// TYPES
// =========================================================

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

type HolidayItem = {
  id: number | null;
  source: "public" | "custom";
  date: string;
  local_name: string | null;
  name: string | null;
  country_code: string | null;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launch_year: number | null;
  types: string[];
  notes?: string | null;
  is_closed?: boolean;
};

type HolidayResponse = {
  success: boolean;

  restaurant: {
    id: number;
    name: string;
    country: string;
    country_code: string;
  };

  year: number;
  provider: string;
  provider_message?: string | null;

  public_holidays?: HolidayItem[];
  custom_holidays?: HolidayItem[];

  holidays: HolidayItem[];

  count: number;
};

type HolidayForm = {
  id: number | null;
  name: string;
  holiday_date: string;
  type: string;
  notes: string;
  is_closed: boolean;
};

// =========================================================
// CONSTANTS
// =========================================================

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const emptyHolidayForm: HolidayForm = {
  id: null,
  name: "",
  holiday_date: "",
  type: "custom",
  notes: "",
  is_closed: true,
};

// =========================================================
// PAGE
// =========================================================

export default function WeatherPage() {
  const today = new Date();

  const [data, setData] =
    useState<WeatherResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    holidayYear,
    setHolidayYear,
  ] =
    useState(
      today.getFullYear()
    );

  const [
    holidayMonth,
    setHolidayMonth,
  ] =
    useState(
      today.getMonth()
    );

  const [
    holidayData,
    setHolidayData,
  ] =
    useState<HolidayResponse | null>(
      null
    );

  const [
    holidayLoading,
    setHolidayLoading,
  ] =
    useState(true);

  const [
    holidayError,
    setHolidayError,
  ] =
    useState("");

  const [
    holidayView,
    setHolidayView,
  ] =
    useState<
      "calendar" | "list"
    >("calendar");

  const [
    showHolidayModal,
    setShowHolidayModal,
  ] =
    useState(false);

  const [
    holidayForm,
    setHolidayForm,
  ] =
    useState<HolidayForm>(
      emptyHolidayForm
    );

  const [
    savingHoliday,
    setSavingHoliday,
  ] =
    useState(false);

  // =========================================================
  // AUTH
  // =========================================================

  const authConfig = () => {
    const token =
      sessionStorage.getItem(
        "token"
      );

    return {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    };
  };

  // =========================================================
  // LOAD WEATHER
  // =========================================================

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        sessionStorage.getItem(
          "token"
        );

      if (!token) {
        setError(
          "Please login first."
        );

        return;
      }

      const response =
        await api.get(
          "/owner/weather",
          authConfig()
        );

      if (
        !response.data?.success
      ) {
        setError(
          response.data?.message ||
            "Unable to load weather."
        );

        return;
      }

      setData(
        response.data
      );
    } catch (err: any) {
      console.error(
        "Weather load error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          "Unable to load weather."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD HOLIDAYS
  // =========================================================

  const loadHolidays = async (
    year: number
  ) => {
    try {
      setHolidayLoading(true);
      setHolidayError("");

      const token =
        sessionStorage.getItem(
          "token"
        );

      if (!token) {
        setHolidayError(
          "Please login first."
        );

        return;
      }

      const response =
        await api.get(
          `/owner/holidays?year=${year}`,
          authConfig()
        );

      if (
        !response.data?.success
      ) {
        setHolidayError(
          response.data?.message ||
            "Unable to load holidays."
        );

        return;
      }

      setHolidayData(
        response.data
      );
    } catch (err: any) {
      console.error(
        "Holiday load error:",
        err
      );

      setHolidayError(
        err?.response?.data
          ?.message ||
          "Unable to load holidays."
      );
    } finally {
      setHolidayLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadWeather();
  }, []);

  useEffect(() => {
    loadHolidays(
      holidayYear
    );
  }, [holidayYear]);

  // =========================================================
  // WEATHER HELPERS
  // =========================================================

  const weatherIconClass = (
    icon: string
  ) => {
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
            weekday:
              "short",
          }
        ),

      full:
        date.toLocaleDateString(
          "en-US",
          {
            month:
              "short",

            day:
              "numeric",
          }
        ),
    };
  };

  const formatHolidayDate = (
    value: string
  ) => {
    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-US",
      {
        weekday:
          "short",

        month:
          "short",

        day:
          "numeric",

        year:
          "numeric",
      }
    );
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
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );
  };

  // =========================================================
  // CALENDAR DATA
  // =========================================================

  const holidays =
    holidayData?.holidays ||
    [];

  const monthHolidays =
    useMemo(() => {
      return holidays.filter(
        (holiday) => {
          const date =
            new Date(
              `${holiday.date}T00:00:00`
            );

          return (
            date.getFullYear() ===
              holidayYear &&
            date.getMonth() ===
              holidayMonth
          );
        }
      );
    }, [
      holidays,
      holidayMonth,
      holidayYear,
    ]);

  const publicMonthHolidays =
    monthHolidays.filter(
      (holiday) =>
        holiday.source ===
        "public"
    );

  const customMonthHolidays =
    monthHolidays.filter(
      (holiday) =>
        holiday.source ===
        "custom"
    );

  const closedMonthHolidays =
    monthHolidays.filter(
      (holiday) =>
        holiday.is_closed ===
        true
    );

  const calendarDays =
    useMemo(() => {
      const firstDay =
        new Date(
          holidayYear,
          holidayMonth,
          1
        );

      const lastDay =
        new Date(
          holidayYear,
          holidayMonth + 1,
          0
        );

      const leadingEmpty =
        firstDay.getDay();

      const totalDays =
        lastDay.getDate();

      const cells:
        Array<
          number | null
        > = [];

      for (
        let i = 0;
        i <
        leadingEmpty;
        i++
      ) {
        cells.push(
          null
        );
      }

      for (
        let day = 1;
        day <= totalDays;
        day++
      ) {
        cells.push(
          day
        );
      }

      while (
        cells.length %
          7 !==
        0
      ) {
        cells.push(
          null
        );
      }

      return cells;
    }, [
      holidayMonth,
      holidayYear,
    ]);

  const dateKey = (
    year: number,
    month: number,
    day: number
  ) => {
    const mm =
      String(
        month + 1
      ).padStart(
        2,
        "0"
      );

    const dd =
      String(
        day
      ).padStart(
        2,
        "0"
      );

    return `${year}-${mm}-${dd}`;
  };

  const holidaysForDay = (
    day: number
  ) => {
    const target =
      dateKey(
        holidayYear,
        holidayMonth,
        day
      );

    return holidays.filter(
      (holiday) =>
        holiday.date ===
        target
    );
  };

  const isToday = (
    day: number
  ) => {
    return (
      today.getFullYear() ===
        holidayYear &&
      today.getMonth() ===
        holidayMonth &&
      today.getDate() ===
        day
    );
  };

  // =========================================================
  // MONTH NAVIGATION
  // =========================================================

  const previousMonth = () => {
    if (
      holidayMonth ===
      0
    ) {
      setHolidayMonth(
        11
      );

      setHolidayYear(
        (year) =>
          year - 1
      );

      return;
    }

    setHolidayMonth(
      (month) =>
        month - 1
    );
  };

  const nextMonth = () => {
    if (
      holidayMonth ===
      11
    ) {
      setHolidayMonth(
        0
      );

      setHolidayYear(
        (year) =>
          year + 1
      );

      return;
    }

    setHolidayMonth(
      (month) =>
        month + 1
    );
  };

  // =========================================================
  // ADD HOLIDAY
  // =========================================================

  const openAddHoliday = (
    selectedDate?: string
  ) => {
    setHolidayForm({
      ...emptyHolidayForm,

      holiday_date:
        selectedDate ||
        dateKey(
          holidayYear,
          holidayMonth,
          1
        ),
    });

    setShowHolidayModal(
      true
    );
  };

  // =========================================================
  // EDIT HOLIDAY
  // =========================================================

  const openEditHoliday = (
    holiday: HolidayItem
  ) => {
    if (
      holiday.source !==
        "custom" ||
      !holiday.id
    ) {
      return;
    }

    setHolidayForm({
      id:
        holiday.id,

      name:
        holiday.local_name ||
        holiday.name ||
        "",

      holiday_date:
        holiday.date,

      type:
        holiday.types?.[0] ||
        "custom",

      notes:
        holiday.notes ||
        "",

      is_closed:
        holiday.is_closed ??
        true,
    });

    setShowHolidayModal(
      true
    );
  };

  // =========================================================
  // SAVE HOLIDAY
  // =========================================================

  const saveHoliday = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !holidayForm.name.trim()
    ) {
      showWarning(
        "Holiday name is required."
      );

      return;
    }

    if (
      !holidayForm.holiday_date
    ) {
      showWarning(
        "Holiday date is required."
      );

      return;
    }

    const editing =
      Boolean(
        holidayForm.id
      );

    try {
      setSavingHoliday(
        true
      );

      const payload = {
        name:
          holidayForm.name.trim(),

        holiday_date:
          holidayForm.holiday_date,

        type:
          holidayForm.type,

        notes:
          holidayForm.notes.trim(),

        is_closed:
          holidayForm.is_closed,
      };

      if (
        holidayForm.id
      ) {
        await api.put(
          `/owner/holidays/${holidayForm.id}`,
          payload,
          authConfig()
        );
      } else {
        await api.post(
          "/owner/holidays",
          payload,
          authConfig()
        );
      }

      const newDate =
        new Date(
          `${holidayForm.holiday_date}T00:00:00`
        );

      setHolidayYear(
        newDate.getFullYear()
      );

      setHolidayMonth(
        newDate.getMonth()
      );

      setShowHolidayModal(
        false
      );

      setHolidayForm(
        emptyHolidayForm
      );

      await loadHolidays(
        newDate.getFullYear()
      );

      showSuccess(
        editing
          ? "Holiday updated successfully."
          : "Holiday added successfully."
      );
    } catch (err: any) {
      console.error(
        "Save holiday error:",
        err
      );

      showError(
        err?.response?.data
          ?.message ||
          "Unable to save holiday."
      );
    } finally {
      setSavingHoliday(
        false
      );
    }
  };

  // =========================================================
  // DELETE HOLIDAY
  // =========================================================

  const deleteHoliday = async (
    holiday: HolidayItem
  ) => {
    if (
      holiday.source !==
        "custom" ||
      !holiday.id
    ) {
      return;
    }

    const holidayName =
      holiday.local_name ||
      holiday.name ||
      "this holiday";

    const confirmed =
      await confirmDialog({
        title:
          "Delete Holiday?",

        message:
          `Are you sure you want to delete "${holidayName}"? This action cannot be undone.`,

        confirmText:
          "Delete Holiday",

        cancelText:
          "Cancel",

        danger:
          true,
      });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/owner/holidays/${holiday.id}`,
        authConfig()
      );

      await loadHolidays(
        holidayYear
      );

      showSuccess(
        "Holiday deleted successfully."
      );
    } catch (err: any) {
      console.error(
        "Delete holiday error:",
        err
      );

      showError(
        err?.response?.data
          ?.message ||
          "Unable to delete holiday."
      );
    }
  };

  // =========================================================
  // WEATHER LOADING
  // =========================================================

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

  // =========================================================
  // WEATHER ERROR
  // =========================================================

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
                onClick={
                  loadWeather
                }
              >
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
    data.forecast ||
    [];

  const locationLabel =
    [
      data.location.name,
      data.location.country,
    ]
      .filter(Boolean)
      .join(", ");

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div className="dashboard-page weather-page">
        <div className="dashboard-container">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="weather-header">

            <div>

              <h1>
                Weather & Holidays Dashboard
              </h1>

              <p>
                Current weather and public holidays for{" "}
                {
                  data
                    .restaurant
                    .country
                }
                .
              </p>

            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                loadWeather();

                loadHolidays(
                  holidayYear
                );
              }}
            >
              <i className="fas fa-sync-alt" />

              Refresh
            </button>

          </div>

          {/* =====================================================
              CURRENT WEATHER
          ===================================================== */}

          <div className="weather-section-title">
            Current Weather —{" "}
            {locationLabel}
          </div>

          <div className="weather-current-card">

            <div className="weather-current-top">

              <div>

                <div className="weather-temperature">
                  {current.temperature ??
                    "-"}
                  {data.units.temperature}
                </div>

                <div className="weather-condition">

                  <i
                    className={weatherIconClass(
                      current.icon
                    )}
                  />

                  {
                    current.condition
                  }

                </div>

                <div className="weather-feels">
                  Feels like:{" "}

                  {current.feels_like ??
                    "-"}

                  {data.units.temperature}
                </div>

              </div>

              <div className="weather-current-icon-block">

                <div className="weather-big-icon">
                  <i
                    className={weatherIconClass(
                      current.icon
                    )}
                  />
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
                  {current.humidity ??
                    "-"}
                  %
                </strong>

              </div>

              <div className="weather-metric-card">

                <span>
                  Wind
                </span>

                <strong>
                  {current.wind_speed ??
                    "-"}{" "}
                  {data.units.wind_speed}
                </strong>

              </div>

              <div className="weather-metric-card">

                <span>
                  Wind Dir
                </span>

                <strong>
                  {current.wind_direction ??
                    "-"}
                  °
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

          {/* =====================================================
              7-DAY FORECAST
          ===================================================== */}

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
                      key={
                        item.date
                      }
                    >

                      <div className="weather-forecast-day">
                        {
                          date.day
                        }
                      </div>

                      <div className="weather-forecast-date">
                        {
                          date.full
                        }
                      </div>

                      <div className="weather-forecast-icon">
                        <i
                          className={weatherIconClass(
                            item.icon
                          )}
                        />
                      </div>

                      <div className="weather-forecast-condition">
                        {
                          item.condition
                        }
                      </div>

                      <div className="weather-forecast-high">
                        {item.temperature_max ??
                          "-"}
                        {
                          data
                            .units
                            .temperature
                        }
                      </div>

                      <div className="weather-forecast-low">
                        {item.temperature_min ??
                          "-"}
                        {
                          data
                            .units
                            .temperature
                        }
                      </div>

                      <div className="weather-forecast-rain">
                        <i className="fas fa-tint" />{" "}
                        {
                          item.precipitation
                        }
                        {
                          data
                            .units
                            .precipitation
                        }
                      </div>

                      {item.precipitation_probability !==
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

          {/* =====================================================
              HOLIDAY DASHBOARD HEADER
          ===================================================== */}

          <div className="holiday-dashboard-heading">

            <div className="holiday-dashboard-title-wrap">

              <div className="holiday-country-icon">
                <i className="fas fa-calendar-check" />
              </div>

              <div>

                <h2>
                  {holidayData
                    ?.restaurant
                    ?.country ||
                    data.restaurant
                      .country}{" "}
                  Public Holidays —{" "}
                  {
                    months[
                      holidayMonth
                    ]
                  }{" "}
                  {holidayYear}
                </h2>

                <p>
                  National and restaurant holidays.
                  Select a month or add your own holiday.
                </p>

              </div>

            </div>

            <div className="holiday-toolbar">

              <button
                type="button"
                className="holiday-control-btn"
                onClick={
                  previousMonth
                }
                title="Previous month"
              >
                <i className="fas fa-chevron-left" />
              </button>

              <select
                value={
                  holidayMonth
                }
                onChange={(e) =>
                  setHolidayMonth(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                aria-label="Holiday month"
              >
                {months.map(
                  (
                    month,
                    index
                  ) => (
                    <option
                      key={
                        month
                      }
                      value={
                        index
                      }
                    >
                      {
                        month
                      }
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  holidayYear
                }
                onChange={(e) =>
                  setHolidayYear(
                    Number(
                      e.target
                        .value
                    )
                  )
                }
                aria-label="Holiday year"
              >
                {Array.from(
                  {
                    length:
                      11,
                  },
                  (
                    _,
                    index
                  ) =>
                    today.getFullYear() -
                    5 +
                    index
                ).map(
                  (year) => (
                    <option
                      key={
                        year
                      }
                      value={
                        year
                      }
                    >
                      {
                        year
                      }
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                className="holiday-control-btn"
                onClick={
                  nextMonth
                }
                title="Next month"
              >
                <i className="fas fa-chevron-right" />
              </button>

              <button
                type="button"
                className="holiday-control-btn holiday-list-toggle"
                onClick={() =>
                  setHolidayView(
                    (
                      currentView
                    ) =>
                      currentView ===
                      "calendar"
                        ? "list"
                        : "calendar"
                  )
                }
              >
                <i
                  className={
                    holidayView ===
                    "calendar"
                      ? "fas fa-list"
                      : "fas fa-calendar-alt"
                  }
                />

                {holidayView ===
                "calendar"
                  ? "Show List"
                  : "Show Calendar"}
              </button>

              <button
                type="button"
                className="holiday-add-btn"
                onClick={() =>
                  openAddHoliday()
                }
              >
                <i className="fas fa-plus" />

                Add Holiday
              </button>

            </div>

          </div>

          {/* =====================================================
              HOLIDAY SUMMARY
          ===================================================== */}

          <div className="holiday-summary-grid">

            <div className="holiday-summary-card holiday-summary-public">

              <div className="holiday-summary-icon">
                <i className="fas fa-calendar-day" />
              </div>

              <div>

                <strong>
                  {
                    publicMonthHolidays.length
                  }
                </strong>

                <span>
                  National Holidays
                </span>

              </div>

            </div>

            <div className="holiday-summary-card holiday-summary-custom">

              <div className="holiday-summary-icon">
                <i className="fas fa-star" />
              </div>

              <div>

                <strong>
                  {
                    customMonthHolidays.length
                  }
                </strong>

                <span>
                  Custom Holidays
                </span>

              </div>

            </div>

            <div className="holiday-summary-card holiday-summary-closed">

              <div className="holiday-summary-icon">
                <i className="fas fa-store-slash" />
              </div>

              <div>

                <strong>
                  {
                    closedMonthHolidays.length
                  }
                </strong>

                <span>
                  Closed Days
                </span>

              </div>

            </div>

          </div>

          {holidayData
            ?.provider_message && (
            <div className="holiday-provider-message">

              <i className="fas fa-circle-info" />

              <span>
                {
                  holidayData
                    .provider_message
                }
              </span>

            </div>
          )}

          {/* =====================================================
              HOLIDAY CALENDAR / LIST
          ===================================================== */}

          {holidayLoading ? (

            <div className="holiday-card">

              <div className="holiday-empty-state">

                <i className="fas fa-spinner fa-spin" />

                <h3>
                  Loading Holidays
                </h3>

                <p>
                  Fetching public and custom holidays.
                </p>

              </div>

            </div>

          ) : holidayError ? (

            <div className="holiday-card">

              <div className="holiday-empty-state holiday-error-state">

                <i className="fas fa-triangle-exclamation" />

                <h3>
                  Unable to Load Holidays
                </h3>

                <p>
                  {
                    holidayError
                  }
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() =>
                    loadHolidays(
                      holidayYear
                    )
                  }
                >
                  Try Again
                </button>

              </div>

            </div>

          ) : holidayView ===
            "calendar" ? (

            <div className="holiday-card">

              <div className="holiday-calendar-title">
                {
                  months[
                    holidayMonth
                  ]
                }{" "}
                {holidayYear}
              </div>

              <div className="holiday-calendar-weekdays">

                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map(
                  (day) => (
                    <div
                      key={
                        day
                      }
                    >
                      {
                        day
                      }
                    </div>
                  )
                )}

              </div>

              <div className="holiday-calendar-grid">

                {calendarDays.map(
                  (
                    day,
                    index
                  ) => {
                    if (
                      day ===
                      null
                    ) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="holiday-calendar-cell holiday-calendar-empty"
                        />
                      );
                    }

                    const dayHolidays =
                      holidaysForDay(
                        day
                      );

                    return (
                      <div
                        key={`${holidayYear}-${holidayMonth}-${day}`}
                        className={`holiday-calendar-cell${
                          dayHolidays.length
                            ? " holiday-calendar-has-holiday"
                            : ""
                        }`}
                        onClick={() =>
                          openAddHoliday(
                            dateKey(
                              holidayYear,
                              holidayMonth,
                              day
                            )
                          )
                        }
                      >

                        <div
                          className={`holiday-calendar-day-number${
                            isToday(
                              day
                            )
                              ? " holiday-calendar-day-today"
                              : ""
                          }`}
                        >
                          {
                            day
                          }
                        </div>

                        {dayHolidays.map(
                          (
                            holiday,
                            hIndex
                          ) => (
                            <div
                              key={`${holiday.source}-${holiday.id ?? hIndex}-${holiday.date}`}
                              className={`holiday-calendar-event ${
                                holiday.source ===
                                "public"
                                  ? "holiday-public-event"
                                  : "holiday-custom-event"
                              }`}
                              onClick={(
                                e
                              ) =>
                                e.stopPropagation()
                              }
                            >

                              <span className="holiday-calendar-event-icon">
                                <i
                                  className={
                                    holiday.source ===
                                    "public"
                                      ? "fas fa-globe"
                                      : "fas fa-star"
                                  }
                                />
                              </span>

                              <span>
                                {holiday.local_name ||
                                  holiday.name ||
                                  "Holiday"}
                              </span>

                              {holiday.source ===
                                "custom" && (
                                <span className="holiday-event-actions">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditHoliday(
                                        holiday
                                      )
                                    }
                                    title="Edit"
                                  >
                                    <i className="fas fa-pen" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteHoliday(
                                        holiday
                                      )
                                    }
                                    title="Delete"
                                  >
                                    <i className="fas fa-trash" />
                                  </button>

                                </span>
                              )}

                            </div>
                          )
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          ) : monthHolidays.length ===
            0 ? (

            <div className="holiday-card">

              <div className="holiday-empty-state">

                <i className="fas fa-calendar-xmark" />

                <h3>
                  No Holidays This Month
                </h3>

                <p>
                  Add a custom holiday or switch months to see public holidays.
                </p>

              </div>

            </div>

          ) : (

            <div className="holiday-card">

              <div className="holiday-list">

                {monthHolidays.map(
                  (
                    holiday,
                    index
                  ) => {
                    const dateInfo =
                      formatDate(
                        holiday.date
                      );

                    return (
                      <div
                        className="holiday-item"
                        key={`${holiday.source}-${holiday.id ?? index}-${holiday.date}`}
                      >

                        <div className="holiday-date-box">

                          <span>
                            {
                              dateInfo.day
                            }
                          </span>

                          <strong>
                            {new Date(
                              `${holiday.date}T00:00:00`
                            ).getDate()}
                          </strong>

                        </div>

                        <div className="holiday-info">

                          <h3>
                            {holiday.local_name ||
                              holiday.name ||
                              "Holiday"}
                          </h3>

                          <p>
                            {formatHolidayDate(
                              holiday.date
                            )}
                          </p>

                          <div className="holiday-meta">

                            <span>
                              {holiday.source ===
                              "public"
                                ? "National Holiday"
                                : "Custom Holiday"}
                            </span>

                            {holiday.is_closed && (
                              <span className="holiday-closed-badge">
                                Closed
                              </span>
                            )}

                          </div>

                        </div>

                        {holiday.source ===
                          "custom" && (
                          <div className="holiday-list-actions">

                            <button
                              type="button"
                              onClick={() =>
                                openEditHoliday(
                                  holiday
                                )
                              }
                              title="Edit"
                            >
                              <i className="fas fa-pen" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteHoliday(
                                  holiday
                                )
                              }
                              title="Delete"
                            >
                              <i className="fas fa-trash" />
                            </button>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          )}

        </div>
      </div>

      {/* =====================================================
          ADD / EDIT HOLIDAY MODAL
      ===================================================== */}

      {showHolidayModal && (

        <div
          className="holiday-modal-overlay"
          onClick={() =>
            setShowHolidayModal(
              false
            )
          }
        >

          <div
            className="holiday-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="holiday-modal-header">

              <div>

                <h2>
                  {holidayForm.id
                    ? "Edit Holiday"
                    : "Add Holiday"}
                </h2>

                <p>
                  Add a restaurant-specific holiday or closure.
                </p>

              </div>

              <button
                type="button"
                className="holiday-modal-close"
                onClick={() =>
                  setShowHolidayModal(
                    false
                  )
                }
              >
                <i className="fas fa-times" />
              </button>

            </div>

            <form
              onSubmit={
                saveHoliday
              }
            >

              <div className="holiday-form-group">

                <label>
                  Holiday Name *
                </label>

                <input
                  type="text"
                  value={
                    holidayForm.name
                  }
                  onChange={(e) =>
                    setHolidayForm(
                      (
                        current
                      ) => ({
                        ...current,

                        name:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="e.g. Restaurant Anniversary"
                  required
                />

              </div>

              <div className="holiday-form-group">

                <label>
                  Holiday Date *
                </label>

                <input
                  type="date"
                  value={
                    holidayForm
                      .holiday_date
                  }
                  onChange={(e) =>
                    setHolidayForm(
                      (
                        current
                      ) => ({
                        ...current,

                        holiday_date:
                          e.target
                            .value,
                      })
                    )
                  }
                  required
                />

              </div>

              <div className="holiday-form-group">

                <label>
                  Type
                </label>

                <select
                  value={
                    holidayForm.type
                  }
                  onChange={(e) =>
                    setHolidayForm(
                      (
                        current
                      ) => ({
                        ...current,

                        type:
                          e.target
                            .value,
                      })
                    )
                  }
                >
                  <option value="custom">
                    Custom Holiday
                  </option>

                  <option value="festival">
                    Festival
                  </option>

                  <option value="event">
                    Special Event
                  </option>

                  <option value="closure">
                    Restaurant Closure
                  </option>
                </select>

              </div>

              <div className="holiday-form-group">

                <label>
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={
                    holidayForm.notes
                  }
                  onChange={(e) =>
                    setHolidayForm(
                      (
                        current
                      ) => ({
                        ...current,

                        notes:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Optional notes"
                />

              </div>

              <label className="holiday-checkbox-row">

                <input
                  type="checkbox"
                  checked={
                    holidayForm
                      .is_closed
                  }
                  onChange={(e) =>
                    setHolidayForm(
                      (
                        current
                      ) => ({
                        ...current,

                        is_closed:
                          e.target
                            .checked,
                      })
                    )
                  }
                />

                Restaurant closed on this date

              </label>

              <div className="holiday-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowHolidayModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    savingHoliday
                  }
                >
                  {savingHoliday
                    ? "Saving..."
                    : holidayForm.id
                      ? "Update Holiday"
                      : "Add Holiday"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
    </>
  );
}