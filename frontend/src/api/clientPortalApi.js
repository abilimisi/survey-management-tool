
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/";

const clientPortalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use only the external client's token.
// Do not read or refresh the internal employee token.
clientPortalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("client_portal_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerClient = (data) =>
  clientPortalApi.post("client-portal/register/", data);

export const loginClient = (data) =>
  clientPortalApi.post("client-portal/login/", data);

export const getClientProfile = () =>
  clientPortalApi.get("client-portal/me/");

export const getClientStudies = () =>
  clientPortalApi.get("diy/studies/");

export const createClientStudy = (data) =>
  clientPortalApi.post("diy/studies/", data);

export const submitClientStudy = (studyId) =>
  clientPortalApi.post(`diy/studies/${studyId}/submit/`);

export const updateClientStudy = (studyId, data) =>
  clientPortalApi.patch(`diy/studies/${studyId}/`, data);

export default clientPortalApi;
