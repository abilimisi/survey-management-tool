
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/";

const vendorAdminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use the internal employee token, never the vendor portal token.
vendorAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getPendingVendorApplications = () =>
  vendorAdminApi.get("vendor-portal/admin/applications/");


export const reviewVendorApplication = (
  applicationId,
  action,
  adminNote = ""
) =>
  vendorAdminApi.post(
    `vendor-portal/admin/applications/${applicationId}/decision/`,
    {
      action,
      ...(action === "reject" ? { admin_note: adminNote } : {}),
    }
  );
