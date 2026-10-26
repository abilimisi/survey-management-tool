
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerVendor } from "../../api/vendorPortalApi";
import "./VendorPortal.css";

function VendorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
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
      const response = await registerVendor(form);
      localStorage.setItem(
        "vendor_portal_access_token",
        response.data.access
      );

      toast.success("Vendor account created successfully!");
      navigate("/vendor/dashboard");
    } catch (error) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.email?.[0] ||
            data?.password?.[0] ||
            data?.first_name?.[0] ||
            data?.non_field_errors?.[0] ||
            data?.error ||
            "Registration failed. Please check your details.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-portal-page">
      <div className="vendor-portal-card">
        <h1>Create Vendor Account</h1>
        <p className="vendor-portal-subtitle">
          Register to join our vendor network.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />

          <label htmlFor="register_email">Email address</label>
          <input
            id="register_email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="register_password">Password</label>
          <input
            id="register_password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="vendor-portal-footer">
          Already registered? <Link to="/vendor/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default VendorRegister;
