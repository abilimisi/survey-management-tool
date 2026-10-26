
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

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
};

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
        company_id: current.company_id || String(companyList[0]?.id || ""),
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("client_portal_access_token");
        localStorage.removeItem("client_portal_user");
        toast.error("Your client session is invalid or expired. Please log in again.");
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
    };

    try {
        if (editingStudyId !== null) {
        await updateClientStudy(editingStudyId, payload);
        toast.success("Draft study updated successfully.");
        } else {
        await createClientStudy(payload);
        toast.success("Study created as a draft.");
        }

        setEditingStudyId(null);
        setShowForm(false);

        setForm({
        company_id: String(profile?.companies?.[0]?.id || ""),
        name: "",
        study_type: "online_survey",
        country: "",
        language: "English",
        survey_link: "",
        target_completes: 200,
        survey_length: 10,
        incidence_rate: 50,
        description: "",
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

  
 const handleEditStudy = (study) => {
    if (study.status !== "draft") {
        toast.error("Only draft studies can be edited.");
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
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
 };


  if (loading) {
    return <div className="client-dashboard-loading">Loading your dashboard...</div>;
  }

  const user = profile?.user || {};
  const companies = profile?.companies || [];

  return (
    <div className="client-dashboard-page">
      <header className="client-dashboard-header">
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
      </header>

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
            <h3>{editingStudyId !== null ? "Edit draft study" : "New study"}</h3>

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

        {studies.length === 0 ? (
          <div className="client-empty-state">
            <h3>No studies yet</h3>
            <p>Create your first study to get started.</p>
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
                  <th>Project</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => (
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
                      <small>Study #{study.id}</small>
                    </td>
                    <td>{study.country || "—"}</td>
                    <td>{study.target_completes ?? "—"}</td>
                    <td>
                      <span
                        className={`client-status-badge client-status-${study.status}`}
                      >
                        {statusLabel(study.status)}
                      </span>
                    </td>
                    <td>{study.project ?? "—"}</td>
                    <td>
                      
                        {study.status === "draft" ? (
                        <div className="client-study-actions">
                            <button
                            type="button"
                            className="client-table-button"
                            onClick={() => handleEditStudy(study)}
                            >
                            Edit
                            </button>

                            <button
                            type="button"
                            className="client-table-button"
                            disabled={submittingId === study.id}
                            onClick={() => handleSubmitStudy(study.id)}
                            >
                            {submittingId === study.id
                                ? "Submitting..."
                                : "Submit for review"}
                            </button>
                        </div>
                        ) : (
                        <span className="client-muted-text">No action</span>
                        )}

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

export default function ClientDashboard() {
  return (
    <ClientPortalRoute>
      <ClientDashboardContent />
    </ClientPortalRoute>
  );
}
