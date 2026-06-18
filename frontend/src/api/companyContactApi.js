import axiosInstance from "./axiosInstance";

export const getCompanyContacts = async () => {
  const response = await axiosInstance.get("/company-contacts/");
  return response.data;
};

export const getSingleCompanyContact = async (id) => {
  const response = await axiosInstance.get(`/company-contacts/${id}/`);
  return response.data;
};

export const createCompanyContact = async (data) => {
  const response = await axiosInstance.post("/company-contacts/", data);
  return response.data;
};

export const updateCompanyContact = async (id, data) => {
  const response = await axiosInstance.put(`/company-contacts/${id}/`, data);
  return response.data;
};

export const deleteCompanyContact = async (id) => {
  const response = await axiosInstance.delete(`/company-contacts/${id}/`);
  return response.data;
};