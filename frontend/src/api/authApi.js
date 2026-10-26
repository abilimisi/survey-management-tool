import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_BASE}/token/`, {
    username,
    password,
  });

  return response.data;
};