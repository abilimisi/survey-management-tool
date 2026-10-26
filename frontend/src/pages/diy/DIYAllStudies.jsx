
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./DIYAllStudies.css";

const STATUS_OPTIONS = [
  "all",
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
];

function formatStatus(status) {
  return (status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
}

export default function DIYAllStudies() {
  const [studies, setStudies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStudies() {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          "diy/internal/studies/"
        );

        if (active) {
          setStudies(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.error ||
              "Unable to load DIY studies. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudies();

    return () => {
      active = false;
    };
  }, []);

  const filteredStudies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studies.filter((study) => {
      const matchesStatus =
        statusFilter === "all" || study.status === statusFilter;

      const searchableText = [
        study.id,
        study.name,
        study.company_name,
        study.study_type,
        study.country,
        study.language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [studies, search, statusFilter]);

  return (
    <main className="diy-all-studies">
      <header className="diy-all-studies__header">
        <div>
          <h1>All DIY Studies</h1>
          <p>View and track client-created studies and their review status.</p>
        </div>

        <span>
          {filteredStudies.length} of {studies.length} studies
        </span>
      </header>

      <section className="diy-all-studies__filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search study, company, country..."
          aria-label="Search DIY studies"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter studies by status"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All statuses" : formatStatus(status)}
            </option>
          ))}
        </select>
      </section>

      {loading && <p>Loading DIY studies...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <div className="diy-all-studies__table-wrap">
          <table className="diy-all-studies__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Study</th>
                <th>Company</th>
                <th>Type</th>
                <th>Country</th>
                <th>Target</th>
                <th>Status</th>
                <th>Project ID</th>
                <th>DIY Reference</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudies.map((study) => (
                <tr key={study.id}>
                  <td>{study.id}</td>

                  <td>
                    <Link to={`/diy/studies/${study.id}`}>
                      {study.name || "Untitled study"}
                    </Link>
                  </td>

                  <td>{study.company_name || "—"}</td>
                  <td>{study.study_type || "—"}</td>
                  <td>{study.country || "—"}</td>
                  <td>{study.target_completes ?? "—"}</td>

                  <td>
                    <span
                      className={`diy-status diy-status--${study.status}`}
                    >
                      {formatStatus(study.status)}
                    </span>
                  </td>

                  <td>
                    {study.project ? (
                      <Link to={`/projects/${study.project}`}>
                        View project #{study.project}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{study.project_reference || "—"}</td>

                  <td>{formatDate(study.created_at)}</td>
                </tr>
              ))}

              {filteredStudies.length === 0 && (
                <tr>
                  <td colSpan={10}>No matching DIY studies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
