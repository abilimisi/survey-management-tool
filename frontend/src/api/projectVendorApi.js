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

export const deleteProjectVendor = async (id) => {
  const response = await axiosInstance.delete(
    `/project-vendors/${id}/`
  );
  return response.data;
};

export const updateProjectVendor = async (id, data) => {
  const response = await axiosInstance.put(
    `/project-vendors/${id}/`,
    data
  );
  return response.data;
};