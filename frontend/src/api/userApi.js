import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get("/users/");
  return response.data;
};

export const createUser = async (data) => {
  const response = await axiosInstance.post(
    "/users/create/",
    data
  );
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosInstance.put(
    `/users/${id}/update/`,
    data
  );

  return response.data;
};
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(
    `/users/${id}/delete/`
  );
  return response.data;
};

