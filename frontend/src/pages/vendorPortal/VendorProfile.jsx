
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getVendorPortalProfile,
  saveVendorPortalProfile,
  submitVendorApplication,
} from "../../api/vendorPortalApi";
import "./VendorProfile.css";

import {
  CheckCircle2,
  Clock3,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const initialForm = {
  company_name: "",
  abrv_name: "",
  contact_number: "",
  invoice_email: "",
  tax_id: "",
  address: "",
  invoicing_method: "",
  payment_terms: "",
  city: "",
  zip_code: "",
  country: "",
  state: "",
};

function VendorProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("pending");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!localStorage.getItem("vendor_portal_access_token")) {
        navigate("/vendor/login", { replace: true });
        return;
      }

      try {
        const response = await getVendorPortalProfile();
        const data = response.data;

        if (!cancelled) {
          setForm((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.keys(initialForm).map((key) => [
                key,
                data[key] ?? "",
              ])
            ),
          }));

          setSubmitted(Boolean(data.profile_submitted));
          setApplicationStatus(data.application_status || "pending");
          setAdminNote(data.admin_note || "");
        }
      } catch (error) {
        if (!cancelled) {
          const status = error.response?.status;

          if (status === 401 || status === 403) {
            toast.error("Your session has expired. Please log in again.");
            localStorage.removeItem("vendor_portal_access_token");
            navigate("/vendor/login", { replace: true });
          } else {
            toast.error("Unable to load your vendor profile.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const isRejected = applicationStatus === "rejected";
  const isApproved = applicationStatus === "approved";
  const isReadOnly = submitted && !isRejected;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (isReadOnly) {
      toast.info("Submitted profiles cannot be edited.");
      return;
    }

    setSaving(true);

    try {
      const response = await saveVendorPortalProfile(form);

      if (response.data?.profile) {
        setForm((current) => ({
          ...current,
          ...response.data.profile,
        }));
      }

      toast.success("Profile saved successfully.");
    } catch (error) {
      const data = error.response?.data;

      toast.error(
        data?.error ||
          data?.detail ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly || saving) {
      return;
    }

    const confirmationMessage = isRejected
      ? "Resubmit your updated vendor profile for admin approval?"
      : "Submit your vendor profile for admin approval? You will not be able to edit it unless the administrator rejects it.";

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setSaving(true);

    try {
      // Save the latest form values before submitting.
      await saveVendorPortalProfile(form);

      const response = await submitVendorApplication();

      setSubmitted(true);
      setApplicationStatus("pending");
      setAdminNote("");

      toast.success(
        response.data?.message ||
          "Application submitted successfully."
      );

      navigate("/vendor/dashboard");
    } catch (error) {
      const data = error.response?.data;
      const missing = data?.missing_fields;

      toast.error(
        missing?.length
          ? `Please complete: ${missing.join(", ")}`
          : data?.error ||
              data?.detail ||
              "Unable to submit your application."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="vendor-portal-page">
        Loading profile...
      </div>
    );
  }

  const fields = [
    ["company_name", "Company name", true],
    ["abrv_name", "Abbreviation", false],
    ["contact_number", "Contact number", true],
    ["invoice_email", "Invoice email", true],
    ["tax_id", "Tax ID", false],
    ["address", "Address", true],
    ["city", "City", true],
    ["state", "State", true],
    ["zip_code", "ZIP / Postal code", true],
    ["country", "Country", true],
  ];

  return (
    <div className="vendor-portal-page">
      <div className="vendor-dashboard-card">
        <h1>Vendor Company Profile</h1>

        <p className="vendor-portal-subtitle">
          {isRejected
            ? "Review the administrator's feedback, update your company details, and resubmit your application."
            : submitted
              ? "View the company details you submitted with your application."
              : "Complete your company details before submitting your application."}
        </p>

        {/* Rejection notice */}
        {isRejected && (
          <div className="vendor-rejection-notice">
            <div className="vendor-rejection-heading">
              <AlertCircle size={22} />
              <h2>Application requires changes</h2>
            </div>

            <p>
              Your application was rejected by the administrator.
              Please review the feedback, update your details, and
              resubmit your application.
            </p>

            <div className="vendor-rejection-note">
              <strong>Administrator's note</strong>
              <p>
                {adminNote || "No rejection note was provided."}
              </p>
            </div>
          </div>
        )}

        {/* Submitted application status */}
        {submitted && !isRejected && (
          <div className="vendor-profile-submitted">
            <div className="vendor-profile-success-icon">
              {isApproved ? (
                <CheckCircle2 size={34} />
              ) : (
                <Clock3 size={34} />
              )}
            </div>

            <span className="vendor-profile-eyebrow">
              {isApproved
                ? "APPLICATION APPROVED"
                : "APPLICATION SUBMITTED"}
            </span>

            <h2>
              {isApproved
                ? "Your company profile is approved"
                : "Your company profile is under review"}
            </h2>

            <p>
              {isApproved
                ? "Your vendor application has been approved. Your submitted company details are available below."
                : "Your application has been received. You can view your submitted company details below while the administrator reviews them."}
            </p>

            <div className="vendor-submission-status">
              {isApproved ? (
                <CheckCircle2 size={20} />
              ) : (
                <Clock3 size={20} />
              )}

              <div>
                <strong>
                  {isApproved
                    ? "Approved"
                    : "Pending admin review"}
                </strong>

                <span>
                  {isApproved
                    ? "Your application has been approved."
                    : "Your submitted profile is read-only during review."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Profile form: editable for drafts/rejections, read-only otherwise */}
        <form onSubmit={handleSave}>
          <div className="vendor-profile-grid">
            {fields.map(([name, label, required]) => (
              <div className="vendor-profile-field" key={name}>
                <label htmlFor={name}>{label}</label>

                {name === "address" ? (
                  <textarea
                    id={name}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    readOnly={isReadOnly}
                    rows={3}
                  />
                ) : (
                  <input
                    id={name}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    readOnly={isReadOnly}
                    type={
                      name === "invoice_email" ? "email" : "text"
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="vendor-profile-field">
            <label htmlFor="invoicing_method">
              Invoicing method
            </label>

            <select
              id="invoicing_method"
              name="invoicing_method"
              value={form.invoicing_method}
              onChange={handleChange}
              required
              disabled={isReadOnly}
            >
              <option value="">Select method</option>
              <option value="monthly_basis">
                Monthly Basis
              </option>
              <option value="project_basis">
                Project Basis
              </option>
            </select>
          </div>

          <div className="vendor-profile-field">
            <label htmlFor="payment_terms">Payment terms</label>

            <select
              id="payment_terms"
              name="payment_terms"
              value={form.payment_terms}
              onChange={handleChange}
              required
              disabled={isReadOnly}
            >
              <option value="">Select payment terms</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="45">45 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>

          {/* Draft and rejected applications can be edited */}
          {!isReadOnly && (
            <div className="vendor-profile-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
              >
                {saving
                  ? "Processing..."
                  : isRejected
                    ? "Resubmit for Approval"
                    : "Submit for Approval"}
              </button>
            </div>
          )}

          {/* Submitted applications can still be viewed */}
          {isReadOnly && (
            <div className="vendor-profile-submitted-actions">
              <button
                type="button"
                onClick={() => navigate("/vendor/dashboard")}
              >
                Go to Dashboard
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default VendorProfile;
