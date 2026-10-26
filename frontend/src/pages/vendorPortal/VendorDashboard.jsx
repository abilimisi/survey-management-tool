
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getVendorProfile,
} from "../../api/vendorPortalApi";
import {
  LayoutDashboard,
  Building2,
  Mail,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import "./VendorPortal.css";

function VendorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!localStorage.getItem("vendor_portal_access_token")) {
        navigate("/vendor/login", { replace: true });
        return;
      }

      try {
        const response = await getVendorProfile();

        if (!cancelled) {
          setProfile(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem("vendor_portal_access_token");
          toast.error("Please log in again.");
          navigate("/vendor/login", { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vendor_portal_access_token");
    navigate("/vendor/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="vendor-portal-page">
        <div className="vendor-dashboard-loading">
          <div className="vendor-loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const user = profile.user || {};
  const status = (user.application_status || "pending").toLowerCase();
  const profileSubmitted = Boolean(user.profile_submitted);
  const companyName = user.company_name || "Company profile";
  const firstName = user.first_name || "Vendor";

  const statusDetails = {
    pending: {
      label: "Pending Review",
      description: profileSubmitted
        ? "Your application has been submitted and is awaiting administrator review."
        : "Complete your company profile and submit it for administrator review.",
      icon: Clock3,
      className: "pending",
    },
    approved: {
      label: "Approved",
      description: "Your vendor application has been approved.",
      icon: CheckCircle2,
      className: "approved",
    },
    rejected: {
      label: "Rejected",
      description: "Your application was rejected. Please contact the administrator for further information.",
      icon: AlertCircle,
      className: "rejected",
    },
  };

  const currentStatus = statusDetails[status] || statusDetails.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="vendor-portal-page vendor-dashboard-page">
      <div className="vendor-dashboard-shell">
        <header className="vendor-dashboard-topbar">
          <Link to="/vendor/dashboard" className="vendor-brand">
            <span className="vendor-brand-icon">
              <Building2 size={23} />
            </span>
            <span>
              <strong>Vendor Portal</strong>
              <small>PanelSphere</small>
            </span>
          </Link>

          <div className="vendor-topbar-actions">
            <span className="vendor-account-email">
              <ShieldCheck size={16} />
              Vendor Account
            </span>
            <button
              type="button"
              className="vendor-topbar-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </header>

        <main className="vendor-dashboard-main">
          <section className="vendor-dashboard-welcome">
            <div>
              <span className="vendor-eyebrow">
                <LayoutDashboard size={15} />
                VENDOR WORKSPACE
              </span>
              <h1>Welcome back, {firstName}!</h1>
              <p>
                Manage your company information and track your vendor
                application from one place.
              </p>
            </div>

            <div className={`vendor-welcome-status ${currentStatus.className}`}>
              <StatusIcon size={19} />
              <span>{currentStatus.label}</span>
            </div>
          </section>

          <section className="vendor-overview-grid">
            <article className="vendor-overview-card">
              <div className="vendor-overview-icon blue">
                <ClipboardCheck size={21} />
              </div>
              <span className="vendor-overview-label">Application Status</span>
              <strong>{currentStatus.label}</strong>
              <small>
                {profileSubmitted ? "Profile submitted" : "Submission required"}
              </small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon purple">
                <Building2 size={21} />
              </div>
              <span className="vendor-overview-label">Company Profile</span>
              <strong>{profileSubmitted ? "Submitted" : "Incomplete"}</strong>
              <small>
                {user.company_name || "Company details not added yet"}
              </small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon green">
                <Mail size={21} />
              </div>
              <span className="vendor-overview-label">Account Email</span>
              <strong className="vendor-email-value">
                {user.email || "Not available"}
              </strong>
              <small>Registered account</small>
            </article>

            <article className="vendor-overview-card">
              <div className="vendor-overview-icon orange">
                <FileText size={21} />
              </div>
              <span className="vendor-overview-label">Next Step</span>
              <strong>
                {status === "approved"
                  ? "Application complete"
                  : status === "rejected"
                    ? "Contact admin"
                    : profileSubmitted
                      ? "Await review"
                      : "Complete profile"}
              </strong>
              <small>
                {status === "approved"
                  ? "Your application was accepted"
                  : status === "rejected"
                    ? "Request further information"
                    : profileSubmitted
                      ? "No further action right now"
                      : "Submit your company details"}
              </small>
            </article>
          </section>

          <section className="vendor-dashboard-content-grid">
            <article className="vendor-dashboard-panel vendor-application-panel">
              <div className="vendor-panel-heading">
                <div>
                  <span className="vendor-panel-kicker">APPLICATION</span>
                  <h2>Application Overview</h2>
                </div>
                <span className={`vendor-status-icon ${currentStatus.className}`}>
                  <StatusIcon size={21} />
                </span>
              </div>

              <div className={`vendor-application-banner ${currentStatus.className}`}>
                <strong>{currentStatus.label}</strong>
                <p>{currentStatus.description}</p>
              </div>

              <div className="vendor-progress-list">
                <div className="vendor-progress-step complete">
                  <span className="vendor-progress-marker">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <strong>Account Registration</strong>
                    <p>Your vendor account has been created.</p>
                  </div>
                </div>

                <div className={`vendor-progress-step ${profileSubmitted ? "complete" : "current"}`}>
                  <span className="vendor-progress-marker">
                    {profileSubmitted
                      ? <CheckCircle2 size={18} />
                      : <Building2 size={18} />}
                  </span>
                  <div>
                    <strong>Company Profile</strong>
                    <p>
                      {profileSubmitted
                        ? "Your company details have been submitted."
                        : "Add your company and invoicing information."}
                    </p>
                  </div>
                </div>

                <div className={`vendor-progress-step ${status === "approved" ? "complete" : status === "rejected" ? "rejected" : profileSubmitted ? "current" : ""}`}>
                  <span className="vendor-progress-marker">
                    {status === "approved"
                      ? <CheckCircle2 size={18} />
                      : status === "rejected"
                        ? <AlertCircle size={18} />
                        : <Clock3 size={18} />}
                  </span>
                  <div>
                    <strong>Administrator Review</strong>
                    <p>
                      {status === "approved"
                        ? "Your application has been approved."
                        : status === "rejected"
                          ? "Your application was rejected. Contact the administrator."
                          : profileSubmitted
                            ? "Your application is waiting for review."
                            : "Submit your profile before review can begin."}
                    </p>
                  </div>
                </div>
              </div>

              {status === "pending" && (
                <Link
                  to="/vendor/profile"
                  className="vendor-primary-action"
                >
                  {profileSubmitted ? "View Company Profile" : "Complete Vendor Profile"}
                  <ArrowRight size={17} />
                </Link>
              )}

              {status === "approved" && (
                <Link
                  to="/vendor/profile"
                  className="vendor-secondary-action"
                >
                  View Company Profile
                  <ArrowRight size={17} />
                </Link>
              )}

              {status === "rejected" && (
                <Link
                  to="/vendor/profile"
                  className="vendor-secondary-action"
                >
                  View Submitted Profile
                  <ArrowRight size={17} />
                </Link>
              )}
            </article>

            <aside className="vendor-dashboard-panel vendor-quick-panel">
              <span className="vendor-panel-kicker">YOUR ACCOUNT</span>
              <h2>Account Information</h2>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <Mail size={18} />
                </span>
                <div>
                  <small>Login email</small>
                  <strong>{user.email || "—"}</strong>
                </div>
              </div>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <Building2 size={18} />
                </span>
                <div>
                  <small>Company</small>
                  <strong>{companyName}</strong>
                </div>
              </div>

              <div className="vendor-account-row">
                <span className="vendor-account-row-icon">
                  <ClipboardCheck size={18} />
                </span>
                <div>
                  <small>Application status</small>
                  <strong className={`vendor-inline-status ${currentStatus.className}`}>
                    {currentStatus.label}
                  </strong>
                </div>
              </div>

              <div className="vendor-help-note">
                <ShieldCheck size={19} />
                <p>
                  Keep your company and invoicing details accurate so your
                  vendor application can be reviewed correctly.
                </p>
              </div>
            </aside>
          </section>

          <footer className="vendor-dashboard-footer">
            <span>PanelSphere Vendor Portal</span>
            <Link to="/vendor/profile">Company Profile</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default VendorDashboard;
