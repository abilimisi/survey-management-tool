import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/dashboard/stats/");
  return response.data;
};

export const getProjectReport = async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/report/`);
  return response.data;
};

export const getSupplierStats = async (projectId) => {
  const response = await axiosInstance.get(
    `/projects/${projectId}/supplier-stats/`
  );
  return response.data;
};

export const getReports = async () => {
  const response = await axiosInstance.get("/reports/");
  return response.data;
};

export const getClientProjects = async (clientId) => {
  const response = await axiosInstance.get(
    `/clients/${clientId}/projects/`
  );

  return response.data;
};

export const getVendorProjects = async (vendorId) => {
  const response = await axiosInstance.get(
    `/vendors/${vendorId}/projects/`
  );

  return response.data;
};

