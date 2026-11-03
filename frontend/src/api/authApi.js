import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_BASE}/token/`, {
    username,
    password,
  });

  return response.data;
};

export const logoutUser = async (accessToken, refreshToken) => {
  if (!accessToken || !refreshToken) {
    throw new Error("Both access and refresh tokens are required.");
  }

  const response = await axios.post(
    `${API_BASE}/token/blacklist/`,
    {
      access: accessToken,
      refresh: refreshToken,
    }
  );

  return response.data;
};

export const sendSessionHeartbeat = async (accessToken) => {
  const response = await axios.post(
    `${API_BASE}/session/heartbeat/`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};