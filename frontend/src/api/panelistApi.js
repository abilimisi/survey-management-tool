import axiosInstance from "./axiosInstance";

export const getPanelists = async () => {
  const response = await axiosInstance.get("/panelists/");
  return response.data;
};

export const syncPanelists = async () => {
  const response = await axiosInstance.post("/panelists/sync/");
  return response.data;
};