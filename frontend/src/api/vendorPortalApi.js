
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


export default vendorPortalApi;
