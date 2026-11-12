
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./DIYDashboard.css";

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

function getStatusClass(status) {
  return (status || "unknown").replace(/[^a-zA-Z0-9_-]/g, "");
}

export default function DIYDashboard() {
  const [studies, setStudies] = useState([]);
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

  const stats = useMemo(
    () => [
      {
        label: "Total Studies",
        value: studies.length,
        description: "All research studies",
      },
      {
        label: "Submitted",
        value: studies.filter(
          (study) => study.status === "submitted"
        ).length,
        description: "Awaiting review",
      },
      {
        label: "Under Review",
        value: studies.filter(
          (study) => study.status === "under_review"
        ).length,
        description: "Currently being reviewed",
      },
      {
        label: "Approved",
        value: studies.filter(
          (study) => study.status === "approved"
        ).length,
        description: "Approved studies",
      },
    ],
    [studies]
  );

  const recentStudies = useMemo(() => {
    return [...studies]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [studies]);

  return (
    <div className="diy-dashboard">
      <header className="diy-dashboard__header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your research activity.</p>
        </div>
      </header>

      <section className="diy-dashboard__stats">
        {stats.map((stat) => (
          <article
            className="diy-dashboard__stat-card"
            key={stat.label}
          >
            <p className="diy-dashboard__stat-label">
              {stat.label}
            </p>

            <h2>
              {loading ? "—" : stat.value}
            </h2>

            <p className="diy-dashboard__stat-description">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      <section className="diy-dashboard__studies">
        <div className="diy-dashboard__section-header">
          <div>
            <h2>Recent Studies</h2>
            <p>
              Monitor your latest research submissions and their status.
            </p>
          </div>

          <Link
            to="/diy/studies"
            className="diy-dashboard__view-all"
          >
            View all studies →
          </Link>
        </div>

        {loading && (
          <div className="diy-dashboard__message">
            Loading studies...
          </div>
        )}

        {!loading && error && (
          <div
            className="diy-dashboard__message diy-dashboard__message--error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && studies.length === 0 && (
          <div className="diy-dashboard__empty">
            <h3>No studies yet</h3>
            <p>
              There are currently no research studies to display.
            </p>
          </div>
        )}

        {!loading && !error && studies.length > 0 && (
          <div className="diy-dashboard__table-wrap">
            <table className="diy-dashboard__table">
              <thead>
                <tr>
                  <th>Study</th>
                  <th>Company</th>
                  <th>Country</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentStudies.map((study) => (
                  <tr key={study.id}>
                    <td>
                      <Link
                        to={`/diy/studies/${study.id}`}
                        className="diy-dashboard__study-link"
                      >
                        {study.name || "Untitled study"}
                      </Link>

                      <span className="diy-dashboard__study-id">
                        ID: {study.id}
                      </span>
                    </td>

                    <td>{study.company_name || "—"}</td>
                    <td>{study.country || "—"}</td>
                    <td>{study.target_completes ?? "—"}</td>

                    <td>
                      <span
                        className={`diy-dashboard__status diy-dashboard__status--${getStatusClass(study.status)}`}
                      >
                        {formatStatus(study.status)}
                      </span>
                    </td>

                    <td>{formatDate(study.created_at)}</td>

                    <td>
                      <Link
                        to={`/diy/studies/${study.id}`}
                        className="diy-dashboard__action-link"
                      >
                        View details
                      </Link>
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
