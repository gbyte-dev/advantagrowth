import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",

  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (
      typeof window !==
      "undefined"
    ) {
      const token =
        sessionStorage.getItem(
          "token"
        );

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const pathname = window.location.pathname;

      if (
        (status === 401 || status === 403) &&
        pathname.startsWith("/superadmin") &&
        pathname !== "/superadmin/login"
      ) {
        sessionStorage.clear();
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/superadmin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;