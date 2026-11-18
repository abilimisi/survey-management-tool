
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerClient } from "../../api/clientPortalApi";
import "./ClientAuth.css";

export default function ClientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    company_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await registerClient(form);

      toast.success(
        response.data.message ||
          "Your account has been created. Please verify your email."
      );

      // Registration no longer logs the client in.
      // The client must verify their email first.
      localStorage.removeItem("client_portal_access_token");
      localStorage.removeItem("client_portal_user");

      navigate("/client-portal/verify-email", {
        replace: true,
        state: {
          email: form.email.trim().toLowerCase(),
          verificationPending: true,
        },
      });
    } catch (error) {
      const data = error.response?.data;

      const message =
        data?.detail ||
        data?.error ||
        Object.entries(data || {})
          .map(([field, messages]) => {
            const formattedMessages = Array.isArray(messages)
              ? messages.join(", ")
              : typeof messages === "string"
              ? messages
              : JSON.stringify(messages);

            return `${field}: ${formattedMessages}`;
          })
          .join(" | ") ||
        error.message ||
        "Unable to create your account.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-auth-page client-auth-register-page">
      <section className="client-auth-brand">
        <div className="client-auth-brand-content">
          <div className="client-auth-logo">
            <span className="client-auth-logo-symbol">OB</span>

            <span>
              <strong>OPINION BUNCH</strong>
              <small>RESEARCH REDEFINED</small>
            </span>
          </div>

          <div className="client-auth-brand-message">
            <span className="client-auth-eyebrow">
              GET STARTED
            </span>

            <h1>
              Turn your
              <br />
              questions into
              <br />
              insights.
            </h1>

            <p>
              Create your company workspace and start building
              meaningful research studies with Opinion Bunch.
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
            Your research journey starts here.
          </div>
        </div>
      </section>

      <main className="client-auth-main">
        <div className="client-auth-mobile-logo">
          <span className="client-auth-logo-symbol">OB</span>

          <span>
            <strong>OPINION BUNCH</strong>
            <small>RESEARCH REDEFINED</small>
          </span>
        </div>

        <div className="client-auth-form-wrapper client-auth-register-form">
          <div className="client-auth-heading">
            <span className="client-auth-eyebrow">
              CREATE YOUR WORKSPACE
            </span>

            <h2>Create your account</h2>

            <p>
              Register your company to start creating research studies.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="client-auth-form"
          >
            <div className="client-auth-name-grid">
              <div className="client-auth-field">
                <label htmlFor="first_name">
                  First name
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="client-auth-field">
                <label htmlFor="last_name">
                  Last name
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="client-auth-field">
              <label htmlFor="register-email">
                Work email address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="client-auth-field">
              <label htmlFor="register-password">
                Create password
              </label>

              <div className="client-auth-password">
                <input
                  id="register-password"
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

              <small className="client-auth-hint">
                Use at least 8 characters.
              </small>
            </div>

            <div className="client-auth-field">
              <label htmlFor="company_name">
                Company name
              </label>

              <input
                id="company_name"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="Your company name"
                autoComplete="organization"
                required
              />
            </div>

            <button
              type="submit"
              className="client-auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create your account"}

              {!loading && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <div className="client-auth-switch">
            Already have an account?
            <Link to="/client-portal/login">
              Sign in
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
