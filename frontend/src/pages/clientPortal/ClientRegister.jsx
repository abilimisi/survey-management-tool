
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerClient } from "../../api/clientPortalApi";
import "./ClientLogin.css";

export default function ClientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    company_name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await registerClient(form);
      const { access, user } = response.data;

      if (!access) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem("client_portal_access_token", access);
      localStorage.setItem("client_portal_user", JSON.stringify(user));

      toast.success("Your client account has been created.");
      navigate("/client-portal/dashboard", { replace: true });
    } catch (error) {
      const data = error.response?.data;

      const message =
        data?.detail ||
        data?.error ||
        Object.entries(data || {})
          .map(([field, messages]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
          )
          .join(" | ") ||
        error.message ||
        "Unable to create your account.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-login-page">
      <div className="client-login-card">
        <h1>Create your account</h1>
        <p>Register your company to start creating research studies.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            autoComplete="given-name"
            required
          />

          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            autoComplete="family-name"
          />

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="company_name">Company name</label>
          <input
            id="company_name"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            autoComplete="organization"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="client-login-register">
          Already registered? <Link to="/client-portal/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
