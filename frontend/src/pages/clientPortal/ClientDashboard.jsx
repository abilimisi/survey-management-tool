
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
import { Eye, Pencil } from "lucide-react";
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

const clientStudyStatuses = [
  {
    title: "Draft",
    code: "draft",
    description: "The study is saved and can still be edited by the client.",
    next: "Complete the study details and submit it when ready.",
    tone: "blue",
  },
  {
    title: "Submitted",
    code: "submitted",
    description: "The study has been submitted and is awaiting internal review.",
    next: "The review team can assess the study.",
    tone: "indigo",
  },
  {
    title: "Under Review",
    code: "under_review",
    description: "The team assesses feasibility, proposed completes, timeline, and budget.",
    next: "A quotation can be prepared when the assessment is feasible.",
    tone: "amber",
  },
  {
    title: "Changes Requested",
    code: "changes_requested",
    description: "The study has been returned with review notes.",
    next: "Update the requested details and submit the study again.",
    tone: "orange",
  },
  {
    title: "Quotation Sent",
    code: "quote_sent",
    description: "A quotation has been sent for the client to review.",
    next: "Accept or decline the quotation.",
    tone: "purple",
  },
  {
    title: "Client Accepted",
    code: "client_accepted",
    description: "The client has accepted the quotation.",
    next: "Confirm the survey link if it is still pending.",
    tone: "green",
  },
  {
    title: "Client Declined",
    code: "client_declined",
    description: "The client has declined the quotation.",
    next: "The client can request a new quotation to reopen review.",
    tone: "red",
  },
  {
    title: "Project Created",
    code: "project_created",
    description: "The accepted study has been converted into an internal project.",
    next: "The project can proceed through its execution workflow.",
    tone: "teal",
  },
];

const clientBuildNotes = [
  {
    title: "Study information",
    items: ["Company", "Study name", "Study type", "Country", "Language"],
  },
  {
    title: "Research requirements",
    items: [
      "Target completes must be greater than zero",
      "Survey length must be greater than zero",
      "Incidence rate",
      "Sample requirements must be saved",
    ],
  },
  {
    title: "Audience targeting",
    items: [
      "Minimum and maximum age (if applicable)",
      "Gender preference",
      "Industry and profession",
      "Additional audience criteria",
      "Optional sample quotas",
    ],
  },
  {
    title: "Before submitting",
    items: [
      "Study name is required",
      "Country is required",
      "Target completes must be greater than zero",
      "Survey length must be greater than zero",
      "A sample requirement record must exist",
    ],
  },
];

