
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import {
  getDIYQuotationHistory,
  sendDIYQuotation,
  convertDIYStudyToProject,
  reviewDIYSurveyLink,
} from "../../api/diyReviewApi";

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
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [sendingQuotationId, setSendingQuotationId] = useState(null);
  const [reviewingSurveyLink, setReviewingSurveyLink] = useState(false);

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

  useEffect(() => {
    loadQuotationHistory();
  }, [studyId]);

  const loadQuotationHistory = async () => {
    try {
      setQuotationsLoading(true);

      const response = await getDIYQuotationHistory(studyId);

      setQuotations(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load quotation history:", err);
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const handleSendQuotation = async (quotationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to send this quotation to the client?"
    );

    if (!confirmed) return;

    try {
      setSendingQuotationId(quotationId);

      await sendDIYQuotation(studyId, quotationId);

      alert("Quotation sent successfully.");

      await loadQuotationHistory();

      // Refresh study status after sending
      const response = await axiosInstance.get(
        "/diy/internal/studies/"
      );

      const studies = Array.isArray(response.data)
        ? response.data
        : [];

      const updatedStudy = studies.find(
        (item) => String(item.id) === String(studyId)
      );

      if (updatedStudy) {
        setStudy(updatedStudy);
      }
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Unable to send quotation. Please try again."
      );
    } finally {
      setSendingQuotationId(null);
    }
  };

  const handleSurveyLinkReview = async (action) => {
    const actionLabel =
      action === "validate" ? "validate this survey URL" : "request changes to this survey URL";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    );

    if (!confirmed) return;

    try {
      setReviewingSurveyLink(true);

      const response = await reviewDIYSurveyLink(studyId, action);

      alert(
        response.data.message ||
          "Survey URL review completed successfully."
      );

      // Refresh study details to display the latest URL status.
      const studiesResponse = await axiosInstance.get(
        "/diy/internal/studies/"
      );

      const studies = Array.isArray(studiesResponse.data)
        ? studiesResponse.data
        : [];

      const updatedStudy = studies.find(
        (item) => String(item.id) === String(studyId)
      );

      if (updatedStudy) {
        setStudy(updatedStudy);
      }
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to update survey URL review status."
      );
    } finally {
      setReviewingSurveyLink(false);
    }
  };

  const handleConvertToProject = async () => {
    const confirmed = window.confirm(
      "The client has accepted the quotation. Are you sure you want to convert this DIY study into an internal Project?"
    );

    if (!confirmed) return;

    try {
      const response = await convertDIYStudyToProject(studyId);

      alert(
        response.data.message ||
        "DIY study converted into a Project successfully."
      );

      // Refresh study details
      const studiesResponse = await axiosInstance.get(
        "/diy/internal/studies/"
      );

      const studies = Array.isArray(studiesResponse.data)
        ? studiesResponse.data
        : [];

      const updatedStudy = studies.find(
        (item) => String(item.id) === String(studyId)
      );

      if (updatedStudy) {
        setStudy(updatedStudy);
      }
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Unable to convert this study into a Project."
      );
    }
  };

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

    const hasAssessment =
      study.assessment_status !== null &&
      study.assessment_status !== undefined;

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
        <div className="diy-study-details__project-actions">
          {!study.project && (
            <>
              <Link
                className="diy-study-details__project-link"
                to={`/diy/studies/${study.id}/assessment`}
              >
                Assess Study
              </Link>

              {(study.assessment_status === "feasible" ||
                study.assessment_status === "feasible_with_conditions") &&
                study.status === "under_review" && (
                  <Link
                    className="diy-study-details__project-link"
                    to={`/diy/studies/${study.id}/quotation`}
                  >
                    Create Quotation
                  </Link>
                )}

                {study.status === "client_accepted" && (
                  <button
                    type="button"
                    className="diy-study-details__project-link"
                    onClick={handleConvertToProject}
                  >
                    Convert to Project
                  </button>
                )}
            </>
          )}

          {study.project && (
            <>
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
            </>
          )}
        </div>
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

            {/* Sample Requirements */}
      <section className="diy-study-details__section">
        <div className="diy-study-details__section-heading">
          <div>
            <h2>Sample Requirements</h2>
            <p>Target audience criteria provided by the client.</p>
          </div>
        </div>

        {study.sample_requirement ? (
          <div className="diy-study-details__audience-grid">
            <div className="diy-study-details__audience-field">
              <span>Minimum age</span>
              <strong>{study.sample_requirement.min_age ?? "—"}</strong>
            </div>

            <div className="diy-study-details__audience-field">
              <span>Maximum age</span>
              <strong>{study.sample_requirement.max_age ?? "—"}</strong>
            </div>

            <div className="diy-study-details__audience-field">
              <span>Gender</span>
              <strong>{formatLabel(study.sample_requirement.gender || "all")}</strong>
            </div>

            <div className="diy-study-details__audience-field">
              <span>Industry</span>
              <strong>{study.sample_requirement.industry || "—"}</strong>
            </div>

            <div className="diy-study-details__audience-field">
              <span>Profession</span>
              <strong>{study.sample_requirement.profession || "—"}</strong>
            </div>

            <div className="diy-study-details__audience-field">
              <span>Additional criteria</span>
              <strong>
                {study.sample_requirement.additional_criteria || "—"}
              </strong>
            </div>
          </div>
        ) : (
          <p>No sample requirements provided.</p>
        )}
      </section>

      {/* Sample Quotas */}
      <section className="diy-study-details__section">
        <div className="diy-study-details__section-heading">
          <div>
            <h2>Sample Quotas</h2>
            <p>Specific audience category targets requested by the client.</p>
          </div>

          <span className="diy-study-details__quota-count">
            {study.quotas?.length || 0} quotas
          </span>
        </div>

        {Array.isArray(study.quotas) && study.quotas.length > 0 ? (
          <div className="diy-study-details__quota-table-wrap">
            <table className="diy-study-details__quota-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Category</th>
                  <th>Target Completes</th>
                </tr>
              </thead>

              <tbody>
                {study.quotas.map((quota) => (
                  <tr key={quota.id}>
                    <td>{formatLabel(quota.attribute)}</td>
                    <td>{quota.category}</td>
                    <td>{quota.target_completes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No specific sample quotas were provided.</p>
        )}
      </section>

      {/* Manual Feasibility Assessment */}
      <section className="diy-study-details__section">
        <div className="diy-study-details__section-heading">
          <div>
            <h2>Manual Feasibility Assessment</h2>
            <p>Internal assessment recorded by the admin team.</p>
          </div>

          {hasAssessment && (
            <span className="diy-study-details__quota-count">
              {formatLabel(study.assessment_status)}
            </span>
          )}
        </div>

        {hasAssessment ? (
          <>
            <div className="diy-study-details__audience-grid">
              <div className="diy-study-details__audience-field">
                <span>Feasibility Status</span>
                <strong>
                  {formatLabel(study.assessment_status)}
                </strong>
              </div>

              <div className="diy-study-details__audience-field">
                <span>Proposed Completes</span>
                <strong>{study.proposed_completes ?? "—"}</strong>
              </div>

              <div className="diy-study-details__audience-field">
                <span>Estimated Timeline</span>
                <strong>
                  {study.estimated_timeline_days != null
                    ? `${study.estimated_timeline_days} days`
                    : "—"}
                </strong>
              </div>

              <div className="diy-study-details__audience-field">
                <span>Estimated Budget</span>
                <strong>
                  {study.estimated_budget != null
                    ? `INR ${Number(study.estimated_budget).toLocaleString("en-IN")}`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="diy-study-details__assessment-notes">
              <strong>Assessment Notes</strong>
              <p>
                {study.assessment_notes || "No assessment notes provided."}
              </p>
            </div>
          </>
        ) : (
          <p>No manual feasibility assessment has been recorded yet.</p>
        )}
      </section>

      {/* Survey Link Verification */}
      <section className="diy-study-details__section">
        <div className="diy-study-details__section-heading">
          <div>
            <h2>Survey Link Verification</h2>
            <p>
              Review the survey URL confirmed or submitted by the client.
            </p>
          </div>

          <span className="diy-study-details__quota-count">
            {formatLabel(study.survey_link_status)}
          </span>
        </div>

        {study.confirmed_survey_link ? (
          <>
            <div className="diy-study-details__assessment-notes">
              <strong>Client's confirmed survey URL</strong>

              <p>
                <a
                  href={study.confirmed_survey_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {study.confirmed_survey_link}
                </a>
              </p>
            </div>

            {study.survey_link_status === "pending_validation" && (
              <div className="diy-study-details__project-actions">
                <button
                  type="button"
                  className="diy-study-details__project-link"
                  onClick={() => handleSurveyLinkReview("validate")}
                  disabled={reviewingSurveyLink}
                >
                  {reviewingSurveyLink ? "Processing..." : "Validate Survey URL"}
                </button>

                <button
                  type="button"
                  className="diy-study-details__project-link"
                  onClick={() => handleSurveyLinkReview("request_changes")}
                  disabled={reviewingSurveyLink}
                >
                  {reviewingSurveyLink ? "Processing..." : "Request Changes"}
                </button>
              </div>
            )}

            {study.survey_link_status === "validated" && (
              <p> This survey URL has been validated by the admin.</p>
            )}

            {study.survey_link_status === "changes_requested" && (
              <p>Changes have been requested. Awaiting an updated survey URL from the client.</p>
            )}
          </>
        ) : (
          <p>
            Awaiting client survey URL. The client has not submitted or confirmed
            a survey URL yet.
          </p>
        )}
      </section>

      <section className="diy-study-details__section">
        <h2>Quotation History</h2>

        {quotationsLoading ? (
          <p>Loading quotations...</p>
        ) : quotations.length === 0 ? (
          <p>No quotations have been created for this study yet.</p>
        ) : (
          <div className="diy-study-details__quotations">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="diy-study-details__quotation-card"
              >
                <div className="diy-study-details__quotation-header">
                  <h3>Quotation Version {quotation.version}</h3>
                  <span className={`diy-study-details__quotation-status diy-study-details__quotation-status--${quotation.status}`}>
                    {formatLabel(quotation.status)}
                  </span>
                </div>

                <div className="diy-study-details__quotation-grid">
                  <div>
                    <strong>Quoted Amount</strong>
                    <p>
                      {quotation.currency} {quotation.quoted_amount}
                    </p>
                  </div>

                  <div>
                    <strong>Proposed Completes</strong>
                    <p>{quotation.proposed_completes}</p>
                  </div>

                  <div>
                    <strong>Estimated Timeline</strong>
                    <p>{quotation.estimated_timeline_days} days</p>
                  </div>

                  <div>
                    <strong>Created At</strong>
                    <p>{formatDate(quotation.created_at)}</p>
                  </div>

                  <div>
                    <strong>Sent At</strong>
                    <p>{formatDate(quotation.sent_at)}</p>
                  </div>

                  <div>
                    <strong>Responded At</strong>
                    <p>{formatDate(quotation.responded_at)}</p>
                  </div>
                </div>

                {quotation.notes && (
                  <div className="diy-study-details__quotation-notes">
                    <strong>Notes</strong>
                    <p>{quotation.notes}</p>
                  </div>
                )}

                {quotation.status === "draft" &&
                  study.status === "under_review" && (
                    <button
                      type="button"
                      className="diy-study-details__project-link"
                      onClick={() => handleSendQuotation(quotation.id)}
                      disabled={sendingQuotationId === quotation.id}
                    >
                      {sendingQuotationId === quotation.id
                        ? "Sending..."
                        : "Send Quotation to Client"}
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
