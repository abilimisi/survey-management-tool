
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  requestVendorPasswordReset,
} from "../../api/vendorPortalApi";
import "./VendorAuth.css";

export default function VendorForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await requestVendorPasswordReset(email);

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
    <div className="vendor-auth-page">
      <main className="vendor-auth-main">
        <div className="vendor-auth-form-wrapper">
          <div className="vendor-auth-heading">
            <span className="vendor-auth-eyebrow">
              ACCOUNT RECOVERY
            </span>

            <h2>Forgot your password?</h2>

            <p>
              Enter your registered email address. If an eligible
              account exists, we will send you a password reset link.
            </p>
          </div>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="vendor-auth-form"
            >
              <div className="vendor-auth-field">
                <label htmlFor="vendor-forgot-email">
                  Email address
                </label>

                <input
                  id="vendor-forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="vendor-auth-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <p>
              If an eligible account exists for that email,
              a password-reset link will be sent.
            </p>
          )}

          <div className="vendor-auth-switch">
            <Link to="/vendor/login">
              Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
