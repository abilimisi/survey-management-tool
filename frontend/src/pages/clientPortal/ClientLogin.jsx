
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginClient } from "../../api/clientPortalApi";
import "./clientLogin.css";

export default function ClientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginClient({ email, password });
      const { access, user } = response.data;

      if (!access) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem("client_portal_access_token", access);
      localStorage.setItem(
        "client_portal_user",
        JSON.stringify(user)
      );

      toast.success("Client login successful!");
      navigate("/client-portal/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          error.response?.data?.error ||
          "Unable to log in. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-login-page">
      <div className="client-login-card">
        <h1>Client Portal</h1>
        <p>Sign in to manage your studies.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="client-email">Email address</label>
          <input
            id="client-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="client-password">Password</label>
          <input
            id="client-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="client-login-register">
          New to the portal?{" "}
          <Link to="/client-portal/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
