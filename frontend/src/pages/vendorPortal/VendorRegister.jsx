
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerVendor } from "../../api/vendorPortalApi";
import "./VendorAuth.css";

function VendorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await registerVendor(form);

      if (!response.data.access) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem(
        "vendor_portal_access_token",
        response.data.access
      );

      toast.success("Vendor account created successfully!");
      navigate("/vendor/dashboard", { replace: true });
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
            error.message ||
            "Registration failed. Please check your details.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-auth-page vendor-auth-register-page">
      <section className="vendor-auth-brand">
        <div className="vendor-auth-brand-content">
          <div className="vendor-auth-logo">
            <span className="vendor-auth-logo-symbol">OB</span>
            <span>
              <strong>OPINION BUNCH</strong>
              <small>RESEARCH REDEFINED</small>
            </span>
          </div>

          <div className="vendor-auth-brand-message">
            <span className="vendor-auth-eyebrow">
              JOIN OUR NETWORK
            </span>

            <h1>
              Stronger
              <br />
              partnerships.
              <br />
              Better research.
            </h1>

            <p>
              Create your vendor account and take the first
              step towards working with Opinion Bunch.
            </p>
          </div>

          <div className="vendor-auth-decoration">
            <div className="vendor-auth-orbit vendor-orbit-one" />
            <div className="vendor-auth-orbit vendor-orbit-two" />
            <div className="vendor-auth-orbit vendor-orbit-three" />
            <div className="vendor-auth-orbit-center">OB</div>
          </div>

          <div className="vendor-auth-brand-footer">
            Building better research partnerships.
          </div>
        </div>
      </section>

      <main className="vendor-auth-main">
        <div className="vendor-auth-mobile-logo">
          <span className="vendor-auth-logo-symbol">OB</span>
          <span>
            <strong>OPINION BUNCH</strong>
            <small>RESEARCH REDEFINED</small>
          </span>
        </div>

        <div className="vendor-auth-form-wrapper vendor-auth-register-form">
          <div className="vendor-auth-heading">
            <span className="vendor-auth-eyebrow">
              GET STARTED
            </span>

            <h2>Create vendor account</h2>

            <p>
              Register your details to join our vendor network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="vendor-auth-form">
            <div className="vendor-auth-name-grid">
              <div className="vendor-auth-field">
                <label htmlFor="vendor-first-name">
                  First name
                </label>

                <input
                  id="vendor-first-name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="vendor-auth-field">
                <label htmlFor="vendor-last-name">
                  Last name
                </label>

                <input
                  id="vendor-last-name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="vendor-auth-field">
              <label htmlFor="vendor-register-email">
                Email address
              </label>

              <input
                id="vendor-register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="vendor-auth-field">
              <label htmlFor="vendor-register-password">
                Create password
              </label>

              <div className="vendor-auth-password">
                <input
                  id="vendor-register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="vendor-auth-password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <small className="vendor-auth-hint">
                Use at least 8 characters.
              </small>
            </div>

            <button
              type="submit"
              className="vendor-auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create vendor account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="vendor-auth-switch">
            Already registered?
            <Link to="/vendor/login">Sign in</Link>
          </div>

          <div className="vendor-auth-bottom">
            <span>OPINION BUNCH</span>
            <span>Research redefined</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VendorRegister;
