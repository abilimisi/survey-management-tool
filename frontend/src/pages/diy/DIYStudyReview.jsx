
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getStudiesForReview,
  reviewStudy,
} from "../../api/diyReviewApi";
import "./DIYStudyReview.css";

function getErrorMessage(error) {
    const data = error?.response?.data;

    if (data?.error) {
      let message = data.error;

      if (data.matching_project_ids?.length) {
        message += ` Existing Project IDs: ${
          data.matching_project_ids.join(", ")
        }.`;
      }

      if (data.matching_study_ids?.length) {
        message += ` Matching Study IDs: ${
          data.matching_study_ids.join(", ")
        }.`;
      }

      if (data.matching_client_ids?.length) {
        message += ` Matching Client IDs: ${
          data.matching_client_ids.join(", ")
        }.`;
      }

      return message;
    }

    if (data?.detail) return data.detail;

    if (data && typeof data === "object") {
      return Object.values(data).flat().join(" ");
    }

    return "Something went wrong. Please try again.";
  }

function DIYStudyReview() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [action, setAction] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const loadStudies = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getStudiesForReview();
      const data = response.data;

      setStudies(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  const openReview = (study, nextAction) => {
    setSelectedStudy(study);
    setAction(nextAction);
    setReviewNotes("");
  };

  const closeReview = () => {
    if (busyId !== null) return;

    setSelectedStudy(null);
    setAction("");
    setReviewNotes("");
  };

  const handleReview = async (event) => {
    event.preventDefault();

    if (!selectedStudy || !action) return;

    const notes = reviewNotes.trim();

    if (action === "reject" && !notes) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    const studyId = selectedStudy.id;
    setBusyId(studyId);

    try {
      const response = await reviewStudy(studyId, {
        action,
        review_notes: notes,
      });

      toast.success(
        response.data.message ||
          `Study ${action === "approve" ? "approved" : "rejected"} successfully.`
      );

      setSelectedStudy(null);
      setAction("");
      setReviewNotes("");

      await loadStudies();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="diy-review-page">
      <div className="diy-review-header">
        <div>
          <h1>Client Study Reviews</h1>
          <p>
            Review submitted studies and approve or reject
            them.
          </p>
        </div>

        <button
          type="button"
          className="diy-review-refresh"
          onClick={loadStudies}
          disabled={loading || busyId !== null}
        >
          Refresh
        </button>
      </div>

      <div className="diy-review-summary">
        <div>
          <span>Awaiting review</span>
          <strong>{studies.length}</strong>
        </div>
      </div>

      {loading ? (
        <p className="diy-review-message">
          Loading studies...
        </p>
      ) : studies.length === 0 ? (
        <div className="diy-review-empty">
          <h3>No studies awaiting review</h3>
          <p>
            Submitted client studies will appear here.
          </p>
        </div>
      ) : (
        <div className="diy-review-table-wrapper">
          <table className="diy-review-table">
            <thead>
              <tr>
                <th>Study</th>
                <th>Company</th>
                <th>Study type</th>
                <th>Country</th>
                <th>Target</th>
                <th>Status</th>
                <th>Project Reference</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {studies.map((study) => (
                <tr key={study.id}>
                  <td>
                    <strong>{study.name || "Untitled study"}</strong>
                    <small>Study #{study.id}</small>
                  </td>

                  <td>
                    {study.company_name ||
                      study.company?.name ||
                      study.company ||
                      "—"}
                  </td>

                  <td>{study.study_type || "—"}</td>
                  <td>{study.country || "—"}</td>
                  <td>{study.target_completes ?? "—"}</td>

                  <td>
                    <span className="diy-review-status">
                      {(study.status || "unknown")
                        .replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>
                    {study.project_reference || "—"}
                  </td>

                  <td>
                    <div className="diy-review-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openReview(study, "approve")
                        }
                        disabled={busyId !== null}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        className="diy-review-reject"
                        onClick={() =>
                          openReview(study, "reject")
                        }
                        disabled={busyId !== null}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudy && (
        <div className="diy-review-modal-backdrop">
          <section
            className="diy-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="diy-review-modal-title"
          >
            <h2 id="diy-review-modal-title">
              {action === "approve"
                ? "Approve study"
                : "Reject study"}
            </h2>

            <p>
              <strong>
                {selectedStudy.name || "Untitled study"}
              </strong>
            </p>

            {action === "approve" && (
              <p>
                Approval will reuse an existing Client or create a
                new one if no match exists. The system will check
                for duplicate studies and Projects before creating
                a Project with a unique DIY reference, such as OB01.
                If a possible duplicate or ambiguous Client match is
                found, approval will be blocked for manual review.
              </p>
            )}

            <form onSubmit={handleReview}>
              <label htmlFor="diy-review-notes">
                Review notes
                {action === "reject" ? " (required)" : " (optional)"}
              </label>

              <textarea
                id="diy-review-notes"
                value={reviewNotes}
                onChange={(event) =>
                  setReviewNotes(event.target.value)
                }
                placeholder={
                  action === "reject"
                    ? "Explain why this study is being rejected..."
                    : "Add any review notes..."
                }
                required={action === "reject"}
                rows={4}
              />

              <div className="diy-review-modal-actions">
                <button
                  type="button"
                  className="diy-review-cancel"
                  onClick={closeReview}
                  disabled={busyId !== null}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    action === "reject"
                      ? "diy-review-confirm-reject"
                      : "diy-review-confirm"
                  }
                  disabled={busyId !== null}
                >
                  {busyId !== null
                    ? "Processing..."
                    : action === "approve"
                      ? "Confirm approval"
                      : "Confirm rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default DIYStudyReview;
