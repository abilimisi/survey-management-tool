
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginVendor } from "../../api/vendorPortalApi";
import "./VendorPortal.css";

function VendorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginVendor(form);

      localStorage.setItem(
        "vendor_portal_access_token",
        response.data.access
      );

      toast.success("Login successful!");
      navigate("/vendor/dashboard");
    } catch (error) {
      const data = error.response?.data;
      const message =
        data?.non_field_errors?.[0] ||
        data?.detail ||
        data?.error ||
        "Invalid email or password.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-portal-page">
      <div className="vendor-portal-card">
        <h1>Vendor Login</h1>
        <p className="vendor-portal-subtitle">
          Sign in to manage your vendor application.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login_email">Email address</label>
          <input
            id="login_email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="login_password">Password</label>
          <input
            id="login_password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <p className="vendor-portal-footer">
          New vendor? <Link to="/vendor/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default VendorLogin;
