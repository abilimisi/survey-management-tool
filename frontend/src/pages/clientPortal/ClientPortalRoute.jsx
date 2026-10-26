
import { Navigate } from "react-router-dom";

export default function ClientPortalRoute({ children }) {
  const token = localStorage.getItem("client_portal_access_token");

  if (!token) {
    return <Navigate to="/client-portal/login" replace />;
  }

  return children;
}
