import axiosInstance from "./axiosInstance";

export const getRespondentHints = async (
    projectVendorId,
    status
) => {

    let url = `/project-vendors/${projectVendorId}/hints/`;

    if (status) {
        url += `?status=${status}`;
    }

    const response = await axiosInstance.get(url);

    return response.data;
};

export const getRedirectJourney = async (respondentId) => {
  const response = await axiosInstance.get(
    `/respondents/${respondentId}/journey/`
  );
  return response.data;
};