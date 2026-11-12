
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Building2,
  BriefcaseBusiness,
  Users,
  Home,
  Pencil,
} from "lucide-react";

import {
  getClientProfile,
  updateClientCompanyProfile,
} from "../../api/clientPortalApi";

import "./ClientCompanyProfile.css";

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "business", label: "Business Details", icon: BriefcaseBusiness },
  { id: "contacts", label: "Primary Contact", icon: Users },
];

function DetailRow({ label, value }) {
  return (
    <div className="company-detail-row">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

export default function ClientCompanyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    website: "",
    description: "",
    business_email: "",
    business_phone: "",
    contact_name: "",
    contact_designation: "",
    country: "",
    business_address: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const response = await getClientProfile();

        if (mounted) {
          setProfile(response.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("client_portal_access_token");
          localStorage.removeItem("client_portal_user");

          navigate("/client-portal/login", { replace: true });
        } else {
          toast.error("Unable to load company profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const company = useMemo(
    () => profile?.companies?.[0] || null,
    [profile]
  );

  const companyName = company?.name || "Company Profile";
  const companyInitial = companyName.charAt(0).toUpperCase();

  const requiredFields = [
    "name",
    "industry",
    "business_email",
    "business_phone",
    "contact_name",
    "country",
    "business_address",
  ];

  const completedFields = requiredFields.filter((field) =>
    String(company?.[field] || "").trim()
  ).length;

  const profileCompletion = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  const openEditModal = () => {
    setForm({
      name: company?.name || "",
      industry: company?.industry || "",
      website: company?.website || "",
      description: company?.description || "",
      business_email: company?.business_email || "",
      business_phone: company?.business_phone || "",
      contact_name: company?.contact_name || "",
      contact_designation: company?.contact_designation || "",
      country: company?.country || "",
      business_address: company?.business_address || "",
    });

    setShowEditModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (saving || !company?.id) return;

    setSaving(true);

    try {
      const response = await updateClientCompanyProfile(
        company.id,
        form
      );

      const updatedCompany = response.data.company;

      setProfile((previous) => ({
        ...previous,
        companies: (previous?.companies || []).map((item) =>
          item.id === updatedCompany.id ? updatedCompany : item
        ),
      }));

      setShowEditModal(false);
      toast.success("Company profile updated successfully.");
    } catch (error) {
      const errors = error.response?.data;

      if (errors && typeof errors === "object") {
        const messages = Object.values(errors).flat();

        if (messages.length > 0) {
          messages.forEach((message) => {
            if (typeof message === "string") {
              toast.error(message);
            }
          });
        } else {
          toast.error("Unable to update company profile.");
        }
      } else {
        toast.error("Unable to update company profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="company-profile-loading">
        Loading company profile...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-profile-page">
        <div className="company-profile-empty">
          <Building2 size={32} />
          <h2>No company associated with this account</h2>
          <p>
            Please contact your portal administrator if you believe
            this is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-profile-page">

      <div className="company-profile-heading">
        <h1>Company Profile</h1>
        <p>View and manage your company information</p>
      </div>

      {/* Company Identity */}
      <section className="company-identity-card">
        <div className="company-identity-logo">
          {companyInitial}
        </div>

        <div className="company-identity-copy">
          <h2>{companyName}</h2>
          <p>Company information and account details</p>
        </div>

        <div className="company-active-status">
          <span />
          {company.is_active ? "Active" : "Inactive"}
        </div>

        {company.role === "owner" && (
          <button
            type="button"
            className="company-edit-button"
            onClick={openEditModal}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </section>

      {/* Profile Completion */}
      <section className="company-completion-card">
        <div className="company-completion-heading">
          <div>
            <h3>Profile Completion</h3>
            <p>
              Complete your company information to keep your profile
              up to date.
            </p>
          </div>

          <strong>{profileCompletion}%</strong>
        </div>

        <div className="company-completion-track">
          <div
            className="company-completion-fill"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        <span>
          {completedFields} of {requiredFields.length} required fields
          completed
        </span>
      </section>

      {/* Profile Navigation */}
      <nav className="company-profile-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "company-profile-tab active"
                  : "company-profile-tab"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="company-profile-grid">
          <section className="company-profile-card">
            <div className="company-card-heading">
              <span className="company-card-icon">
                <Building2 size={21} />
              </span>
              <h2>Company Information</h2>
            </div>

            <div className="company-detail-list">
              <DetailRow
                label="Company Name"
                value={company.name}
              />
              <DetailRow
                label="Company ID"
                value={company.id}
              />
              <DetailRow
                label="Industry"
                value={company.industry}
              />
              <DetailRow
                label="Website"
                value={company.website}
              />
              <DetailRow
                label="About Company"
                value={company.description}
              />
            </div>
          </section>

          <section className="company-profile-card">
            <div className="company-card-heading">
              <span className="company-card-icon">
                <Users size={21} />
              </span>
              <h2>Primary Contact</h2>
            </div>

            <div className="company-detail-list">
              <DetailRow
                label="Contact Name"
                value={company.contact_name}
              />
              <DetailRow
                label="Designation"
                value={company.contact_designation}
              />
              <DetailRow
                label="Business Email"
                value={company.business_email}
              />
              <DetailRow
                label="Phone"
                value={company.business_phone}
              />
            </div>
          </section>

          <section className="company-profile-card">
            <div className="company-card-heading">
              <span className="company-card-icon">
                <Home size={21} />
              </span>
              <h2>Business Address</h2>
            </div>

            <div className="company-detail-list">
              <DetailRow
                label="Country"
                value={company.country}
              />
              <DetailRow
                label="Registered Address"
                value={company.business_address}
              />
            </div>
          </section>
        </div>
      )}

      {/* Business Details */}
      {activeTab === "business" && (
        <section className="company-profile-card company-tab-panel">
          <div className="company-card-heading">
            <span className="company-card-icon">
              <BriefcaseBusiness size={21} />
            </span>
            <h2>Business Details</h2>
          </div>

          <div className="company-detail-list">
            <DetailRow
              label="Company Name"
              value={company.name}
            />
            <DetailRow
              label="Company ID"
              value={company.id}
            />
            <DetailRow
              label="Account Role"
              value={company.role}
            />
            <DetailRow
              label="Industry"
              value={company.industry}
            />
            <DetailRow
              label="Website"
              value={company.website}
            />
            <DetailRow
              label="Country"
              value={company.country}
            />
            <DetailRow
              label="Business Email"
              value={company.business_email}
            />
            <DetailRow
              label="Business Phone"
              value={company.business_phone}
            />
            <DetailRow
              label="Registered Address"
              value={company.business_address}
            />
          </div>
        </section>
      )}

      {/* Primary Contact */}
      {activeTab === "contacts" && (
        <section className="company-profile-card company-tab-panel">
          <div className="company-card-heading">
            <span className="company-card-icon">
              <Users size={21} />
            </span>
            <h2>Primary Contact</h2>
          </div>

          <div className="company-detail-list">
            <DetailRow
              label="Contact Name"
              value={company.contact_name}
            />
            <DetailRow
              label="Designation"
              value={company.contact_designation}
            />
            <DetailRow
              label="Business Email"
              value={company.business_email}
            />
            <DetailRow
              label="Business Phone"
              value={company.business_phone}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="company-profile-footer">
        <div>
          <Building2 size={22} />
          <span>
            <strong>Company Profile</strong>
            <small>Client Portal</small>
          </span>
        </div>

        <span>{companyName}</span>
      </footer>

      {/* Edit Company Profile Modal */}
      {showEditModal && (
        <div
          className="company-edit-overlay"
          onClick={() => !saving && setShowEditModal(false)}
        >
          <div
            className="company-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="company-edit-header">
              <div>
                <h2 id="company-edit-title">
                  Edit Company Profile
                </h2>
                <p>Update your organization's information.</p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit profile"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="company-edit-body">
                <h3>Company Information</h3>

                <div className="company-edit-form-grid">
                  <label>
                    Legal Company Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      required
                      maxLength={255}
                    />
                  </label>

                  <label>
                    Industry *
                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleFormChange}
                      required
                      maxLength={120}
                      placeholder="e.g. Healthcare"
                    />
                  </label>

                  <label className="full-width">
                    Company Website
                    <input
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={handleFormChange}
                      placeholder="https://example.com"
                    />
                  </label>

                  <label className="full-width">
                    About the Company
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      rows={3}
                      maxLength={1000}
                      placeholder="Brief introduction to your company"
                    />
                  </label>
                </div>

                <div className="company-edit-divider" />

                <h3>Primary Contact</h3>

                <div className="company-edit-form-grid">
                  <label>
                    Contact Name *
                    <input
                      name="contact_name"
                      value={form.contact_name}
                      onChange={handleFormChange}
                      required
                      maxLength={150}
                    />
                  </label>

                  <label>
                    Designation
                    <input
                      name="contact_designation"
                      value={form.contact_designation}
                      onChange={handleFormChange}
                      maxLength={120}
                    />
                  </label>

                  <label>
                    Business Email *
                    <input
                      name="business_email"
                      type="email"
                      value={form.business_email}
                      onChange={handleFormChange}
                      required
                    />
                  </label>

                  <label>
                    Business Phone *
                    <input
                      name="business_phone"
                      type="tel"
                      value={form.business_phone}
                      onChange={handleFormChange}
                      required
                      maxLength={25}
                    />
                  </label>
                </div>

                <div className="company-edit-divider" />

                <h3>Business Address</h3>

                <div className="company-edit-form-grid">
                  <label>
                    Country *
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleFormChange}
                      required
                      maxLength={100}
                    />
                  </label>

                  <label className="full-width">
                    Registered Address *
                    <textarea
                      name="business_address"
                      value={form.business_address}
                      onChange={handleFormChange}
                      required
                      rows={3}
                    />
                  </label>
                </div>
              </div>

              <div className="company-edit-footer">
                <button
                  type="button"
                  className="company-cancel-button"
                  disabled={saving}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="company-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
