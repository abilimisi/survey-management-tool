import axiosInstance from "./axiosInstance";

/* ===========================
   DASHBOARD ANALYTICS
=========================== */

export const getAnalyticsOverview = async () => {
  const response = await axiosInstance.get("/analytics/overview/");
  return response.data;
};

export const getAnalyticsHitsChart = async () => {
  const response = await axiosInstance.get("/analytics/hits-chart/");
  return response.data;
};

export const getAnalyticsStatusChart = async () => {
  const response = await axiosInstance.get("/analytics/status-chart/");
  return response.data;
};

export const getVendorPerformance = async () => {
  const response = await axiosInstance.get(
    "/analytics/vendor-performance/"
  );
  return response.data;
};

export const getProjectPerformance = async (projectId = "") => {
  const response = await axiosInstance.get(
    "/analytics/project-performance/",
    {
      params: {
        project: projectId,
      },
    }
  );

  return response.data;
};

export const getAnalyticsFunnel = async () => {
  const response = await axiosInstance.get("/analytics/funnel/");
  return response.data;
};

/* ===========================
   PROJECT ANALYTICS
=========================== */

export const getProjectList = async () => {
  const response = await axiosInstance.get(
    "/analytics/project-list/"
  );

  return response.data;
};

export const getAnalyticsProjectDetails = async (
  projectId
) => {
  const response = await axiosInstance.get(
    `/analytics/projects/${projectId}/`
  );

  return response.data;
};

/* ===========================
   VENDOR ANALYTICS
=========================== */

export const getVendorList = async () => {
  const response = await axiosInstance.get(
    "/analytics/vendor-list/"
  );

  return response.data;
};

export const getAnalyticsVendorDetails = async (
  vendorId
) => {
  const response = await axiosInstance.get(
    `/analytics/vendors/${vendorId}/`
  );

  return response.data;
};

/* ===========================
   AI ANALYTICS
=========================== */
export const askAIAnalytics = async (question) => {
    const response = await axiosInstance.post("/ai/analytics/", {
        question,
    });

    return response.data;
};