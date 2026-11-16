
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Pencil } from "lucide-react";
import {
  getClientStudies,
  submitClientStudy,
} from "../../api/clientPortalApi";

import "./ClientDashboard.css";

function statusLabel(status) {
  return (status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ClientAllStudies() {
  const navigate = useNavigate();

  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  const loadStudies = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getClientStudies();

      setStudies(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("client_portal_access_token");
        localStorage.removeItem("client_portal_user");

        toast.error("Your session has expired. Please log in again.");
        navigate("/client-portal/login", { replace: true });
      } else {
        toast.error("Unable to load your studies. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

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

  const handleSubmitStudy = async (studyId) => {
    setSubmittingId(studyId);

    try {
      await submitClientStudy(studyId);
      toast.success("Study submitted successfully.");
      await loadStudies();
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData && typeof errorData === "object") {
        const firstError = Object.values(errorData).flat()[0];
        toast.error(
          typeof firstError === "string"
            ? firstError
            : "Unable to submit the study."
        );
      } else {
        toast.error("Unable to submit the study. Please try again.");
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="client-dashboard-page client-all-studies-page">
      <div className="client-all-studies-header">
        <div>


          <h1>All Studies</h1>

          <p>
            View, search and manage all research studies associated
            with your account.
          </p>
        </div>

        <button
          type="button"
          className="client-secondary-button"
          onClick={() => navigate("/client-portal/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <section className="client-studies-section client-all-studies-section">
        <div className="client-all-studies-summary">
          <div>
            <span>Total Studies</span>
            <strong>{studies.length}</strong>
          </div>

          <div>
            <span>Currently Displayed</span>
            <strong>{filteredStudies.length}</strong>
          </div>
        </div>

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

        {loading ? (
          <div className="client-empty-state">
            <p>Loading all your studies...</p>
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="client-empty-state">
            <h3>
              {studies.length === 0
                ? "No studies yet"
                : "No matching studies found"}
            </h3>

            <p>
              {studies.length === 0
                ? "Your studies will appear here once created."
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
                    </td>                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ClientAllStudies;
