import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getPendingVendorApplications,
  reviewVendorApplication,
} from "../../api/vendorAdminApi";
import "./VendorApplications.css";

function VendorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadApplications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getPendingVendorApplications();
      setApplications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      const data = error.response?.data;
      toast.error(
        data?.detail ||
          data?.error ||
          "Unable to load vendor applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);


    const handleDecision = async (application, action) => {
    if (application.application_status !== "pending") {
        toast.info("This application has already been reviewed.");
        return;
    }

    const actionLabel = action === "approve" ? "approve" : "reject";
    let adminNote = "";

    if (action === "reject") {
        adminNote = window.prompt(
        `Enter the rejection reason for ${application.company_name}:`
        );

        // Cancel was clicked.
        if (adminNote === null) return;

        adminNote = adminNote.trim();

        if (!adminNote) {
        toast.error("Please enter a rejection reason.");
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
            `Application ${actionLabel}d successfully.`
        );

        setSelectedApplication(null);
        await loadApplications();
    } catch (error) {
        const data = error.response?.data;

        toast.error(
        data?.detail ||
            data?.error ||
            `Unable to ${actionLabel} this application.`
        );
    } finally {
        setProcessingId(null);
    }
    };


  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const getStatus = (application) =>
    (application.application_status || "pending").toLowerCase();

  const counts = {
    all: applications.length,
    pending: applications.filter(
      (application) => getStatus(application) === "pending"
    ).length,
    approved: applications.filter(
      (application) => getStatus(application) === "approved"
    ).length,
    rejected: applications.filter(
      (application) => getStatus(application) === "rejected"
    ).length,
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter(
          (application) => getStatus(application) === statusFilter
        );

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
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="va-summary">
        <button
          type="button"
          className={statusFilter === "all" ? "va-summary-card selected" : "va-summary-card"}
          onClick={() => setStatusFilter("all")}
        >
          <span>Total Applications</span>
          <strong>{counts.all}</strong>
        </button>

        <button
          type="button"
          className={statusFilter === "pending" ? "va-summary-card selected" : "va-summary-card"}
          onClick={() => setStatusFilter("pending")}
        >
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </button>

        <button
          type="button"
          className={statusFilter === "approved" ? "va-summary-card selected" : "va-summary-card"}
          onClick={() => setStatusFilter("approved")}
        >
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </button>

        <button
          type="button"
          className={statusFilter === "rejected" ? "va-summary-card selected" : "va-summary-card"}
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
              ? "No submitted applications"
              : `No ${statusFilter} applications`}
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
              {filteredApplications.map((application) => {
                const status = getStatus(application);

                return (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.company_name}</strong>
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
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    <td>
                      <div className="va-actions">
                        <button
                          type="button"
                          className="va-view-button"
                          onClick={() => setSelectedApplication(application)}
                        >
                          View
                        </button>

                        {status === "pending" && (
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
                  getStatus(selectedApplication).toUpperCase(),
                ],
                [
                "Admin rejection note",
                selectedApplication.admin_note || "No rejection note",
                ],
                [
                  "Linked vendor ID",
                  selectedApplication.vendor ?? "—",
                ],
              ].map(([label, value]) => (
                <div className="va-detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}
            </div>

            {getStatus(selectedApplication) === "pending" && (
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
                  className="va-approve-button"
                  disabled={processingId !== null}
                  onClick={() =>
                    handleDecision(selectedApplication, "approve")
                  }
                >
                  Approve Vendor
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