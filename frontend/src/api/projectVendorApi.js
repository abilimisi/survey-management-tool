import axiosInstance from "./axiosInstance";

export const getProjectVendors = async () => {
  const response = await axiosInstance.get("/project-vendors/");
  return response.data;
};

export const createProjectVendor = async (data) => {
  const response = await axiosInstance.post("/project-vendors/", data);
  return response.data;
};

export const getSupplierStats = async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/supplier-stats/`);
  return response.data;
};