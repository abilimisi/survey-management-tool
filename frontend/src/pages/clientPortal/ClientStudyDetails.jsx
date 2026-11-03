
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClientProfile,
  getClientStudies,
  getClientStudyQuotations,
  respondToClientQuotation,
  submitClientSurveyLink,
} from "../../api/clientPortalApi";

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
  const [quotations, setQuotations] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [respondingQuotationId, setRespondingQuotationId] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showSurveyConfirmation, setShowSurveyConfirmation] = useState(false);
  const [surveyLinkChoice, setSurveyLinkChoice] = useState("confirm_existing");
  const [updatedSurveyLink, setUpdatedSurveyLink] = useState("");
  const [surveyLinkSubmitting, setSurveyLinkSubmitting] = useState(false);
  const [newSurveyLink, setNewSurveyLink] = useState("");

  const handleQuotationResponse = async (
    quotation,
    action,
    choice = null,
    surveyLink = ""
  ) => {
    const actionLabel = action === "accept" ? "accept" : "decline";

    if (
      action === "decline" &&
      !window.confirm(
        `Are you sure you want to decline quotation v${quotation.version}?`
      )
    ) {
      return;
    }

    setRespondingQuotationId(quotation.id);

    try {
      const response = await respondToClientQuotation(
        studyId,
        quotation.id,
        {
          action,
          ...(action === "accept"
            ? {
                survey_link_choice: choice,
                ...(choice === "update_link"
                  ? { confirmed_survey_link: surveyLink }
                  : {}),
              }
            : {}),
        }
      );

      const newQuotationStatus =
        action === "accept" ? "accepted" : "declined";

      setQuotations((previous) =>
        previous.map((item) =>
          item.id === quotation.id
            ? { ...item, status: newQuotationStatus }
            : item
        )
      );

      setStudy((previous) => ({
        ...previous,
        status:
          action === "accept" ? "client_accepted" : "client_declined",
        confirmed_survey_link: response.data.confirmed_survey_link,
        survey_link_status: response.data.survey_link_status,
      }));

      setShowSurveyConfirmation(false);
      setSelectedQuotation(null);

      toast.success(
        action === "accept"
          ? "Quotation accepted successfully."
          : "Quotation declined successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          error.response?.data?.survey_link_choice?.[0] ||
          error.response?.data?.confirmed_survey_link?.[0] ||
          "Unable to submit your quotation response."
      );
    } finally {
      setRespondingQuotationId(null);
    }
  };

  const handleSurveyLinkSubmit = async () => {
    const surveyLink = newSurveyLink.trim();

    if (!surveyLink) {
      toast.error("Please enter your survey URL.");
      return;
    }

    try {
      setSurveyLinkSubmitting(true);

      const response = await submitClientSurveyLink(
        studyId,
        surveyLink
      );

      setStudy((previous) => ({
        ...previous,
        confirmed_survey_link: response.data.confirmed_survey_link,
        survey_link_status: response.data.survey_link_status,
        status: response.data.study_status,
      }));

      setNewSurveyLink("");

      toast.success(
        response.data.message ||
          "Survey URL submitted successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          error.response?.data?.confirmed_survey_link?.[0] ||
          "Unable to submit your survey URL."
      );
    } finally {
      setSurveyLinkSubmitting(false);
    }
  };

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

        // Load quotation history when quotations are relevant to this study.
        const quotationStatuses = [
          "quote_sent",
          "client_accepted",
          "client_declined",
          "project_created",
        ];

        if (quotationStatuses.includes(foundStudy.status)) {
          setQuotationLoading(true);

          try {
            const quotationResponse = await getClientStudyQuotations(studyId);

            if (!active) return;

            const quotationData = quotationResponse.data;

            setQuotations(
              Array.isArray(quotationData.quotations)
                ? quotationData.quotations.filter(
                    (quotation) => quotation.status !== "draft"
                  )
                : []
            );
          } catch (quotationError) {
            if (active) {
              toast.error("Unable to load quotation history.");
            }
          } finally {
            if (active) setQuotationLoading(false);
          }
        } else {
          setQuotations([]);
        }

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

      {/* Sample Requirements */}
      <section className="client-detail-card client-sample-details-card">
        <p className="client-dashboard-eyebrow">TARGET AUDIENCE</p>
        <h2>Sample Requirements</h2>

        {study.sample_requirement ? (
          <div className="client-detail-grid">
            <div className="client-detail-field">
              <span>Minimum age</span>
              <strong>{study.sample_requirement.min_age ?? "—"}</strong>
            </div>

            <div className="client-detail-field">
              <span>Maximum age</span>
              <strong>{study.sample_requirement.max_age ?? "—"}</strong>
            </div>

            <div className="client-detail-field">
              <span>Gender</span>
              <strong>{formatStatus(study.sample_requirement.gender || "all")}</strong>
            </div>

            <div className="client-detail-field">
              <span>Industry</span>
              <strong>{study.sample_requirement.industry || "—"}</strong>
            </div>

            <div className="client-detail-field">
              <span>Profession</span>
              <strong>{study.sample_requirement.profession || "—"}</strong>
            </div>

            <div className="client-detail-field">
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
      <section className="client-detail-card client-sample-details-card">
        <p className="client-dashboard-eyebrow">AUDIENCE DISTRIBUTION</p>
        <h2>Sample Quotas</h2>

        {Array.isArray(study.quotas) && study.quotas.length > 0 ? (
          <div className="client-quota-details-list">
            {study.quotas.map((quota) => (
              <div className="client-quota-details-item" key={quota.id}>
                <div>
                  <span>Attribute</span>
                  <strong>{formatStatus(quota.attribute)}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{quota.category}</strong>
                </div>

                <div>
                  <span>Target completes</span>
                  <strong>{quota.target_completes}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No specific sample quotas were added.</p>
        )}
      </section>

      {["quote_sent", "client_accepted", "client_declined", "project_created"].includes(
        study.status
      ) && (
        <section className="client-detail-card client-quotation-card">
          <div className="client-quotation-heading">
            <div>
              <p className="client-dashboard-eyebrow">PRICING & APPROVAL</p>
              <h2>Quotation History</h2>
              <p className="client-detail-description">
                Review the quotations prepared for your study.
              </p>
            </div>
          </div>

          {quotationLoading ? (
            <p>Loading quotation history...</p>
          ) : quotations.length === 0 ? (
            <p>No quotations are currently available.</p>
          ) : (
            <div className="client-quotation-list">
              {quotations.map((quotation) => (
                <div
                  className="client-quotation-item"
                  key={quotation.id}
                >
                  <div className="client-quotation-item-heading">
                    <h3>Quotation v{quotation.version}</h3>

                    <span
                      className={`client-quotation-status client-quotation-status-${quotation.status}`}
                    >
                      {formatStatus(quotation.status)}
                    </span>
                  </div>

                  <div className="client-quotation-grid">
                    <div>
                      <span>Quotation amount</span>
                      <strong>
                        {quotation.currency || "INR"}{" "}
                        {Number(quotation.quoted_amount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Proposed completes</span>
                      <strong>{quotation.proposed_completes}</strong>
                    </div>

                    <div>
                      <span>Estimated timeline</span>
                      <strong>
                        {quotation.estimated_timeline_days} days
                      </strong>
                    </div>

                    <div>
                      <span>Quotation date</span>
                      <strong>
                        {quotation.sent_at
                          ? new Date(quotation.sent_at).toLocaleDateString()
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  {study.status === "quote_sent" &&
                    quotation.status === "sent" && (
                      <div className="client-quotation-actions">
                        <button
                          type="button"
                          className="client-quotation-decline"
                          disabled={respondingQuotationId === quotation.id}
                          onClick={() =>
                            handleQuotationResponse(quotation, "decline")
                          }
                        >
                          {respondingQuotationId === quotation.id
                            ? "Processing..."
                            : "Decline quotation"}
                        </button>

                        <button
                          type="button"
                          className="client-quotation-accept"
                          disabled={respondingQuotationId === quotation.id}
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setSurveyLinkChoice(
                              study.survey_link ? "confirm_existing" : "provide_later"
                            );
                            setUpdatedSurveyLink(study.survey_link || "");
                            setShowSurveyConfirmation(true);
                          }}
                        >
                          Accept quotation
                        </button>
                      </div>
                    )}

                  {quotation.notes && (

                    
                    <div className="client-quotation-notes">
                      <span>Quotation notes</span>
                      <p>{quotation.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {study.status === "changes_requested" && (
        <section className="client-detail-card client-review-card">
          <h2>Changes requested by admin</h2>
          <p>
            {study.review_notes ||
              "Please review your study and update the requested information."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/client-portal/dashboard", {
                state: { editStudyId: study.id },
              })
            }
          >
            Edit study
          </button>
        </section>
      )}

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

      {showSurveyConfirmation && selectedQuotation && (
        <div className="survey-confirmation-overlay">
          <div className="survey-confirmation-modal">
            <h2>Confirm Survey URL</h2>

            <p>
              You are accepting quotation version{" "}
              {selectedQuotation.version}.
              Please confirm how you would like to provide your survey URL.
            </p>

            <div className="survey-confirmation-options">
              <label>
                <input
                  type="radio"
                  name="surveyLinkChoice"
                  value="confirm_existing"
                  checked={surveyLinkChoice === "confirm_existing"}
                  onChange={(e) => setSurveyLinkChoice(e.target.value)}
                  disabled={!study.survey_link}
                />
                Confirm and use my existing survey URL
              </label>

              <label>
                <input
                  type="radio"
                  name="surveyLinkChoice"
                  value="update_link"
                  checked={surveyLinkChoice === "update_link"}
                  onChange={(e) => setSurveyLinkChoice(e.target.value)}
                />
                Update my survey URL
              </label>

              <label>
                <input
                  type="radio"
                  name="surveyLinkChoice"
                  value="provide_later"
                  checked={surveyLinkChoice === "provide_later"}
                  onChange={(e) => setSurveyLinkChoice(e.target.value)}
                />
                I'll provide my survey URL later
              </label>
            </div>

            {surveyLinkChoice === "confirm_existing" && (
              <div className="survey-confirmation-link">
                <strong>Existing survey URL:</strong>

                {study.survey_link ? (
                  <a
                    href={study.survey_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {study.survey_link}
                  </a>
                ) : (
                  <p>No existing survey URL is available.</p>
                )}
              </div>
            )}

            {surveyLinkChoice === "update_link" && (
              <div className="survey-confirmation-link">
                <label htmlFor="updatedSurveyLink">
                  Updated survey URL
                </label>

                <input
                  id="updatedSurveyLink"
                  type="url"
                  value={updatedSurveyLink}
                  onChange={(e) => setUpdatedSurveyLink(e.target.value)}
                  placeholder="https://your-survey-link.com"
                />
              </div>
            )}

            <div className="survey-confirmation-actions">
              <button
                type="button"
                onClick={() => {
                  setShowSurveyConfirmation(false);
                  setSelectedQuotation(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  respondingQuotationId === selectedQuotation.id ||
                  (surveyLinkChoice === "confirm_existing" && !study.survey_link) ||
                  (surveyLinkChoice === "update_link" && !updatedSurveyLink.trim())
                }
                onClick={() =>
                  handleQuotationResponse(
                    selectedQuotation,
                    "accept",
                    surveyLinkChoice,
                    updatedSurveyLink.trim()
                  )
                }
              >
                {respondingQuotationId === selectedQuotation.id
                  ? "Processing..."
                  : "Confirm and Accept Quotation"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Client Survey URL Submission */}
      {["pending_confirmation", "changes_requested"].includes(
        study.survey_link_status
      ) &&
        ["client_accepted", "project_created"].includes(study.status) && (
          <section className="client-detail-card client-review-card">
            <h2>
              {study.survey_link_status === "changes_requested"
                ? "Survey URL Changes Requested"
                : "Submit Your Survey URL"}
            </h2>

            <p>
              {study.survey_link_status === "changes_requested"
                ? "The admin has requested changes to your survey URL. Please provide an updated URL for review."
                : "Your quotation has been accepted. Please submit your survey URL so the admin can review it."}
            </p>

            <div className="survey-confirmation-link">
              <label htmlFor="newSurveyLink">
                Survey URL
              </label>

              <input
                id="newSurveyLink"
                type="url"
                value={newSurveyLink}
                onChange={(e) => setNewSurveyLink(e.target.value)}
                placeholder="https://your-survey-link.com"
              />
            </div>

            <button
              type="button"
              disabled={
                surveyLinkSubmitting || !newSurveyLink.trim()
              }
              onClick={handleSurveyLinkSubmit}
            >
              {surveyLinkSubmitting
                ? "Submitting..."
                : "Submit Survey URL"}
            </button>
          </section>
        )}
    </div>
  );
}

export default function ClientStudyDetails() {
  return <ClientStudyDetailsContent />;
}
