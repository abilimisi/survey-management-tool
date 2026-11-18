
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmClientPasswordReset } from "../../api/clientPortalApi";
import "./ClientAuth.css";

export default function ClientResetPassword() {
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

    setLoading(true);

    try {
      const response = await confirmClientPasswordReset(
        token,
        password
      );

      toast.success(response.data.message);
      navigate("/client-portal/login", { replace: true });
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
    <div className="client-auth-page">
      <main className="client-auth-main">
        <div className="client-auth-form-wrapper">
          <div className="client-auth-heading">
            <span className="client-auth-eyebrow">
              ACCOUNT RECOVERY
            </span>
            <h2>Set a new password</h2>
            <p>Enter and confirm your new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="client-auth-form">
            <div className="client-auth-field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="client-auth-field">
              <label htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
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
              className="client-auth-submit"
              disabled={loading || !token}
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>
          </form>

          <div className="client-auth-switch">
            <Link to="/client-portal/login">Back to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
