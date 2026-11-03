import axiosInstance from "./axiosInstance";

export const getStudiesForReview = () =>
  axiosInstance.get("diy/internal/studies/reviews/");

export const reviewStudy = (studyId, data) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/review/`,
    data
  );

// Save admin manual feasibility assessment
export const assessDIYStudy = (studyId, data) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/assessment/`,
    data
  );

// Create a new DIY quotation draft
export const createDIYQuotation = (studyId, data) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/quotations/`,
    data
  );

// Send a quotation to the client
export const sendDIYQuotation = (studyId, quotationId) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/quotations/${quotationId}/send/`
  );

// Get all quotation versions for an admin study
export const getDIYQuotationHistory = (studyId) =>
  axiosInstance.get(
    `diy/internal/studies/${studyId}/quotations/history/`
  );

// Convert an accepted DIY study into an internal Project
export const convertDIYStudyToProject = (studyId) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/convert/`
  );

// Admin: validate a client's survey URL or request changes
export const reviewDIYSurveyLink = (studyId, action) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/survey-link-review/`,
    { action }
  );