
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
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

  const openReview = (study) => {
    setSelectedStudy(study);
    setReviewNotes("");
  };

  const closeReview = () => {
    if (busyId !== null) return;

    setSelectedStudy(null);
    setReviewNotes("");
  };

  const handleReview = async (event) => {
    event.preventDefault();

    if (!selectedStudy) return;

    const notes = reviewNotes.trim();

    if (!notes) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    const studyId = selectedStudy.id;
    setBusyId(studyId);

    try {
      const response = await reviewStudy(studyId, {
        action: "reject",
        review_notes: notes,
      });

      toast.success(
        response.data.message ||
          "Study rejected successfully."
      );

      setSelectedStudy(null);
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
            Review submitted studies and return them for
            changes when required.
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
                    <strong>
                      {study.name || "Untitled study"}
                    </strong>
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
                      <Link
                        to={`/diy/studies/${study.id}`}
                        className="diy-review-view-details"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="diy-review-reject"
                        onClick={() => openReview(study)}
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
              Reject study
            </h2>

            <p>
              <strong>
                {selectedStudy.name || "Untitled study"}
              </strong>
            </p>

            <form onSubmit={handleReview}>
              <label htmlFor="diy-review-notes">
                Reason for rejection (required)
              </label>

              <textarea
                id="diy-review-notes"
                value={reviewNotes}
                onChange={(event) =>
                  setReviewNotes(event.target.value)
                }
                placeholder="Explain why the study is being rejected or describe the changes required..."
                required
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
                  className="diy-review-confirm-reject"
                  disabled={busyId !== null}
                >
                  {busyId !== null
                    ? "Processing..."
                    : "Confirm and return for changes"}
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
