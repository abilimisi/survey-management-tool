
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { getVendorPortalProfile } from "../../api/vendorPortalApi";
import VendorSidebar from "./VendorSidebar";
import {
  Building2,
  Globe,
  FileText,
  MapPin,
  Phone,
  CreditCard,
  Link as LinkIcon,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  Info,
  Home,
} from "lucide-react";
import "./CompanyProfileView.css";

const emptyProfile = {
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
  available_industries: [],
  available_respondent_types: [],
  status: "draft",
  admin_note: "",
};

const statusLabels = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
};

function Detail({ label, value }) {
  return (
    <div className="cp-detail">
      <span className="cp-detail-label">{label}</span>
      <span className="cp-detail-value">{value || "Not provided"}</span>
    </div>
  );
}

function Section({ icon: Icon, number, title, description, children }) {
  return (
    <section className="cp-section">
      <div className="cp-section-heading">
        <div className="cp-section-icon">
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="cp-section-title-wrap">
          <h2>
            <span className="cp-section-number">{number}.</span> {title}
          </h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="cp-section-content">{children}</div>
    </section>
  );
}

function CompanyProfileView() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useOutletContext();

  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = localStorage.getItem("vendor_portal_access_token");

      if (!token) {
        navigate("/vendor/login", { replace: true });
        return;
      }

      try {
        const response = await getVendorPortalProfile();
        const data = response.data || response;

        if (!cancelled) {
          setProfile({
            ...emptyProfile,
            ...data,
          });
        }
      } catch (error) {
        if (cancelled) return;

        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("vendor_portal_access_token");
          navigate("/vendor/login", { replace: true });
          return;
        }

        toast.error(
          error.response?.data?.detail ||
            "Unable to load your company profile."
        );
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

  const status = String(profile.status || "draft").toLowerCase();

  const selectedIndustries = (profile.available_industries || [])
    .filter((item) =>
      (profile.industries || []).map(Number).includes(Number(item.id))
    )
    .map((item) => item.name);

  const selectedRespondentTypes = (
    profile.available_respondent_types || []
  )
    .filter((item) =>
      (profile.respondent_types || []).map(Number).includes(Number(item.id))
    )
    .map((item) => item.name);

  const companyWebsite = profile.company_website
    ? profile.company_website.replace(/^https?:\/\//, "")
    : "";

  const invoicingMethod =
    profile.invoicing_method === "monthly_basis"
      ? "Monthly Basis"
      : profile.invoicing_method === "project_basis"
        ? "Project Basis"
        : profile.invoicing_method;

  if (loading) {
    return (
      <div className="vendor-dashboard-layout cp-layout">
        <VendorSidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isApproved={status === "approved"}
          unreadMessagesCount={0}
        />

        <main className="vendor-dashboard-main cp-main">
          <div className="cp-loading">Loading company profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-layout cp-layout">
      <VendorSidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isApproved={status === "approved"}
        unreadMessagesCount={0}
      />

      <main className="vendor-dashboard-main cp-main">
        <div className="cp-page">

          {/* <div className="cp-breadcrumb">
            <span><Home size={14} /> Vendor Portal</span>
            <span className="cp-breadcrumb-divider">/</span>
            <strong>Company Profile</strong>
          </div> */}

          <header className="cp-page-header">
            <div>
              <h1>Company Profile</h1>
            </div>
          </header>

          {/* Company identity */}
          <section className="cp-company-header">
            <div className="cp-company-avatar">
              <Building2 size={30} />
            </div>

            <div className="cp-company-heading">
              <span className="cp-company-label">REGISTERED COMPANY</span>
              <h2>
                {profile.company_name || "Company Name Not Provided"}
              </h2>

              <div className="cp-company-meta">
                <span>{profile.abrv_name || "Vendor company"}</span>

                {companyWebsite && (
                  <>
                    <span className="cp-header-separator">|</span>
                    <a
                      href={
                        /^https?:\/\//i.test(profile.company_website)
                          ? profile.company_website
                          : `https://${profile.company_website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe size={14} />
                      {companyWebsite}
                    </a>
                  </>
                )}

                {profile.registration_number && (
                  <>
                    <span className="cp-header-separator">|</span>
                    <span>Reg. No: {profile.registration_number}</span>
                  </>
                )}
              </div>
            </div>

            <div className="cp-company-status">
              <span className="cp-company-status-label">PROFILE STATUS</span>

              <span className={`cp-status cp-status-${status}`}>
                {status === "approved" && <CheckCircle2 size={16} />}
                {statusLabels[status] || status.replaceAll("_", " ")}
              </span>

              <small>
                {status === "approved"
                  ? "Your profile has been verified."
                  : status === "changes_requested"
                    ? "Changes have been requested."
                    : status === "rejected"
                      ? "Your profile was not approved."
                      : status === "submitted" || status === "under_review"
                        ? "Your profile is being reviewed."
                        : "Your profile is in draft."}
              </small>
            </div>
          </section>

          {/* Administrator feedback */}
          {profile.admin_note && (
            <div className="cp-admin-note">
              <Info size={19} />
              <div>
                <strong>Administrator Note</strong>
                <p>{profile.admin_note}</p>
              </div>
            </div>
          )}

          {/* Company record sections */}
          <div className="cp-content-grid">

            <Section
              number="01"
              icon={Building2}
              title="Company Information"
              description="Business identity and registration details"
            >
              <div className="cp-details-grid">
                <Detail label="Company Name" value={profile.company_name} />
                <Detail label="Abbreviation" value={profile.abrv_name} />
                <Detail label="Registration Number" value={profile.registration_number} />
                <Detail label="Company Website" value={profile.company_website} />
              </div>
            </Section>

            <Section
              number="02"
              icon={Phone}
              title="Contact Information"
              description="Primary business and billing contacts"
            >
              <div className="cp-details-grid">
                <Detail label="Contact Number" value={profile.contact_number} />
                <Detail label="Invoice Email" value={profile.invoice_email} />
              </div>
            </Section>

            <Section
              number="03"
              icon={MapPin}
              title="Registered Address & Tax Details"
              description="Official business address and tax identification"
            >
              <div className="cp-details-grid">
                <Detail label="Street Address" value={profile.address} />
                <Detail label="City" value={profile.city} />
                <Detail label="State / Province" value={profile.state} />
                <Detail label="Postal / ZIP Code" value={profile.zip_code} />
                <Detail label="Country" value={profile.country} />
                <Detail label="Tax Identification Number" value={profile.tax_id} />
              </div>
            </Section>

            <Section
              number="04"
              icon={CreditCard}
              title="Billing & Payment Details"
              description="Invoicing preferences and agreed payment terms"
            >
              <div className="cp-details-grid">
                <Detail label="Invoicing Method" value={invoicingMethod} />
                <Detail
                  label="Payment Terms"
                  value={
                    profile.payment_terms
                      ? `${profile.payment_terms} Days`
                      : ""
                  }
                />
              </div>
            </Section>

            <Section
              number="05"
              icon={LinkIcon}
              title="Survey Redirect Configuration"
              description="Registered survey completion and exit destinations"
            >
              <div className="cp-details-grid">
                <Detail label="Complete Link" value={profile.complete_link} />
                <Detail label="Disqualify Link" value={profile.terminate_link} />
                <Detail label="Quota Full Link" value={profile.quota_full_link} />
                <Detail
                  label="Security Termination Link"
                  value={profile.security_terminate_link}
                />
              </div>
            </Section>

            <Section
              number="06"
              icon={BriefcaseBusiness}
              title="Business Capabilities"
              description="Registered industries and respondent coverage"
            >
              <div className="cp-capabilities-grid">

                <div className="cp-capability-group">
                  <h3><BriefcaseBusiness size={15} /> Industries</h3>

                  {selectedIndustries.length > 0 ? (
                    <div className="cp-tag-list">
                      {selectedIndustries.map((name) => (
                        <span className="cp-tag" key={name}>{name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="cp-empty">No industries selected.</p>
                  )}
                </div>

                <div className="cp-capability-group">
                  <h3><Users size={15} /> Respondent Types</h3>

                  {selectedRespondentTypes.length > 0 ? (
                    <div className="cp-tag-list">
                      {selectedRespondentTypes.map((name) => (
                        <span className="cp-tag" key={name}>{name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="cp-empty">No respondent types selected.</p>
                  )}
                </div>

              </div>
            </Section>

          </div>

          <footer className="cp-page-footer">
            <FileText size={14} />
            <span>
              This record displays the company information submitted
              through your vendor registration.
            </span>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default CompanyProfileView;
