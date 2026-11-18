
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";
import { loginVendor } from "../../api/vendorPortalApi";
import "./VendorAuth.css";

function VendorLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email:
      location.state?.verificationEmail ||
      location.state?.email ||
      "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const verificationPending =
    location.state?.verificationPending === true;

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await loginVendor(form);

      if (!response.data.access) {
        throw new Error(
          "The server did not return an access token."
        );
      }

      localStorage.setItem(
        "vendor_portal_access_token",
        response.data.access
      );

      toast.success("Login successful!");

      navigate("/vendor/dashboard", {
        replace: true,
      });
    } catch (error) {
      const data = error.response?.data;

      if (
        error.response?.status === 403 &&
        data?.email_verified === false
      ) {
        toast.error(
          data?.error ||
            "Please verify your email before signing in."
        );

        navigate("/vendor/verify-email", {
          replace: true,
          state: {
            email: data?.email || form.email,
          },
        });

        return;
      }

      toast.error(
        data?.non_field_errors?.[0] ||
          data?.detail ||
          data?.error ||
          error.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-auth-page">
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
              VENDOR PARTNER PORTAL
            </span>

            <h1>
              Grow your
              <br />
              network.
              <br />
              Create impact.
            </h1>

            <p>
              Manage your vendor application and connect
              with research opportunities through Opinion Bunch.
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

        <div className="vendor-auth-form-wrapper">
          <div className="vendor-auth-heading">
            <span className="vendor-auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>Vendor sign in</h2>

            <p>
              Sign in to manage your vendor application and account.
            </p>
          </div>

          {verificationPending && (
            <div
              className="vendor-auth-notice"
              role="status"
            >
              Your Vendor account has been created. Please check
              your email and verify your email address before signing in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="vendor-auth-form">
            <div className="vendor-auth-field">
              <label htmlFor="vendor-login-email">
                Email address
              </label>

              <input
                id="vendor-login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="vendor-auth-field">
              <div className="vendor-auth-label-row">
                <label htmlFor="vendor-login-password">
                  Password
                </label>

                <Link to="/vendor/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="vendor-auth-password">
                <input
                  id="vendor-login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              className="vendor-auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in to your account"}

              {!loading && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <div className="vendor-auth-switch">
            New vendor?
            <Link to="/vendor/register">
              Create an account
            </Link>
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

export default VendorLogin;
