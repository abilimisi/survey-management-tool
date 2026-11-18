
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/";

const vendorPortalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use only the vendor portal token.
// Do not use the internal employee or client portal token.
vendorPortalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendor_portal_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerVendor = (data) =>
  vendorPortalApi.post("vendor-portal/register/", data);

export const loginVendor = (data) =>
  vendorPortalApi.post("vendor-portal/login/", data);

export const getVendorProfile = () =>
  vendorPortalApi.get("vendor-portal/me/");

export const getVendorPortalProfile = () =>
  vendorPortalApi.get("vendor-portal/profile/");

export const saveVendorPortalProfile = (data) =>
  vendorPortalApi.patch("vendor-portal/profile/", data);

export const submitVendorApplication = () =>
  vendorPortalApi.post("vendor-portal/submit/", {});

export const getVendorProjects = () =>
  vendorPortalApi.get("vendor-portal/projects/");

export const respondToVendorProject = (assignmentId, data) =>
  vendorPortalApi.post(
    `vendor-portal/projects/${assignmentId}/response/`,
    data
  );

export const getVendorProjectMessages = (assignmentId) =>
  vendorPortalApi.get(
    `vendor-portal/projects/${assignmentId}/messages/`
  );

export const sendVendorProjectMessage = (assignmentId, message) =>
  vendorPortalApi.post(
    `vendor-portal/projects/${assignmentId}/messages/`,
    { message }
  );

// Vendor portal notifications
export const getVendorNotifications = () =>
  vendorPortalApi.get("vendor-portal/notifications/");

export const markVendorNotificationRead = (notificationId) =>
  vendorPortalApi.post(
    `vendor-portal/notifications/${notificationId}/read/`
  );

export const markAllVendorNotificationsRead = () =>
  vendorPortalApi.post("vendor-portal/notifications/read-all/");


export const verifyVendorEmail = (token) =>
  vendorPortalApi.post(
    "vendor-portal/verify-email/",
    { token }
  );

export const resendVendorVerification = (email) =>
  vendorPortalApi.post(
    "vendor-portal/resend-verification/",
    { email }
  );

export const requestVendorPasswordReset = (email) =>
  vendorPortalApi.post(
    "vendor-portal/password-reset/request/",
    { email }
  );

export const confirmVendorPasswordReset = (token, password) =>
  vendorPortalApi.post(
    "vendor-portal/password-reset/confirm/",
    { token, password }
  );

  
export default vendorPortalApi;
