
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import {
  confirmVendorPasswordReset,
} from "../../api/vendorPortalApi";
import "./VendorAuth.css";

export default function VendorResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Password reset link is missing or invalid.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await confirmVendorPasswordReset(
        token,
        password
      );

      // Remove the current Vendor token as a precaution.
      localStorage.removeItem("vendor_portal_access_token");

      toast.success(response.data.message);

      navigate("/vendor/login", {
        replace: true,
      });
    } catch (error) {
      const data = error.response?.data;

      const message =
        data?.error ||
        data?.password?.join(", ") ||
        "Unable to reset your password.";

      toast.error(message);
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

            <h2>Set a new password</h2>

            <p>
              Enter and confirm your new Vendor portal password.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="vendor-auth-form"
          >
            <div className="vendor-auth-field">
              <label htmlFor="vendor-new-password">
                New password
              </label>

              <input
                id="vendor-new-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="vendor-auth-field">
              <label htmlFor="vendor-confirm-password">
                Confirm new password
              </label>

              <input
                id="vendor-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="vendor-auth-submit"
              disabled={loading || !token}
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>
          </form>

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
