
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getVendorPortalProfile,
  saveVendorPortalProfile,
  submitVendorApplication,
} from "../../api/vendorPortalApi";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Save,
  Send,
  Building2,
  MapPin,
  CreditCard,
  Link as LinkIcon,
  BriefcaseBusiness,
  Megaphone,
  Trophy,
  Sparkles,
} from "lucide-react";
import "./VendorProfile.css";
import VendorSidebar from "./VendorSidebar";

const initialForm = {
  company_name: "",
  abrv_name: "",
  company_website: "",
  registration_number: "",
  contact_number: "",
  invoice_email: "",
  tax_id: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  invoicing_method: "",
  payment_terms: "",
  complete_link: "",
  terminate_link: "",
  quota_full_link: "",
  security_terminate_link: "",
  industries: [],
  respondent_types: [],
};

const editableStatuses = ["draft", "changes_requested"];

function VendorProfile() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useOutletContext();

  const [form, setForm] = useState(initialForm);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [availableRespondentTypes, setAvailableRespondentTypes] = useState(
    []
  );
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isReadOnly = !editableStatuses.includes(applicationStatus);
  const isChangesRequested = applicationStatus === "changes_requested";
  const isRejected = applicationStatus === "rejected";
  const isApproved = applicationStatus === "approved";
  const isUnderReview = applicationStatus === "under_review";

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("vendor_portal_access_token");

      if (!token) {
        navigate("/vendor/login");
        return;
      }

      try {
        const response = await getVendorPortalProfile();
        const data = response.data || response;

        setForm({
          ...initialForm,
          ...Object.fromEntries(
            Object.keys(initialForm).map((key) => [
              key,
              data[key] ?? initialForm[key],
            ])
          ),
          industries: (data.industries || []).map(Number),
          respondent_types: (data.respondent_types || []).map(Number),
        });

        setAvailableIndustries(data.available_industries || []);
        setAvailableRespondentTypes(
          data.available_respondent_types || []
        );

        setApplicationStatus(data.status || "draft");
        setAdminNote(data.admin_note || "");
      } catch (error) {
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("vendor_portal_access_token");
          navigate("/vendor/login");
          return;
        }

        toast.error(
          error.response?.data?.detail ||
            "Unable to load your company profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, id) => {
    setForm((previous) => {
      const currentValues = previous[name];
      const numericId = Number(id);

      const updatedValues = currentValues.includes(numericId)
        ? currentValues.filter((value) => value !== numericId)
        : [...currentValues, numericId];

      return {
        ...previous,
        [name]: updatedValues,
      };
    });
  };

  const handleSave = async () => {
    if (isReadOnly || saving || submitting) return;

    setSaving(true);

    try {
      const response = await saveVendorPortalProfile(form);
      const data = response.data || response;

      if (data && typeof data === "object") {
        setForm((previous) => ({
          ...previous,
          ...data,
          industries: (data.industries ?? previous.industries).map(Number),
          respondent_types: (
            data.respondent_types ?? previous.respondent_types
          ).map(Number),
        }));
      }

      toast.success("Company profile saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to save your company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isReadOnly || saving || submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit your company profile for review?"
    );

    if (!confirmed) return;

    setSubmitting(true);

    try {
      await saveVendorPortalProfile(form);
      const response = await submitVendorApplication();
      const data = response.data || response;

      setApplicationStatus(data.status || "submitted");
      setAdminNote(data.admin_note || "");

      toast.success("Your company profile has been submitted for review.");
      navigate("/vendor/dashboard");
    } catch (error) {
      const errorData = error.response?.data;
      const message =
        errorData?.detail ||
        errorData?.message ||
        (errorData?.missing_fields
          ? `Missing fields: ${errorData.missing_fields.join(", ")}`
          : "Unable to submit your application. Please check your details.");

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
  }) => (
    <div className="vp-field" key={name}>
      <label htmlFor={name}>
        {label}
        {required && <span className="vp-required"> *</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={isReadOnly}
      />
    </div>
  );

  const renderSelect = ({ label, name, options }) => (
    <div className="vp-field" key={name}>
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={isReadOnly}
      >
        <option value="">Select {label.toLowerCase()}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckboxGroup = ({ label, name, options, helperText }) => (
    <div className="vp-field vp-field-full" key={name}>
      <div className="vp-checkbox-heading">
        <label>{label}</label>
        <span>{form[name].length} selected</span>
      </div>

      {helperText && (
        <small className="vp-field-help">{helperText}</small>
      )}

      {options.length === 0 ? (
        <p className="vp-empty-options">
          No options available at the moment.
        </p>
      ) : (
        <div className="vp-checkbox-grid">
          {options.map((option) => {
            const selected = form[name].includes(Number(option.id));

            return (
              <label
                key={option.id}
                className={`vp-checkbox-card ${
                  selected ? "selected" : ""
                } ${isReadOnly ? "disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    handleCheckboxChange(name, option.id)
                  }
                  disabled={isReadOnly}
                />

                <span className="vp-custom-checkbox">
                  {selected && <CheckCircle2 size={15} />}
                </span>

                <span className="vp-checkbox-label">
                  {option.name}
                  {option.industry_name && (
                    <small>{option.industry_name}</small>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="vendor-dashboard-layout vendor-profile-layout">
        <VendorSidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isApproved={false}
          unreadMessagesCount={0}
        />
        <main className="vendor-dashboard-main vendor-profile-main">
          <div className="vp-page">
            <div className="vp-loading">
              <div className="vp-spinner" />
              <p>Loading company profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-layout vendor-profile-layout">
      <VendorSidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isApproved={isApproved}
        unreadMessagesCount={0}
      />
      <main className="vendor-dashboard-main vendor-profile-main">
        <div className="vp-page">
      <div className="vp-container">
        <div className="vp-header">
          <div>
            <h1>Company Profile</h1>
          </div>

          <button
            type="button"
            className="vp-back-dashboard"
            onClick={() => navigate("/vendor/dashboard")}
          >
            <span className="vp-back-arrow">←</span>
            Back to Dashboard
          </button>
        </div>

              
        <div className={`vp-status-banner vp-status-${applicationStatus}`}>
          <div className="vp-status-icon">
            {isApproved ? (
              <Megaphone size={23} />
            ) : isUnderReview ? (
              <Clock3 size={22} />
            ) : isRejected || isChangesRequested ? (
              <AlertCircle size={22} />
            ) : (
              <FileText size={22} />
            )}
          </div>

          <div className="vp-status-content">
            <strong>
              {isApproved
                ? "Great! Your vendor application has been approved."
                : isUnderReview
                  ? "Your application is under review."
                  : isChangesRequested
                    ? "Changes are requested on your application."
                    : isRejected
                      ? "Your vendor application was rejected."
                      : "Your company profile is not yet submitted."}
            </strong>

            <p>
              {isApproved
                ? "You can now participate in projects and grow with PanelSphere."
                : isUnderReview
                  ? "Your application has been submitted and is being reviewed by our admin team."
                  : isChangesRequested
                    ? "Please review the administrator's feedback and update your company details."
                    : isRejected
                      ? "Please contact the administrator if you need clarification."
                      : "Complete your company details and submit your profile for approval."}
            </p>
          </div>

          {isApproved && (
            <div className="vp-status-decoration" aria-hidden="true">
              <Sparkles className="vp-status-sparkle" size={25} />
              <div className="vp-status-trophy">
                <Trophy size={55} strokeWidth={1.8} />
              </div>
              <Sparkles className="vp-status-sparkle vp-status-sparkle-small" size={19} />
            </div>
          )}
        </div>


        {(isChangesRequested || isRejected) && adminNote && (
          <div className="vp-admin-note">
            <div className="vp-admin-note-heading">
              <AlertCircle size={18} />
              <strong>Admin feedback</strong>
            </div>
            <p>{adminNote}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <Building2 size={20} />
              </div>
              <div>
                <h2>Company Information</h2>
                <p>Basic details about your business.</p>
              </div>
            </div>

            <div className="vp-form-grid">
              {renderInput({
                label: "Company Name",
                name: "company_name",
                required: true,
                placeholder: "Enter registered company name",
              })}

              {renderInput({
                label: "Abbreviation",
                name: "abrv_name",
                placeholder: "Short company name",
              })}

              {renderInput({
                label: "Company Website",
                name: "company_website",
                type: "url",
                placeholder: "https://example.com",
              })}

              {renderInput({
                label: "Registration Number",
                name: "registration_number",
                placeholder: "Company registration number",
              })}
            </div>
          </section>

          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <FileText size={20} />
              </div>
              <div>
                <h2>Contact Information</h2>
                <p>Contact details for business communication.</p>
              </div>
            </div>

            <div className="vp-form-grid">
              {renderInput({
                label: "Contact Number",
                name: "contact_number",
                type: "tel",
                required: true,
                placeholder: "Enter contact number",
              })}

              {renderInput({
                label: "Invoice Email",
                name: "invoice_email",
                type: "email",
                placeholder: "billing@example.com",
              })}
            </div>
          </section>

          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h2>Business Address & Tax</h2>
                <p>Registered business address and tax details.</p>
              </div>
            </div>

            <div className="vp-form-grid">
              <div className="vp-field vp-field-full">
                <label htmlFor="address">
                  Business Address<span className="vp-required"> *</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your registered business address"
                  required
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>

              {renderInput({
                label: "City",
                name: "city",
                required: true,
                placeholder: "Enter city",
              })}

              {renderInput({
                label: "State / Province",
                name: "state",
                placeholder: "Enter state or province",
              })}

              {renderInput({
                label: "Postal / ZIP Code",
                name: "zip_code",
                required: true,
                placeholder: "Enter postal code",
              })}

              {renderInput({
                label: "Country",
                name: "country",
                required: true,
                placeholder: "Enter country",
              })}

              {renderInput({
                label: "Tax ID",
                name: "tax_id",
                placeholder: "Enter tax identification number",
              })}
            </div>
          </section>

          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <CreditCard size={20} />
              </div>
              <div>
                <h2>Billing Preferences</h2>
                <p>Let us know your preferred invoicing arrangements.</p>
              </div>
            </div>

            <div className="vp-form-grid">
              {renderSelect({
                label: "Invoicing Method",
                name: "invoicing_method",
                options: [
                  { value: "monthly_basis", label: "Monthly Basis" },
                  { value: "project_basis", label: "Project Basis" },
                ],
              })}

              {renderSelect({
                label: "Payment Terms",
                name: "payment_terms",
                options: [
                  { value: "15", label: "15 Days" },
                  { value: "30", label: "30 Days" },
                  { value: "45", label: "45 Days" },
                  { value: "60", label: "60 Days" },
                ],
              })}
            </div>
          </section>

          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <LinkIcon size={20} />
              </div>
              <div>
                <h2>Respondent Redirect Links</h2>
                <p>
                  Provide the links used to redirect respondents after
                  completing or exiting a survey.
                </p>
              </div>
            </div>

            <div className="vp-form-grid">
              {renderInput({
                label: "Complete Link",
                name: "complete_link",
                type: "url",
                placeholder: "https://example.com/complete",
              })}

              {renderInput({
                label: "Disqualify Link",
                name: "terminate_link",
                type: "url",
                placeholder: "https://example.com/disqualify",
              })}

              {renderInput({
                label: "Quota Full Link",
                name: "quota_full_link",
                type: "url",
                placeholder: "https://example.com/quota-full",
              })}

              {renderInput({
                label: "Security Term Link",
                name: "security_terminate_link",
                type: "url",
                placeholder: "https://example.com/security-terminate",
              })}
            </div>
          </section>

          <section className="vp-section">
            <div className="vp-section-heading">
              <div className="vp-section-icon">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <h2>Industries & Respondent Capabilities</h2>
                <p>
                  Select the industries you serve and the respondent types
                  available through your company.
                </p>
              </div>
            </div>

            <div className="vp-form-grid">
              {renderCheckboxGroup({
                label: "Industries",
                name: "industries",
                options: availableIndustries,
                helperText: "Select all industries your company can support.",
              })}

              {renderCheckboxGroup({
                label: "Respondent Types",
                name: "respondent_types",
                options: availableRespondentTypes,
                helperText: "Select all respondent types your company can provide.",
              })}
            </div>
          </section>

          <div className="vp-form-actions">
            {isReadOnly ? (
                  <button
                    type="button"
                    className="vp-back-dashboard"
                    onClick={() => navigate("/vendor/dashboard")}
                  >
                    <span className="vp-back-arrow">←</span>
                    Back to Dashboard
                  </button>
            ) : (
              <>
                <button
                  type="button"
                  className="vp-secondary-button"
                  onClick={handleSave}
                  disabled={saving || submitting}
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="submit"
                  className="vp-primary-button"
                  disabled={saving || submitting}
                >
                  <Send size={17} />
                  {submitting
                    ? "Submitting..."
                    : isChangesRequested
                      ? "Resubmit Application"
                      : "Submit for Review"}
                </button>
              </>
            )}
          </div>
        </form>
        </div>
        </div>
      </main>
    </div>
  );
}

export default VendorProfile;
