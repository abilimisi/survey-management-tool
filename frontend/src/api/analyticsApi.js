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