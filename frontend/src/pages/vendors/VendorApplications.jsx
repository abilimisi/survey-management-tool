
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getPendingVendorApplications,
  reviewVendorApplication,
} from "../../api/vendorAdminApi";
import "./VendorApplications.css";
import { Eye } from "lucide-react";
import { RefreshCw } from "lucide-react";

function VendorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const loadApplications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getPendingVendorApplications();
      setApplications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const data = error.response?.data;
      toast.error(
        data?.detail || data?.error || "Unable to load vendor applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getStatus = (application) =>
    (application.status || "draft").toLowerCase();

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const handleDecision = async (application, action) => {
    if (!["submitted", "under_review"].includes(getStatus(application))) {
      toast.info("Only submitted applications can be reviewed.");
      return;
    }

    const actionMessages = {
      approve: { success: "approved", failure: "approve" },
      request_changes: {
        success: "changes requested for",
        failure: "request changes for",
      },
      reject: { success: "rejected", failure: "reject" },
    };

    const actionMessage = actionMessages[action];

    if (!actionMessage) {
      toast.error("Invalid application action.");
      return;
    }

    let adminNote = "";

    if (action === "request_changes" || action === "reject") {
      const promptLabel =
        action === "request_changes"
          ? "Enter the changes required"
          : "Enter the rejection reason";

      adminNote = window.prompt(
        `${promptLabel} for ${application.company_name}:`
      );

      if (adminNote === null) return;

      adminNote = adminNote.trim();

      if (!adminNote) {
        toast.error("Please enter a note.");
        return;
      }
    } else {
      const confirmed = window.confirm(
        `Are you sure you want to approve ${application.company_name}?`
      );

      if (!confirmed) return;
    }

    setProcessingId(application.id);

    try {
      const response = await reviewVendorApplication(
        application.id,
        action,
        adminNote
      );

      toast.success(
        response.data.message ||
          `Application ${actionMessage.success} successfully.`
      );

      setSelectedApplication(null);
      await loadApplications();
    } catch (error) {
      const data = error.response?.data;

      toast.error(
        data?.detail ||
          data?.error ||
          `Unable to ${actionMessage.failure} this application.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const counts = {
    all: applications.length,
    submitted: applications.filter((application) =>
      ["submitted", "under_review"].includes(getStatus(application))
    ).length,
    approved: applications.filter(
      (application) => getStatus(application) === "approved"
    ).length,
    changesRequested: applications.filter(
      (application) => getStatus(application) === "changes_requested"
    ).length,
    rejected: applications.filter(
      (application) => getStatus(application) === "rejected"
    ).length,
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((application) => {
          const status = getStatus(application);

          if (statusFilter === "submitted") {
            return ["submitted", "under_review"].includes(status);
          }

          return status === statusFilter;
        });


  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize)
  );

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startEntry =
    filteredApplications.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endEntry = Math.min(
    currentPage * pageSize,
    filteredApplications.length
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const reviewHistory = selectedApplication?.reviews || [];

  const renderLink = (value) => {
    if (!value) return <strong>—</strong>;

    const href = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    return (
      <strong>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      </strong>
    );
  };

  return (
    <div className="vendor-applications-page">
      <div className="vendor-applications-header">
        <div>
          <h1>Vendor Applications</h1>
          <p>
            Review submitted vendor profiles and track application decisions.
          </p>
        </div>

       <button
          type="button"
          className="va-refresh-button"
          onClick={loadApplications}
          disabled={loading}
          title="Refresh applications"
        >
          <RefreshCw
            size={16}
            className={loading ? "va-refresh-spin" : ""}
          />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="va-summary">
        <button
          type="button"
          className={
            statusFilter === "all"
              ? "va-summary-card selected"
              : "va-summary-card"
          }
          onClick={() => setStatusFilter("all")}
        >
          <span>Total Applications</span>
          <strong>{counts.all}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "submitted"
              ? "va-summary-card selected"
              : "va-summary-card"
          }
          onClick={() => setStatusFilter("submitted")}
        >
          <span>Submitted / Under Review</span>
          <strong>{counts.submitted}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "changes_requested"
              ? "va-summary-card selected"
              : "va-summary-card"
          }
          onClick={() => setStatusFilter("changes_requested")}
        >
          <span>Changes Requested</span>
          <strong>{counts.changesRequested}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "approved"
              ? "va-summary-card selected"
              : "va-summary-card"
          }
          onClick={() => setStatusFilter("approved")}
        >
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </button>

        <button
          type="button"
          className={
            statusFilter === "rejected"
              ? "va-summary-card selected"
              : "va-summary-card"
          }
          onClick={() => setStatusFilter("rejected")}
        >
          <span>Rejected</span>
          <strong>{counts.rejected}</strong>
        </button>
      </div>

      {loading ? (
        <div className="va-state">Loading applications...</div>
      ) : filteredApplications.length === 0 ? (
        <div className="va-state">
          <h3>
            {statusFilter === "all"
              ? "No vendor applications found"
              : `No ${formatStatus(statusFilter)} applications`}
          </h3>
          <p>Applications matching this status will appear here.</p>
        </div>
      ) : (
        <div className="va-table-wrapper">
          <table className="va-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Country</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedApplications.map((application) => {
                const status = getStatus(application);
                const canReview = ["submitted", "under_review"].includes(
                  status
                );

                return (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.company_name || "—"}</strong>
                      <span className="va-secondary">
                        {application.email}
                      </span>
                    </td>

                    <td>
                      {application.contact_number || "—"}
                      <span className="va-secondary">
                        {application.invoice_email || ""}
                      </span>
                    </td>

                    <td>{application.country || "—"}</td>
                    <td>{formatDate(application.submitted_at)}</td>

                    <td>
                      <span className={`va-status va-status-${status}`}>
                        {formatStatus(status)}
                      </span>
                    </td>

                    <td>
                      <div className="va-actions">

                        <button
                          type="button"
                          className="va-view-icon-button"
                          onClick={() => setSelectedApplication(application)}
                          title="View application"
                          aria-label="View application"
                        >
                          <Eye size={22} strokeWidth={2.2} />
                        </button>

                        {canReview && (
                          <>
                            <button
                              type="button"
                              className="va-approve-button"
                              disabled={processingId !== null}
                              onClick={() =>
                                handleDecision(application, "approve")
                              }
                            >
                              {processingId === application.id
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="va-reject-button"
                              disabled={processingId !== null}
                              onClick={() =>
                                handleDecision(application, "reject")
                              }
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              className="va-view-button"
                              disabled={processingId !== null}
                              onClick={() =>
                                handleDecision(application, "request_changes")
                              }
                            >
                              Request Changes
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

              {/* PAGINATION SECTION */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startEntry} to {endEntry} of{" "}
            {filteredApplications.length} entries
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={currentPage === 1 || loading}
              onClick={() =>
                setCurrentPage((current) => Math.max(1, current - 1))
              }
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                type="button"
                key={index}
                className={
                  currentPage === index + 1 ? "active-page" : ""
                }
                disabled={loading}
                aria-current={
                  currentPage === index + 1 ? "page" : undefined
                }
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
            >
              Next
            </button>
          </div>
        </div>

      {selectedApplication && (
        <div
          className="va-modal-backdrop"
          onClick={() => setSelectedApplication(null)}
        >
          <section
            className="va-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="va-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="va-modal-header">
              <h2 id="va-modal-title">Application Details</h2>

              <button
                type="button"
                className="va-close-button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="va-details-grid">
              {[
                ["Company", selectedApplication.company_name],
                ["Abbreviation", selectedApplication.abrv_name],
                ["Company Website", selectedApplication.company_website],
                ["Registration Number", selectedApplication.registration_number],
                ["First name", selectedApplication.first_name],
                ["Last name", selectedApplication.last_name],
                ["Email", selectedApplication.email],
                ["Contact number", selectedApplication.contact_number],
                ["Invoice email", selectedApplication.invoice_email],
                ["Tax ID", selectedApplication.tax_id],
                ["Address", selectedApplication.address],
                ["City", selectedApplication.city],
                ["State", selectedApplication.state],
                ["ZIP / Postal code", selectedApplication.zip_code],
                ["Country", selectedApplication.country],
                ["Invoicing method", selectedApplication.invoicing_method],
                [
                  "Payment terms",
                  selectedApplication.payment_terms
                    ? `${selectedApplication.payment_terms} days`
                    : "",
                ],
                ["Submitted", formatDate(selectedApplication.submitted_at)],
                [
                  "Application status",
                  formatStatus(getStatus(selectedApplication)),
                ],
                [
                  "Admin note",
                  selectedApplication.admin_note || "No admin note",
                ],
                ["Linked vendor ID", selectedApplication.vendor_id ?? "—"],
              ].map(([label, value]) => (
                <div className="va-detail-item" key={label}>
                  <span>{label}</span>

                  {label === "Company Website" && value ? (
                    renderLink(value)
                  ) : (
                    <strong>{value || "—"}</strong>
                  )}
                </div>
              ))}
            </div>

            <div className="va-capabilities-section">
              <h3>Vendor Redirect Links</h3>

              <div className="va-details-grid">
                {[
                  ["Complete Link", selectedApplication.complete_link],
                  ["Disqualify Link", selectedApplication.terminate_link],
                  ["Quota Full Link", selectedApplication.quota_full_link],
                  [
                    "Security Term Link",
                    selectedApplication.security_terminate_link,
                  ],
                ].map(([label, value]) => (
                  <div className="va-detail-item" key={label}>
                    <span>{label}</span>
                    {renderLink(value)}
                  </div>
                ))}
              </div>

              <h3>Industries</h3>
              {selectedApplication.industries?.length ? (
                <div className="va-capability-list">
                  {selectedApplication.industries.map((industry) => (
                    <span className="va-capability-chip" key={industry.id}>
                      {industry.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No industries selected.</p>
              )}

              <h3>Respondent Types</h3>
              {selectedApplication.respondent_types?.length ? (
                <div className="va-capability-list">
                  {selectedApplication.respondent_types.map((type) => {
                    const industry = selectedApplication.industries?.find(
                      (item) => item.id === type.industry_id
                    );

                    return (
                      <span className="va-capability-chip" key={type.id}>
                        {type.name}
                        {industry ? ` · ${industry.name}` : ""}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p>No respondent types selected.</p>
              )}
            </div>

            <div className="va-review-history">
              <h3>Review History</h3>

              {reviewHistory.length === 0 ? (
                <p>No review history available.</p>
              ) : (
                <div className="va-review-list">
                  {reviewHistory.map((review, index) => (
                    <div
                      className="va-review-item"
                      key={`${review.action}-${review.created_at}-${index}`}
                    >
                      <div className="va-review-heading">
                        <strong>{formatStatus(review.action)}</strong>
                        <span>{formatDate(review.created_at)}</span>
                      </div>

                      <p>{review.note || "No note provided."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {["submitted", "under_review"].includes(
              getStatus(selectedApplication)
            ) && (
              <div className="va-modal-actions">
                <button
                  type="button"
                  className="va-reject-button"
                  disabled={processingId !== null}
                  onClick={() =>
                    handleDecision(selectedApplication, "reject")
                  }
                >
                  Reject
                </button>

                <button
                  type="button"
                  className="va-view-button"
                  disabled={processingId !== null}
                  onClick={() =>
                    handleDecision(selectedApplication, "request_changes")
                  }
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  className="va-approve-button"
                  disabled={processingId !== null}
                  onClick={() =>
                    handleDecision(selectedApplication, "approve")
                  }
                >
                  {processingId === selectedApplication.id
                    ? "Processing..."
                    : "Approve Vendor"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default VendorApplications;
