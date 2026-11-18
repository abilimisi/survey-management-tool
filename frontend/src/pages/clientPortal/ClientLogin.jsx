
import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";
import { loginClient } from "../../api/clientPortalApi";
import "./ClientAuth.css";

export default function ClientLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.verificationEmail ||
      location.state?.email ||
      ""
  );

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const verificationPending =
    location.state?.verificationPending === true;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await loginClient({
        email,
        password,
      });

      const { access, user } = response.data;

      if (!access) {
        throw new Error(
          "The server did not return an access token."
        );
      }

      localStorage.setItem(
        "client_portal_access_token",
        access
      );

      localStorage.setItem(
        "client_portal_user",
        JSON.stringify(user)
      );

      toast.success("Client login successful!");

      navigate("/client-portal/dashboard", {
        replace: true,
      });
    } catch (error) {
      const data = error.response?.data;

      // Handle an unverified email account.
      if (
        error.response?.status === 403 &&
        data?.email_verified === false
      ) {
        toast.error(
          data?.error ||
            "Please verify your email before signing in."
        );

        navigate("/client-portal/verify-email", {
          replace: true,
          state: {
            email: data?.email || email,
          },
        });

        return;
      }

      toast.error(
        data?.detail ||
          data?.non_field_errors?.[0] ||
          data?.error ||
          error.message ||
          "Unable to log in. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-auth-page">
      <section className="client-auth-brand">
        <div className="client-auth-brand-content">
          <div className="client-auth-logo">
            <span className="client-auth-logo-symbol">
              OB
            </span>

            <span>
              <strong>OPINION BUNCH</strong>
              <small>RESEARCH REDEFINED</small>
            </span>
          </div>

          <div className="client-auth-brand-message">
            <span className="client-auth-eyebrow">
              CLIENT PORTAL
            </span>

            <h1>
              Better insights.
              <br />
              Smarter decisions.
            </h1>

            <p>
              Your research workspace to create studies,
              manage projects and understand your respondents.
            </p>
          </div>

          <div className="client-auth-decoration">
            <div className="client-auth-orbit orbit-one" />
            <div className="client-auth-orbit orbit-two" />
            <div className="client-auth-orbit orbit-three" />

            <div className="client-auth-orbit-center">
              OB
            </div>
          </div>

          <div className="client-auth-brand-footer">
            Research redefined.
          </div>
        </div>
      </section>

      <main className="client-auth-main">
        <div className="client-auth-mobile-logo">
          <span className="client-auth-logo-symbol">
            OB
          </span>

          <span>
            <strong>OPINION BUNCH</strong>
            <small>RESEARCH REDEFINED</small>
          </span>
        </div>

        <div className="client-auth-form-wrapper">
          <div className="client-auth-heading">
            <span className="client-auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your details to access your research workspace.
            </p>
          </div>

          {verificationPending && (
            <div
              className="client-auth-notice"
              role="status"
            >
              Your account has been created. Please check your
              email and verify your email address before signing in.

              <div style={{ marginTop: "8px" }}>
                <Link
                  to="/client-portal/verify-email"
                  state={{
                    email,
                  }}
                >
                  Resend verification email
                </Link>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="client-auth-form"
          >
            <div className="client-auth-field">
              <label htmlFor="client-email">
                Email address
              </label>

              <input
                id="client-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="client-auth-field">
              <div className="client-auth-label-row">
                <label htmlFor="client-password">
                  Password
                </label>

                <Link to="/client-portal/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="client-auth-password">
                <input
                  id="client-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="client-auth-password-toggle"
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
              className="client-auth-submit"
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

          <div className="client-auth-switch">
            New to Opinion Bunch?

            <Link to="/client-portal/register">
              Create an account
            </Link>
          </div>

          <div className="client-auth-bottom">
            <span>OPINION BUNCH</span>
            <span>Research redefined</span>
          </div>
        </div>
      </main>
    </div>
  );
}
