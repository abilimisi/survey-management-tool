
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { requestClientPasswordReset } from "../../api/clientPortalApi";
import "./ClientAuth.css";

export default function ClientForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await requestClientPasswordReset(email);
      setSubmitted(true);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-auth-page">
      <main className="client-auth-main">
        <div className="client-auth-form-wrapper">
          <div className="client-auth-heading">
            <span className="client-auth-eyebrow">
              ACCOUNT RECOVERY
            </span>
            <h2>Forgot your password?</h2>
            <p>
              Enter your registered email address. If an eligible
              account exists, we will send you a reset link.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="client-auth-form">
              <div className="client-auth-field">
                <label htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="client-auth-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <p>
              If an eligible account exists for that email, a
              password-reset link will be sent.
            </p>
          )}

          <div className="client-auth-switch">
            <Link to="/client-portal/login">Back to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
