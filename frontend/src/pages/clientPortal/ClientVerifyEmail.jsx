
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  verifyClientEmail,
  resendClientVerification,
} from "../../api/clientPortalApi";
import "./ClientAuth.css";

export default function ClientVerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const token = searchParams.get("token");
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    verifyClientEmail(token)
      .then(() => {
        if (active) {
          setVerified(true);
          toast.success("Email verified successfully.");
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(
            error.response?.data?.error ||
            "Verification link is invalid or expired."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    setResending(true);

    try {
      const response = await resendClientVerification(email);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        "Unable to request another verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="client-auth-page">
      <main className="client-auth-main">
        <div className="client-auth-form-wrapper">
          <div className="client-auth-heading">
            <span className="client-auth-eyebrow">
              EMAIL VERIFICATION
            </span>

            <h2>
              {verified
                ? "Email verified"
                : loading
                ? "Verifying your email..."
                : "Verify your email"}
            </h2>

            <p>
              {verified
                ? "Your Client portal account is now verified. You can sign in."
                : loading
                ? "Please wait while we verify your email address."
                : "Use the link sent to your email address. If you need another link, request one below."}
            </p>
          </div>

          {!loading && !verified && (
            <form onSubmit={handleResend} className="client-auth-form">
              <div className="client-auth-field">
                <label htmlFor="verification-email">
                  Email address
                </label>
                <input
                  id="verification-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="client-auth-submit"
                disabled={resending}
              >
                {resending
                  ? "Sending..."
                  : "Resend verification email"}
              </button>
            </form>
          )}

          {verified && (
            <Link
              className="client-auth-submit"
              to="/client-portal/login"
            >
              Continue to sign in
            </Link>
          )}

          <div className="client-auth-switch">
            <Link to="/client-portal/login">Back to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
