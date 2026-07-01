import axiosInstance from "./axiosInstance";

export const mapForeignIds = async (redirectIds) => {
  const response = await axiosInstance.post("/map-foreign-ids/", {
    redirect_ids: redirectIds,
  });

  return response.data;
};