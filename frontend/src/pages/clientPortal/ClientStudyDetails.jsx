
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClientProfile,
  getClientStudies,
} from "../../api/clientPortalApi";
import ClientPortalRoute from "./ClientPortalRoute";
import "./ClientStudyDetails.css";

function formatStatus(status) {
  return (status || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ClientStudyDetailsContent() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStudy() {
      setLoading(true);

      try {
        const [profileResponse, studiesResponse] = await Promise.all([
          getClientProfile(),
          getClientStudies(),
        ]);

        if (!active) return;

        const studies = Array.isArray(studiesResponse.data)
          ? studiesResponse.data
          : studiesResponse.data.results || [];

        const foundStudy = studies.find(
          (item) => String(item.id) === String(studyId)
        );

        if (!foundStudy) {
          setStudy(null);
          return;
        }

        const company = (profileResponse.data.companies || []).find(
          (item) => String(item.id) === String(foundStudy.company)
        );

        setStudy(foundStudy);
        setCompanyName(company?.name || foundStudy.company_name || "—");
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("client_portal_access_token");
          localStorage.removeItem("client_portal_user");
          navigate("/client-portal/login", { replace: true });
        } else {
          toast.error("Unable to load study details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudy();

    return () => {
      active = false;
    };
  }, [studyId, navigate]);

  if (loading) {
    return <div className="client-dashboard-loading">Loading study details...</div>;
  }

  if (!study) {
    return (
      <div className="client-dashboard-page">
        <div className="client-detail-card">
          <h1>Study not found</h1>
          <p>This study does not exist or is not accessible to your account.</p>
          <Link to="/client-portal/dashboard">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const details = [
    ["Company", companyName],
    ["Study type", study.study_type],
    ["Country", study.country],
    ["Language", study.language],
    ["Target completes", study.target_completes],
    ["Survey length", study.survey_length ? `${study.survey_length} minutes` : "—"],
    ["Incidence rate", study.incidence_rate != null ? `${study.incidence_rate}%` : "—"],
    ["Survey link", study.survey_link],
    ["Operational Project ID", study.project ?? "Not created yet"],
    ["Created", study.created_at ? new Date(study.created_at).toLocaleString() : "—"],
    ["Last updated", study.updated_at ? new Date(study.updated_at).toLocaleString() : "—"],
  ];

  return (
    <div className="client-dashboard-page">
      <div className="client-detail-topbar">
        <Link to="/client-portal/dashboard">← Back to dashboard</Link>
        <span className={`client-status-badge client-status-${study.status}`}>
          {formatStatus(study.status)}
        </span>
      </div>

      <section className="client-detail-card">
        <p className="client-dashboard-eyebrow">STUDY #{study.id}</p>
        <h1>{study.name}</h1>
        <p className="client-detail-description">
          {study.description || "No description provided."}
        </p>

        <div className="client-detail-grid">
          {details.map(([label, value]) => (
            <div className="client-detail-field" key={label}>
              <span>{label}</span>
              {label === "Survey link" && value ? (
                <a href={value} target="_blank" rel="noreferrer">
                  Open survey
                </a>
              ) : (
                <strong>{value ?? "—"}</strong>
              )}
            </div>
          ))}
        </div>
      </section>

      {study.status === "rejected" && (
        <section className="client-detail-card client-review-card">
          <h2>Review feedback</h2>
          <p>
            {study.review_notes ||
              "Your study was rejected. Please contact the internal team for more information."}
          </p>
        </section>
      )}

      {study.status === "approved" && (
        <section className="client-detail-card client-review-card">
          <h2>Study approved</h2>
          <p>
            {study.project
              ? `An operational Project has been linked (Project ID ${study.project}).`
              : "Your study is approved. An operational Project has not been linked yet."}
          </p>
          {study.review_notes && <p>Reviewer notes: {study.review_notes}</p>}
        </section>
      )}

      {study.status === "submitted" && (
        <section className="client-detail-card client-review-card">
          <h2>Awaiting review</h2>
          <p>Your study has been submitted and is waiting for the internal team.</p>
        </section>
      )}

      {study.status === "under_review" && (
        <section className="client-detail-card client-review-card">
          <h2>Under review</h2>
          <p>The internal team is reviewing your study.</p>
        </section>
      )}
    </div>
  );
}

export default function ClientStudyDetails() {
  return (
    <ClientPortalRoute>
      <ClientStudyDetailsContent />
    </ClientPortalRoute>
  );
}