function statusLabel(status) {
  return (status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ClientDashboardContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAllStudiesPage =
  location.pathname === "/client-portal/studies";

  const [profile, setProfile] = useState(null);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // End Pages popup state
  const [showEndPagesModal, setShowEndPagesModal] = useState(false);
  const [copiedEndPage, setCopiedEndPage] = useState("");
  // Status Rules & Build Notes popup state
  const [showStatusRulesModal, setShowStatusRulesModal] = useState(false);

  const [showClientRoadmapModal, setShowClientRoadmapModal] = useState(false);
  useEffect(() => {
    const modalToOpen = location.state?.openClientModal;

    if (!modalToOpen) return;

    if (modalToOpen === "end-pages") {
      setShowEndPagesModal(true);
    } else if (modalToOpen === "status-rules") {
      setShowStatusRulesModal(true);
    } else if (modalToOpen === "roadmap") {
      setShowClientRoadmapModal(true);
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);
  const backendBaseUrl =
    "https://carpenter-trodden-upstate.ngrok-free.dev";

  const endPageLinks = [
    {
      name: "Complete",
      url: `${backendBaseUrl}/api/simple-process/?status=1&pid={{OBID}}`,
    },
    {
      name: "Terminate",
      url: `${backendBaseUrl}/api/simple-process/?status=2&pid={{OBID}}`,
    },
    {
      name: "Quota Full",
      url: `${backendBaseUrl}/api/simple-process/?status=3&pid={{OBID}}`,
    },
    {
      name: "Security",
      url: `${backendBaseUrl}/api/simple-process/?status=4&pid={{OBID}}`,
    },
  ];

  const copyEndPageLink = async (name, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEndPage(name);

      window.setTimeout(() => {
        setCopiedEndPage("");
      }, 2000);
    } catch (error) {
      window.prompt("Copy this redirect URL:", url);
    }
  };

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

  const resetForm = () => {
    setEditingStudyId(null);
    setShowForm(false);
    setForm({
      ...initialForm,
      company_id: String(profile?.companies?.[0]?.id || ""),
    });
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

      resetForm();
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
   
  // Dashboard shows the latest 5 studies.
  // All Studies page shows the complete filtered list.
  const displayedStudies = isAllStudiesPage
    ? filteredStudies
    : filteredStudies.slice(0, 5);

  if (loading) {
    return (
      <div className="client-dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="client-dashboard-page">
      
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

      <div className="client-dashboard-content-grid">
        <section
          className="client-studies-section"
          id="client-studies-section"
        >
          <div className="client-section-heading">
            <div>
              <h2>{isAllStudiesPage ? "All Studies" : "Your Studies"}</h2>
              <p>
                {isAllStudiesPage
                  ? `Showing all ${filteredStudies.length} studies associated with your account.`
                  : "Showing your latest five studies."}
              </p>
            </div>

            {isAllStudiesPage ? (
              <button
                type="button"
                className="client-secondary-button"
                onClick={() => navigate("/client-portal/dashboard")}
              >
                ← Back to Dashboard
              </button>
            ) : (
              <div className="client-studies-header-actions">
                <button
                  type="button"
                  className="client-primary-button"
                  onClick={() => navigate("/client-portal/studies")}
                >
                  View All Studies →
                </button>

                <button
                  type="button"
                  className="client-dashboard-create"
                  onClick={() => navigate("/client-portal/create-study")}
                  disabled={companies.length === 0}
                >
                  <span>+</span> Create Study
                </button>
              </div>
            )}
          </div>

          {showForm && (
            <form
              className="client-study-form"
              onSubmit={handleCreateStudy}
            >
              <h3>
                {editingStudyId !== null ? "Edit study" : "New study"}
              </h3>

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
                  <small>
                    Enter a study type accepted by your backend.
                  </small>
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
                  <label htmlFor="target_completes">
                    Target completes
                  </label>
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
                  <label htmlFor="survey_length">
                    Survey length (minutes)
                  </label>
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
                  <label htmlFor="incidence_rate">
                    Incidence rate (%)
                  </label>
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
                  <p>
                    Define the target audience for your study.
                  </p>
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

              <div className="client-quotas-section">
                <div className="client-quotas-header">
                  <div>
                    <h3>
                      Sample Quotas <span>(Optional)</span>
                    </h3>
                    <p>
                      Set targets for specific audience categories within
                      your study.
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
                      You can skip this section if you don't need specific
                      audience quotas.
                    </small>
                  </div>
                ) : (
                  <div className="client-quota-list">
                    {form.quotas.map((quota, index) => (
                      <div
                        className="client-quota-row"
                        key={index}
                      >
                        <div className="client-quota-field">
                          <label htmlFor={`quota-attribute-${index}`}>
                            Attribute
                          </label>

                          <select
                            id={`quota-attribute-${index}`}
                            value={quota.attribute}
                            onChange={(event) =>
                              updateQuota(
                                index,
                                "attribute",
                                event.target.value
                              )
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
                              updateQuota(
                                index,
                                "category",
                                event.target.value
                              )
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
                    Add separate rows for each category. For example,
                    Gender → Male and Gender → Female.
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
                onClick={resetForm}
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
                  {displayedStudies.map((study) => (
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
                        <small>
                          {study.language || "Language not specified"}
                        </small>
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
                          <span className="client-muted-text">
                            Not created yet
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="client-study-actions">
                          {/* View Study */}
                          <Link
                            to={`/client-portal/studies/${study.id}`}
                            className="client-action-icon view"
                            title="View Study"
                            aria-label="View Study"
                          >
                            <Eye size={16} strokeWidth={2} />
                          </Link>

                          {(study.project || study.project_id) && (
                            <Link
                              to={`/client-portal/studies/${study.id}/responses`}
                              className="client-table-button client-view-button"
                            >
                              View Responses
                            </Link>
                          )}

                          {/* Edit Study and Submit for Review */}
                          {["draft", "changes_requested"].includes(study.status) && (
                            <>
                              <button
                                type="button"
                                className="client-action-icon edit"
                                title="Edit Study"
                                aria-label="Edit Study"
                                onClick={() =>
                                  navigate("/client-portal/create-study", {
                                    state: { editStudyId: study.id },
                                  })
                                }
                              >
                                <Pencil size={16} strokeWidth={2} />
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

      {/* Status Rules & Build Notes popup - stays inside Client Dashboard */}
      {showStatusRulesModal && (
        <div
          className="end-pages-modal-overlay"
          onClick={() => setShowStatusRulesModal(false)}
        >
          <div
            className="end-pages-modal client-status-rules-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-rules-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="end-pages-modal-header">
              <div>
                <h2 id="status-rules-modal-title">
                  Status Rules &amp; Build Notes
                </h2>
                <p>
                  Understand the study workflow and the information required
                  before submitting your study.
                </p>
              </div>

              <button
                type="button"
                className="end-pages-modal-close"
                onClick={() => setShowStatusRulesModal(false)}
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <div className="end-pages-modal-body client-status-rules-body">
              <section className="client-status-rules-section">
                <div className="client-status-rules-section-heading">
                  <div>
                    <span className="client-status-rules-eyebrow">
                      STUDY LIFECYCLE
                    </span>
                    <h3>Study status reference</h3>
                    <p>
                      These statuses are used in the current client study
                      workflow.
                    </p>
                  </div>
                  <span className="client-status-rules-count">
                    {clientStudyStatuses.length} statuses
                  </span>
                </div>

                <div className="client-status-rules-grid">
                  {clientStudyStatuses.map((item, index) => (
                    <article
                      className="client-status-rule-card"
                      key={item.code}
                    >
                      <div className="client-status-rule-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="client-status-rule-content">
                        <div className="client-status-rule-title">
                          <h4>{item.title}</h4>
                          <span className={`client-status-rule-badge ${item.tone}`}>
                            {item.title}
                          </span>
                        </div>
                        <p>{item.description}</p>
                        <div className="client-status-rule-next">
                          <strong>Next step</strong>
                          <span>{item.next}</span>
                        </div>
                        <code>{item.code}</code>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="client-status-rules-section">
                <div className="client-status-rules-section-heading">
                  <div>
                    <span className="client-status-rules-eyebrow">
                      STUDY PREPARATION
                    </span>
                    <h3>Build notes &amp; submission checklist</h3>
                    <p>
                      Use these points to prepare and validate your study
                      details before submission.
                    </p>
                  </div>
                </div>

                <div className="client-build-notes-grid">
                  {clientBuildNotes.map((section, index) => (
                    <article className="client-build-note-card" key={section.title}>
                      <span className="client-build-note-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4>{section.title}</h4>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>
                            <span aria-hidden="true">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <div className="client-status-rules-note">
                <strong>After submission</strong>
                <p>
                  If changes are requested, use the review notes to update
                  your study and submit it again. When a quotation is sent,
                  review and accept or decline it. After acceptance, the
                  survey link may still need confirmation and validation
                  before project creation.
                </p>
              </div>

              <div className="client-status-rules-footer">
                <span>
                  This reference reflects the study workflow currently
                  implemented in the client portal.
                </span>
                <button
                  type="button"
                  onClick={() => setShowStatusRulesModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Pages popup - stays inside Client Dashboard */}
      {showEndPagesModal && (
        <div
          className="end-pages-modal-overlay"
          onClick={() => setShowEndPagesModal(false)}
        >
          <div
            className="end-pages-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-pages-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="end-pages-modal-header">
              <div>
                <h2 id="end-pages-modal-title">
                  Client Redirect Links
                </h2>
                <p>
                  Copy the appropriate redirect URL for each survey outcome.
                </p>
              </div>

              <button
                type="button"
                className="end-pages-modal-close"
                onClick={() => setShowEndPagesModal(false)}
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <div className="end-pages-modal-body">
              {endPageLinks.map((item) => (
                <div className="end-pages-link-row" key={item.name}>
                  <div className="end-pages-link-content">
                    <label>{item.name}</label>
                    <div className="end-pages-url">{item.url}</div>
                  </div>

                  <button
                    type="button"
                    className="end-pages-copy-button"
                    onClick={() =>
                      copyEndPageLink(item.name, item.url)
                    }
                  >
                    {copiedEndPage === item.name ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Client Road Map popup */}
      {showClientRoadmapModal && (
        <div
          className="end-pages-modal-overlay"
          onClick={() => setShowClientRoadmapModal(false)}
        >
          <div
            className="end-pages-modal client-roadmap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-roadmap-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="end-pages-modal-header">
              <div>
                <h2 id="client-roadmap-modal-title">Client Road Map</h2>
                <p>Follow the key milestones from study creation to project handover.</p>
              </div>

              <button
                type="button"
                className="end-pages-modal-close"
                onClick={() => setShowClientRoadmapModal(false)}
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <div className="end-pages-modal-body client-roadmap-body">
              <div className="client-roadmap-intro">
                <span className="client-roadmap-intro-icon">↗</span>
                <div>
                  <strong>Your study journey</strong>
                  <p>Each milestone explains what happens and when you may need to take action.</p>
                </div>
              </div>

              <div className="client-roadmap-timeline">
                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">01</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">CLIENT ACTION</span>
                    <h3>Create your study</h3>
                    <p>
                      Enter the study information, research requirements, target
                      audience and sample requirements. Save the study as a draft
                      while you prepare it.
                    </p>
                    <span className="client-roadmap-status">Draft</span>
                  </div>
                </article>

                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">02</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">CLIENT ACTION</span>
                    <h3>Submit for review</h3>
                    <p>
                      Submit when the required study details are complete. The
                      system checks the study name, country, target completes,
                      survey length and saved sample requirements.
                    </p>
                    <span className="client-roadmap-status">Submitted</span>
                  </div>
                </article>

                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">03</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">INTERNAL REVIEW</span>
                    <h3>Feasibility assessment</h3>
                    <p>
                      The review team assesses feasibility and records proposed
                      completes, estimated timeline and budget. If changes are
                      requested, update the study using the review notes and
                      resubmit.
                    </p>
                    <span className="client-roadmap-status">
                      Under Review / Changes Requested
                    </span>
                  </div>
                </article>

                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">04</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">QUOTATION</span>
                    <h3>Review your quotation</h3>
                    <p>
                      When the assessment is feasible, a quotation can be prepared
                      and sent. Review the quotation and choose whether to accept
                      or decline it.
                    </p>
                    <span className="client-roadmap-status">Quotation Sent</span>
                  </div>
                </article>

                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">05</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">CLIENT DECISION</span>
                    <h3>Accept or decline</h3>
                    <p>
                      If you accept, provide or confirm the survey link as
                      required. If you decline, you can request a new quotation
                      to reopen the review process.
                    </p>
                    <span className="client-roadmap-status">
                      Client Accepted / Client Declined
                    </span>
                  </div>
                </article>

                <article className="client-roadmap-step">
                  <span className="client-roadmap-step-number">06</span>
                  <div className="client-roadmap-step-content">
                    <span className="client-roadmap-stage">LINK REVIEW &amp; HANDOVER</span>
                    <h3>Survey link validation and project creation</h3>
                    <p>
                      After acceptance, a pending survey link may need to be
                      submitted and reviewed. Once the accepted quotation and
                      project-conversion requirements are satisfied, the study
                      can be converted into an internal project.
                    </p>
                    <span className="client-roadmap-status">Project Created</span>
                  </div>
                </article>
              </div>

              <div className="client-roadmap-note">
                <strong>What happens after project creation?</strong>
                <p>
                  Project execution stages such as fieldwork and completion are
                  not detailed in the client-portal workflow code reviewed for
                  this roadmap. Their milestones and timelines should be added
                  once those project processes are confirmed.
                </p>
              </div>

              <div className="client-roadmap-footer">
                <span>
                  Milestones reflect the currently implemented client study workflow.
                </span>
                <button
                  type="button"
                  onClick={() => setShowClientRoadmapModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  return <ClientDashboardContent />;
}
