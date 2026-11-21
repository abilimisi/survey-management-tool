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

export const checkDIYAdminAccess = async () => {
  const response = await axiosInstance.get("admin/diy/access-check/");
  return response.data;
};

// ============================================================
// DIY ADMIN ACCESS MANAGEMENT
// Super Admin only
// ============================================================

export const getDIYAccessGrants = async ({
  active = "",
} = {}) => {
  const response = await axiosInstance.get("admin/diy/access-grants/", {
    params: {
      active: active || undefined,
    },
  });

  return response.data;
};


export const grantDIYAdminAccess = async ({
  userId,
  expiresAt = null,
  notes = "",
}) => {
  const response = await axiosInstance.post(
    "admin/diy/access-grants/",
    {
      user_id: userId,
      expires_at: expiresAt || null,
      notes: notes || "",
    }
  );

  return response.data;
};


export const revokeDIYAdminAccess = async (grantId) => {
  const response = await axiosInstance.post(
    `admin/diy/access-grants/${grantId}/revoke/`
  );

  return response.data;
};