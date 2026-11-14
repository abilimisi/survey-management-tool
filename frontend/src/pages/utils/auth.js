export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("access_token"));
};

export const isAdmin = () => {
  return localStorage.getItem("is_superuser") === "true";
};

export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("is_superuser");
  localStorage.removeItem("role");
};