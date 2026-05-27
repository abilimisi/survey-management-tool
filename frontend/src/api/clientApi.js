import axiosInstance from "./axiosInstance";

export const getClients = async () => {
  const response = await axiosInstance.get("/clients/");
  return response.data;
};

export const createClient = async (data) => {
  const response = await axiosInstance.post("/clients/", data);
  return response.data;
};

export const updateClient = async (id, data) => {
  const response = await axiosInstance.put(`/clients/${id}/`, data);
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await axiosInstance.delete(`/clients/${id}/`);
  return response.data;
};

export const getSingleClient = async (id) => {
  const response = await axiosInstance.get(`/clients/${id}/`);
  return response.data;
};