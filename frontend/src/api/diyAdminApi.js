import axiosInstance from "./axiosInstance";

export const getRegisteredClients = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
} = {}) => {
  const response = await axiosInstance.get("admin/diy/clients/", {
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
    },
  });

  return response.data;
};

export const getRegisteredVendors = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  applicationStatus = "",
} = {}) => {
  const response = await axiosInstance.get("admin/diy/vendors/", {
    params: {
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
      application_status: applicationStatus || undefined,
    },
  });

  return response.data;
};