
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import {
  verifyVendorEmail,
  resendVendorVerification,
} from "../../api/vendorPortalApi";
import "./VendorAuth.css";

export default function VendorVerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const token = searchParams.get("token");

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    verifyVendorEmail(token)
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
      const response = await resendVendorVerification(email);
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
    <div className="vendor-auth-page">
      <main className="vendor-auth-main">
        <div className="vendor-auth-form-wrapper">
          <div className="vendor-auth-heading">
            <span className="vendor-auth-eyebrow">
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
                ? "Your Vendor account email is verified. You can now sign in and complete your Vendor profile."
                : loading
                ? "Please wait while we verify your email address."
                : "Use the link sent to your email address. You can request another verification link below."}
            </p>
          </div>

          {!loading && !verified && (
            <form
              onSubmit={handleResend}
              className="vendor-auth-form"
            >
              <div className="vendor-auth-field">
                <label htmlFor="vendor-verification-email">
                  Email address
                </label>

                <input
                  id="vendor-verification-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@company.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="vendor-auth-submit"
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
              className="vendor-auth-submit"
              to="/vendor/login"
            >
              Continue to sign in
            </Link>
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
