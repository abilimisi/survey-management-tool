import axiosInstance from "./axiosInstance";

export const getRespondentHints = async (projectVendorId) => {
  const response = await axiosInstance.get(
    `/project-vendors/${projectVendorId}/hints/`
  );
  return response.data;
};

export const getRedirectJourney = async (respondentId) => {
  const response = await axiosInstance.get(
    `/respondents/${respondentId}/journey/`
  );
  return response.data;
};