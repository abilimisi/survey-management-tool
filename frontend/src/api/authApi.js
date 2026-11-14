
import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_BASE = "http://127.0.0.1:8000/api";

// Login: use plain Axios because the user does not have a token yet.
export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_BASE}/token/`, {
    username,
    password,
  });

  return response.data;
};

// Logout: send both tokens and the access-token authorization header.
export const logoutUser = async (accessToken, refreshToken) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both access and refresh tokens are required.");
  }

  const response = await axios.post(
    `${API_BASE}/token/blacklist/`,
    {
      access: accessToken,
      refresh: refreshToken,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

// Heartbeat: use axiosInstance so access-token refresh is handled centrally.
export const sendSessionHeartbeat = async () => {
  const response = await axiosInstance.post(
    "session/heartbeat/",
    {}
  );

  return response.data;
};

// Get notifications for the logged-in admin.
export const getAdminNotifications = async () => {
  return axiosInstance.get("diy/internal/notifications/");
};

// Mark an admin notification as read.
export const markAdminNotificationAsRead = async (notificationId) => {
  return axiosInstance.post(
    `diy/internal/notifications/${notificationId}/read/`,
    {}
  );
};

// Mark all admin notifications as read.
export const markAllAdminNotificationsAsRead = async () => {
  return axiosInstance.post(
    "diy/internal/notifications/read-all/",
    {}
  );
};

// Get notifications related to DIY vendors for the logged-in admin.
export const getVendorAdminNotifications = async () => {
  return axiosInstance.get(
    "vendor-portal/admin/notifications/"
  );
};

// Mark a vendor notification as read.
export const markVendorAdminNotificationAsRead = async (notificationId) => {
  return axiosInstance.post(
    `vendor-portal/admin/notifications/${notificationId}/read/`,
    {}
  );
};

// Mark all vendor notifications as read.
export const markAllVendorAdminNotificationsAsRead = async () => {
  return axiosInstance.post(
    "vendor-portal/admin/notifications/read-all/",
    {}
  );
};
