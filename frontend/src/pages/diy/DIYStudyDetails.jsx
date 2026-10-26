
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./DIYStudyDetails.css";

function formatLabel(value) {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function DIYStudyDetails() {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStudy() {
      try {
        setLoading(true);
        setError("");

        // Load from the internal all-studies endpoint.
        const response = await axiosInstance.get(
          "/diy/internal/studies/"
        );

        const studies = Array.isArray(response.data)
          ? response.data
          : [];

        const selectedStudy = studies.find(
          (item) => String(item.id) === String(studyId)
        );

        if (!selectedStudy) {
          throw new Error("Study not found.");
        }

        if (active) setStudy(selectedStudy);
      } catch (err) {
        if (active) {
          setError(
            err.message === "Study not found."
              ? err.message
              : err.response?.data?.detail ||
                  err.response?.data?.error ||
                  "Unable to load study details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudy();

    return () => {
      active = false;
    };
  }, [studyId]);

  if (loading) return <main><h2>Loading study details...</h2></main>;

  if (error) {
    return (
      <main>
        <Link to="/diy/studies">← Back to All DIY Studies</Link>
        <p role="alert">{error}</p>
      </main>
    );
  }

  const fields = [
    ["Study ID", study.id],
    ["Study Name", study.name],
    ["Project ID", study.project ?? "—"],
    ["DIY Project Reference", study.project_reference || "—"],
    ["Company", study.company_name],
    ["Study Type", formatLabel(study.study_type)],
    ["Country", study.country],
    ["Language", study.language],
    ["Status", formatLabel(study.status)],
    ["Survey Link", study.survey_link],
    ["Target Completes", study.target_completes],
    ["Survey Length", study.survey_length],
    ["Incidence Rate", study.incidence_rate],
    ["Description", study.description],
    ["Created At", formatDate(study.created_at)],
    ["Last Updated", formatDate(study.updated_at)],
    ["Reviewed At", formatDate(study.reviewed_at)],
    ["Reviewed By (User ID)", study.reviewed_by],
    ["Review Notes", study.review_notes],
  ];

  return (
    <main className="diy-study-details">
      <div className="diy-study-details__header">
        <div>
          <Link to="/diy/studies">← Back to All DIY Studies</Link>
          <h1>{study.name || "Untitled Study"}</h1>
          <p>
            {study.company_name || "Unknown company"} ·{" "}
            {formatLabel(study.status)}
          </p>
        </div>

        {study.project && (
          <div className="diy-study-details__project-actions">
            <Link
              className="diy-study-details__project-link"
              to={`/projects/${study.project}`}
            >
              View Project #{study.project}
            </Link>

            {study.project_reference && (
              <span className="diy-study-details__project-reference">
                Reference: {study.project_reference}
              </span>
            )}
          </div>
        )}
      </div>

      <section className="diy-study-details__grid">
        {fields.map(([label, value]) => (
          <div className="diy-study-details__field" key={label}>
            <strong>{label}</strong>
            <div>
              {label === "Survey Link" && value ? (
                <a href={value} target="_blank" rel="noreferrer">
                  {value}
                </a>
              ) : (
                value ?? "—"
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
