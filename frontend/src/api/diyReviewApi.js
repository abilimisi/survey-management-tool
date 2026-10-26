
import axiosInstance from "./axiosInstance";

export const getStudiesForReview = () =>
  axiosInstance.get("diy/internal/studies/");

export const reviewStudy = (studyId, data) =>
  axiosInstance.post(
    `diy/internal/studies/${studyId}/review/`,
    data
  );
