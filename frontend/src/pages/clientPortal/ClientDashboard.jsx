import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getClientProfile,
  getClientStudies,
  createClientStudy,
  updateClientStudy,
  submitClientStudy,
} from "../../api/clientPortalApi";

import ClientPortalRoute from "./ClientPortalRoute";
import "./ClientDashboard.css";

const initialForm = {
  company_id: "",
  name: "",
  study_type: "online_survey",
  country: "",
  language: "English",
  survey_link: "",
  target_completes: 200,
  survey_length: 10,
  incidence_rate: 50,
  description: "",

  // Sample requirements
  min_age: "",
  max_age: "",
  gender: "all",
  industry: "",
  profession: "",
  additional_criteria: "",

  quotas: [],
};

const quotaAttributes = [
  { value: "gender", label: "Gender" },
  { value: "age", label: "Age" },
  { value: "country", label: "Country" },
  { value: "region", label: "Region" },
  { value: "industry", label: "Industry" },
  { value: "other", label: "Other" },
];

function statusLabel(status) {
  return (status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ClientDashboardContent() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingStudyId, setEditingStudyId] = useState(null);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");  
  
const loadDashboard = useCallback(async () => {
  setLoading(true);

  try {
    const [profileResponse, studiesResponse] = await Promise.all([
      getClientProfile(),
      getClientStudies(),
    ]);

    const profileData = profileResponse.data;
    const companyList = profileData.companies || [];

    setProfile(profileData);

    setStudies(
      Array.isArray(studiesResponse.data)
        ? studiesResponse.data
        : studiesResponse.data.results || []
    );

    setForm((current) => ({
      ...current,
      company_id:
        current.company_id || String(companyList[0]?.id || ""),
    }));
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("client_portal_access_token");
      localStorage.removeItem("client_portal_user");

      toast.error(
        "Your client session is invalid or expired. Please log in again."
      );

      navigate("/client-portal/login", { replace: true });
    } else {
      toast.error("Unable to load your dashboard. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("client_portal_access_token");
    localStorage.removeItem("client_portal_user");
    navigate("/client-portal/login", { replace: true });
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const addQuota = () => {
  setForm((current) => ({
    ...current,
    quotas: [
      ...current.quotas,
      {
        attribute: "gender",
        category: "",
        target_completes: "",
      },
    ],
  }));
};

const updateQuota = (index, field, value) => {
  setForm((current) => ({
    ...current,
    quotas: current.quotas.map((quota, quotaIndex) =>
      quotaIndex === index
        ? { ...quota, [field]: value }
        : quota
    ),
  }));
};

const removeQuota = (index) => {
  setForm((current) => ({
    ...current,
    quotas: current.quotas.filter(
      (_, quotaIndex) => quotaIndex !== index
    ),
  }));
};

  
  const handleCreateStudy = async (event) => {
    event.preventDefault();

    if (!form.company_id) {
        toast.error("Your account does not have an active company.");
        return;
    }

    setSaving(true);

  const payload = {
    ...form,

    company_id: Number(form.company_id),
    target_completes: Number(form.target_completes),
    survey_length: Number(form.survey_length),
    incidence_rate: Number(form.incidence_rate),

    sample_requirement: {
      min_age: form.min_age === "" ? null : Number(form.min_age),
      max_age: form.max_age === "" ? null : Number(form.max_age),
      gender: form.gender,
      industry: form.industry,
      profession: form.profession,
      additional_criteria: form.additional_criteria,
    },

    quotas: form.quotas
      .filter(
        (quota) =>
          quota.category.trim() !== "" &&
          quota.target_completes !== ""
      )
      .map((quota) => ({
        attribute: quota.attribute,
        category: quota.category.trim(),
        target_completes: Number(quota.target_completes),
      })),
  };

  delete payload.min_age;
  delete payload.max_age;
  delete payload.gender;
  delete payload.industry;
  delete payload.profession;
  delete payload.additional_criteria;

    try {
        if (editingStudyId !== null) {
        await updateClientStudy(editingStudyId, payload);
        toast.success("Study updated successfully.");
        } else {
        await createClientStudy(payload);
        toast.success("Study created as a draft.");
        }

        setEditingStudyId(null);
        setShowForm(false);

        setForm({
          ...initialForm,
          company_id: String(profile?.companies?.[0]?.id || ""),
        });

        await loadDashboard();
    } catch (error) {
        const errors = error.response?.data;

        const message =
        errors?.detail ||
        errors?.error ||
        Object.entries(errors || {})
            .map(([field, messages]) =>
            `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
            }`
            )
            .join(" | ") ||
        "Unable to save the study.";

        toast.error(message);
    } finally {
        setSaving(false);
    }
    };


  const handleSubmitStudy = async (studyId) => {
    setSubmittingId(studyId);

    try {
      await submitClientStudy(studyId);
      toast.success("Study submitted for internal review.");
      await loadDashboard();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Unable to submit this study for review."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  
const handleEditStudy = useCallback((study) => {
  if (!["draft", "changes_requested"].includes(study.status)) {
    toast.error("Only draft or returned studies can be edited.");
    return;
  }

  setEditingStudyId(study.id);

  setForm({
    company_id: String(study.company || ""),
    name: study.name || "",
    study_type: study.study_type || "online_survey",
    country: study.country || "",
    language: study.language || "English",
    survey_link: study.survey_link || "",
    target_completes: study.target_completes ?? 200,
    survey_length: study.survey_length ?? 10,
    incidence_rate: study.incidence_rate ?? 50,
    description: study.description || "",

    // Existing sample requirements
    min_age: study.sample_requirement?.min_age ?? "",
    max_age: study.sample_requirement?.max_age ?? "",
    gender: study.sample_requirement?.gender || "all",
    industry: study.sample_requirement?.industry || "",
    profession: study.sample_requirement?.profession || "",
    additional_criteria:
      study.sample_requirement?.additional_criteria || "",

    quotas: (study.quotas || []).map((quota) => ({
      attribute: quota.attribute,
      category: quota.category,
      target_completes: quota.target_completes,
    })),

  });

  setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const editStudyId = location.state?.editStudyId;

    if (!editStudyId || studies.length === 0) {
      return;
    }

  const studyToEdit = studies.find(
    (item) => String(item.id) === String(editStudyId)
  );

  if (!studyToEdit) {
    return;
  }

  handleEditStudy(studyToEdit);

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [
  location.state,
  location.pathname,
  studies,
  handleEditStudy,
  navigate,
]);

  const user = profile?.user || {};
  const companies = profile?.companies || [];

  const dashboardStats = useMemo(() => {
    return {
      total: studies.length,

      inReview: studies.filter((study) =>
        ["submitted", "under_review"].includes(study.status)
      ).length,

      quotationsPending: studies.filter(
        (study) => study.status === "quote_sent"
      ).length,

      projectsCreated: studies.filter(
        (study) => study.status === "project_created"
      ).length,
    };
  }, [studies]);

  const filteredStudies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return studies.filter((study) => {
      const matchesSearch =
        !normalizedSearch ||
        study.name?.toLowerCase().includes(normalizedSearch) ||
        String(study.id).includes(normalizedSearch) ||
        study.country?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || study.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [studies, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="client-dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="client-dashboard-page">
      {/* <header className="client-dashboard-header">
        <div>
          <p className="client-dashboard-eyebrow">CLIENT WORKSPACE</p>
          <h1>Welcome, {user.first_name || user.email || "Client"}</h1>
          <p>Manage your research studies in one place.</p>
        </div>

        <button
          type="button"
          className="client-secondary-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header> */}

      <section className="client-stats-grid">
        <div className="client-stat-card">
          <div className="client-stat-top">
            <span>Total Studies</span>
            <span className="client-stat-icon blue">ST</span>
          </div>
          <strong>{dashboardStats.total}</strong>
          <small>All your research studies</small>
        </div>

        <div className="client-stat-card">
          <div className="client-stat-top">
            <span>In Review</span>
            <span className="client-stat-icon amber">RV</span>
          </div>
          <strong>{dashboardStats.inReview}</strong>
          <small>Awaiting internal review</small>
        </div>

        <div className="client-stat-card">
          <div className="client-stat-top">
            <span>Quotations Pending</span>
            <span className="client-stat-icon purple">QT</span>
          </div>
          <strong>{dashboardStats.quotationsPending}</strong>
          <small>Ready for your response</small>
        </div>

        <div className="client-stat-card">
          <div className="client-stat-top">
            <span>Projects Created</span>
            <span className="client-stat-icon green">PR</span>
          </div>
          <strong>{dashboardStats.projectsCreated}</strong>
          <small>Converted into Projects</small>
        </div>
      </section>

      <section className="client-company-section">
        <div>
          <h2>Your companies</h2>
          <p>Companies associated with your portal account.</p>
        </div>

        {companies.length === 0 ? (
          <p>No active company is associated with your account.</p>
        ) : (
          <div className="client-company-list">
            {companies.map((company) => (
              <div className="client-company-card" key={company.id}>
                <div className="client-company-icon">C</div>
                <div>
                  <h3>{company.name}</h3>
                  <p>{statusLabel(company.role)} · Company ID {company.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="client-studies-section">
        <div className="client-section-heading">
          <div>
            <h2>Your studies</h2>
            <p>Create a study and submit it when it's ready for review.</p>
          </div>

          <button
            type="button"
            className="client-primary-button"
            onClick={() => {
                if (showForm) {
                setEditingStudyId(null);
                setShowForm(false);
                setForm({
                    ...initialForm,
                    company_id: String(profile?.companies?.[0]?.id || ""),
                });
                } else {
                setEditingStudyId(null);
                setForm({
                    ...initialForm,
                    company_id: String(profile?.companies?.[0]?.id || ""),
                });
                setShowForm(true);
                }
            }}
            disabled={companies.length === 0}
            >
            {showForm ? "Cancel" : "+ Create study"}
          </button>
        </div>

        {showForm && (
          <form className="client-study-form" onSubmit={handleCreateStudy}>
            <h3>{editingStudyId !== null ? "Edit study" : "New study"}</h3>

            <label htmlFor="company_id">Company</label>
            <select
              id="company_id"
              name="company_id"
              value={form.company_id}
              onChange={updateForm}
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>

            <label htmlFor="name">Study name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={updateForm}
              maxLength={255}
              required
            />

            <div className="client-form-grid">
              <div>
                <label htmlFor="study_type">Study type</label>
                <input
                  id="study_type"
                  name="study_type"
                  value={form.study_type}
                  onChange={updateForm}
                  required
                />
                <small>Enter a study type accepted by your backend.</small>
              </div>

              <div>
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={updateForm}
                  required
                />
              </div>

              <div>
                <label htmlFor="language">Language</label>
                <input
                  id="language"
                  name="language"
                  value={form.language}
                  onChange={updateForm}
                  required
                />
              </div>

              <div>
                <label htmlFor="survey_link">Survey link</label>
                <input
                  id="survey_link"
                  name="survey_link"
                  type="url"
                  value={form.survey_link}
                  onChange={updateForm}
                  placeholder="https://example.com/survey"
                />
              </div>

              <div>
                <label htmlFor="target_completes">Target completes</label>
                <input
                  id="target_completes"
                  name="target_completes"
                  type="number"
                  min="1"
                  value={form.target_completes}
                  onChange={updateForm}
                  required
                />
              </div>

              <div>
                <label htmlFor="survey_length">Survey length (minutes)</label>
                <input
                  id="survey_length"
                  name="survey_length"
                  type="number"
                  min="1"
                  value={form.survey_length}
                  onChange={updateForm}
                  required
                />
              </div>

              <div>
                <label htmlFor="incidence_rate">Incidence rate (%)</label>
                <input
                  id="incidence_rate"
                  name="incidence_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.incidence_rate}
                  onChange={updateForm}
                  required
                />
              </div>
            </div>

            <label htmlFor="description">Study description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={updateForm}
            />

            <div className="client-sample-requirements">
              <div className="client-sample-heading">
                <h3>Sample Requirements</h3>
                <p>Define the target audience for your study.</p>
              </div>

              <div className="client-form-grid">
                <div>
                  <label htmlFor="min_age">Minimum age</label>
                  <input
                    id="min_age"
                    name="min_age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.min_age}
                    onChange={updateForm}
                    placeholder="e.g. 25"
                  />
                </div>

                <div>
                  <label htmlFor="max_age">Maximum age</label>
                  <input
                    id="max_age"
                    name="max_age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.max_age}
                    onChange={updateForm}
                    placeholder="e.g. 45"
                  />
                </div>

                <div>
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={updateForm}
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="industry">Industry</label>
                  <input
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={updateForm}
                    placeholder="e.g. Healthcare"
                  />
                </div>

                <div>
                  <label htmlFor="profession">Profession</label>
                  <input
                    id="profession"
                    name="profession"
                    value={form.profession}
                    onChange={updateForm}
                    placeholder="e.g. Doctor, Nurse"
                  />
                </div>
              </div>

              <label htmlFor="additional_criteria">
                Additional audience criteria
              </label>

              <textarea
                id="additional_criteria"
                name="additional_criteria"
                rows="3"
                value={form.additional_criteria}
                onChange={updateForm}
                placeholder="e.g. Years of experience, hospital type, location..."
              />
            </div>

            {/* Optional Sample Quotas */}
            <div className="client-quotas-section">
              <div className="client-quotas-header">
                <div>
                  <h3>Sample Quotas <span>(Optional)</span></h3>
                  <p>
                    Set targets for specific audience categories within your study.
                  </p>
                </div>

                <button
                  type="button"
                  className="client-add-quota-button"
                  onClick={addQuota}
                >
                  + Add Quota
                </button>
              </div>

              {form.quotas.length === 0 ? (
                <div className="client-quota-empty">
                  <p>No quotas added yet.</p>
                  <small>
                    You can skip this section if you don't need specific audience quotas.
                  </small>
                </div>
              ) : (
                <div className="client-quota-list">
                  {form.quotas.map((quota, index) => (
                    <div className="client-quota-row" key={index}>
                      <div className="client-quota-field">
                        <label htmlFor={`quota-attribute-${index}`}>
                          Attribute
                        </label>

                        <select
                          id={`quota-attribute-${index}`}
                          value={quota.attribute}
                          onChange={(event) =>
                            updateQuota(index, "attribute", event.target.value)
                          }
                          required
                        >
                          {quotaAttributes.map((attribute) => (
                            <option
                              key={attribute.value}
                              value={attribute.value}
                            >
                              {attribute.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="client-quota-field">
                        <label htmlFor={`quota-category-${index}`}>
                          Category
                        </label>

                        <input
                          id={`quota-category-${index}`}
                          type="text"
                          value={quota.category}
                          onChange={(event) =>
                            updateQuota(index, "category", event.target.value)
                          }
                          placeholder="e.g. Male, 25–34, Healthcare"
                          maxLength={100}
                          required
                        />
                      </div>

                      <div className="client-quota-field">
                        <label htmlFor={`quota-target-${index}`}>
                          Target completes
                        </label>

                        <input
                          id={`quota-target-${index}`}
                          type="number"
                          min="1"
                          value={quota.target_completes}
                          onChange={(event) =>
                            updateQuota(
                              index,
                              "target_completes",
                              event.target.value
                            )
                          }
                          placeholder="e.g. 100"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        className="client-remove-quota-button"
                        onClick={() => removeQuota(index)}
                        aria-label={`Remove quota ${index + 1}`}
                        title="Remove quota"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {form.quotas.length > 0 && (
                <p className="client-quota-help">
                  Add separate rows for each category. For example, Gender → Male
                  and Gender → Female.
                </p>
              )}
            </div>

            <button
                type="submit"
                className="client-primary-button"
                disabled={saving}
                >
                {saving
                    ? "Saving..."
                    : editingStudyId !== null
                    ? "Save changes"
                    : "Save as draft"}
                </button>

                <button
                type="button"
                className="client-secondary-button"
                onClick={() => {
                    setEditingStudyId(null);
                    setShowForm(false);
                    setForm({
                    ...initialForm,
                    company_id: String(profile?.companies?.[0]?.id || ""),
                    });
                }}
                >
                Cancel
            </button>
          </form>
        )}

        {studies.length > 0 && (
          <div className="client-study-toolbar">
            <div className="client-search-wrapper">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by study name, ID or country..."
                aria-label="Search studies"
              />
            </div>

            <select
              className="client-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter studies by status"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="quote_sent">Quotation Sent</option>
              <option value="client_accepted">Quotation Accepted</option>
              <option value="client_declined">Quotation Declined</option>
              <option value="project_created">Project Created</option>
              <option value="in_fieldwork">In Fieldwork</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        {filteredStudies.length === 0 ? (
          <div className="client-empty-state">
            <h3>
              {studies.length === 0
                ? "No studies yet"
                : "No matching studies found"}
            </h3>

            <p>
              {studies.length === 0
                ? "Create your first study to get started."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="client-studies-table-wrapper">
            <table className="client-studies-table">
              <thead>
                <tr>
                  <th>Study</th>
                  <th>Country</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Project Reference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudies.map((study) => (
                  <tr key={study.id}>
                    <td>
                      <strong>
                        <Link
                          className="client-study-link"
                          to={`/client-portal/studies/${study.id}`}
                        >
                          {study.name}
                        </Link>
                      </strong>

                      <small>
                        Study #{study.id} ·{" "}
                        {statusLabel(study.study_type || "other")}
                      </small>
                    </td>
                    <td>
                      <strong>{study.country || "—"}</strong>
                      <small>{study.language || "Language not specified"}</small>
                    </td>
                    <td>{study.target_completes ?? "—"}</td>
                    <td>
                      <span
                        className={`client-status-badge client-status-${study.status}`}
                      >
                        {statusLabel(study.status)}
                      </span>
                    </td>
                    <td>
                      {study.project_reference ? (
                        <span className="client-project-reference">
                          {study.project_reference}
                        </span>
                      ) : study.project ? (
                        <span>Project #{study.project}</span>
                      ) : (
                        <span className="client-muted-text">Not created yet</span>
                      )}
                    </td>
               
                    <td>
                      <div className="client-study-actions">
                        <Link
                          to={`/client-portal/studies/${study.id}`}
                          className="client-table-button client-view-button"
                        >
                          View
                        </Link>

                        {["draft", "changes_requested"].includes(study.status) && (
                          <>
                            <button
                              type="button"
                              className="client-table-button"
                              onClick={() => handleEditStudy(study)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="client-table-button client-submit-button"
                              disabled={submittingId === study.id}
                              onClick={() => handleSubmitStudy(study.id)}
                            >
                              {submittingId === study.id
                                ? "Submitting..."
                                : "Submit for review"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// export default function ClientDashboard() {
//   return (
//     <ClientPortalRoute>
//       <ClientDashboardContent />
//     </ClientPortalRoute>
//   );
// }
export default function ClientDashboard() {
  return <ClientDashboardContent />;
}