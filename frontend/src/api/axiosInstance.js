
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// A shared promise prevents simultaneous requests from refreshing
// the same refresh token more than once.
let refreshPromise = null;

const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("is_superuser");
  localStorage.removeItem("role");
};

const redirectToLogin = () => {
  clearAuth();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

// Attach the current access token to API requests.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access tokens.
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Do not try to refresh if there is no refresh token.
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Reuse an existing refresh operation if one is already running.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL}token/refresh/`,
            { refresh: refreshToken }
          )
          .then((response) => {
            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh;

            if (!newAccessToken) {
              throw new Error("Refresh response did not contain an access token.");
            }

            localStorage.setItem("access_token", newAccessToken);

            // SimpleJWT returns a new refresh token when rotation is enabled.
            if (newRefreshToken) {
              localStorage.setItem("refresh_token", newRefreshToken);
            }

            return newAccessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);

    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
