
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClientStudyResponses } from "../../api/clientPortalApi";
import "./ClientStudyResponses.css";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "complete", label: "Complete" },
  { value: "started", label: "Started" },
  { value: "terminate", label: "Terminated" },
  { value: "quota_full", label: "Quota full" },
  { value: "security_terminate", label: "Security terminated" },
];

const SUMMARY_CARDS = [
  { key: "total", label: "Total responses", tone: "blue" },
  { key: "complete", label: "Completed", tone: "green" },
  { key: "started", label: "In progress", tone: "amber" },
  { key: "terminate", label: "Terminated", tone: "red" },
];

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function ClientStudyResponses() {
  const { studyId } = useParams();

  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getClientStudyResponses(studyId, {
        page,
        status: statusFilter,
        search,
      });

      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load study responses. Please try again."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studyId, page, statusFilter, search]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (event) => {
    setPage(1);
    setStatusFilter(event.target.value);
  };

  const summary = data?.summary || {};
  const respondents = data?.results || [];

  return (
    <div className="client-dashboard-page client-responses-page">
      <div className="client-responses-header">
        <div>
          <h1>Study Responses</h1>
          <p>
            View respondent activity and response progress for this study.
          </p>
        </div>

        <Link
          to="/client-portal/studies"
          className="client-secondary-button client-responses-back"
        >
          ← Back to Studies
        </Link>
      </div>

      {loading && !data ? (
        <div className="client-dashboard-loading">
          Loading study responses...
        </div>
      ) : error && !data ? (
        <div className="client-responses-message client-responses-error">
          <p>{error}</p>
          <button
            type="button"
            className="client-primary-button"
            onClick={loadResponses}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <section className="client-responses-study-card">
            <div>
              <span className="client-responses-label">STUDY</span>
              <h2>{data?.study?.name || "Study responses"}</h2>
            </div>

            <div className="client-responses-project">
              <span className="client-responses-label">
                PROJECT REFERENCE
              </span>
              <strong>
                {data?.study?.project_reference || "—"}
              </strong>
            </div>
          </section>

          {error && (
            <div className="client-responses-message client-responses-error">
              {error}
            </div>
          )}

          <section className="client-responses-summary">
            {SUMMARY_CARDS.map((card) => (
              <div className="client-responses-stat" key={card.key}>
                <span>{card.label}</span>
                <strong className={card.tone}>
                  {summary[card.key] ?? 0}
                </strong>
              </div>
            ))}
          </section>

          <section className="client-studies-section client-responses-section">
            <div className="client-section-heading">
              <div>
                <h2>Respondent Activity</h2>
                <p>
                  {data?.count ?? 0} respondent
                  {(data?.count ?? 0) === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <form
              className="client-responses-toolbar"
              onSubmit={handleSearch}
            >
              <div className="client-responses-search">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search respondent ID..."
                  aria-label="Search respondent ID"
                />
              </div>

              <select
                className="client-status-filter"
                value={statusFilter}
                onChange={handleStatusChange}
                aria-label="Filter by respondent status"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="client-primary-button"
                disabled={loading}
              >
                Search
              </button>
            </form>

            {loading ? (
              <div className="client-dashboard-loading">
                Updating respondents...
              </div>
            ) : respondents.length === 0 ? (
              <div className="client-empty-state">
                <h3>No respondents found</h3>
                <p>
                  No respondents match the selected search or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="client-studies-table-wrapper">
                  <table className="client-studies-table client-responses-table">
                    <thead>
                      <tr>
                        <th>Respondent ID</th>
                        <th>Status</th>
                        <th>Country</th>
                        <th>Started</th>
                        <th>Completed</th>
                      </tr>
                    </thead>

                    <tbody>
                      {respondents.map((respondent) => (
                        <tr key={respondent.id}>
                          <td>
                            <strong>
                              {respondent.respondent_id || "—"}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`client-response-status status-${(
                                respondent.status || "unknown"
                              ).toLowerCase()}`}
                            >
                              {formatStatus(respondent.status)}
                            </span>
                          </td>

                          <td>{respondent.detected_country || "—"}</td>
                          <td>{formatDate(respondent.started_at)}</td>
                          <td>{formatDate(respondent.completed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="client-responses-pagination">
                  <span>
                    Page {page}
                  </span>

                  <div>
                    <button
                      type="button"
                      className="client-secondary-button"
                      disabled={!data?.previous || loading}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      className="client-secondary-button"
                      disabled={!data?.next || loading}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ClientStudyResponses;
