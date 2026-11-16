import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  Store,
  UserCheck,
  FileCheck2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  AlertCircle,
} from "lucide-react";

import { getRegisteredVendors } from "../../api/diyAdminApi";
import "./RegisteredDirectory.css";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "V";
};

const statusLabel = (value) => {
  const labels = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under review",
    changes_requested: "Changes requested",
    approved: "Approved",
    rejected: "Rejected",
    not_created: "No application",
  };

  return labels[value] || value || "Unknown";
};

const statusClass = (value) => {
  const classes = {
    draft: "application-draft",
    submitted: "application-submitted",
    under_review: "application-review",
    changes_requested: "application-changes",
    approved: "application-approved",
    rejected: "application-rejected",
    not_created: "application-none",
  };

  return classes[value] || "application-none";
};

export default function RegisteredVendors() {
  const [data, setData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getRegisteredVendors({
        page,
        pageSize: 10,
        search,
        status,
        applicationStatus,
      });

      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load registered vendors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, applicationStatus]);

  useEffect(() => {
    const timer = setTimeout(loadVendors, 350);
    return () => clearTimeout(timer);
  }, [loadVendors]);

  const vendors = data.results || [];
  const activeCount = vendors.filter((vendor) => vendor.is_active).length;
  const approvedCount = vendors.filter(
    (vendor) => vendor.application_status === "approved"
  ).length;
  const pendingCount = vendors.filter((vendor) =>
    ["draft", "submitted", "under_review", "changes_requested"].includes(
      vendor.application_status
    )
  ).length;

  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 10));

  const resetPageAndSet = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="registered-directory">
      <div className="directory-heading">
        <div>
          <h1>Registered Vendors</h1>
          <p>
            View DIY vendor accounts, profile details and application progress.
          </p>
        </div>

        <button
          className="directory-refresh"
          onClick={loadVendors}
          disabled={loading}
          title="Refresh vendors"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="directory-stats">
        <div className="directory-stat-card">
          <div className="stat-icon stat-icon-blue">
            <Store size={21} />
          </div>
          <div>
            <span>Total registered vendors</span>
            <strong>{data.count || 0}</strong>
            <small>All vendor portal accounts</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon stat-icon-green">
            <UserCheck size={21} />
          </div>
          <div>
            <span>Active on this page</span>
            <strong>{activeCount}</strong>
            <small>Currently active accounts</small>
          </div>
        </div>

        <div className="directory-stat-card">
          <div className="stat-icon stat-icon-purple">
            <FileCheck2 size={21} />
          </div>
          <div>
            <span>Approved on this page</span>
            <strong>{approvedCount}</strong>
            <small>{pendingCount} applications in progress</small>
          </div>
        </div>
      </div>

      <div className="directory-panel">
        <div className="directory-panel-header">
          <div>
            <h2>Vendor directory</h2>
            <p>
              Vendor registration and application information in one place.
            </p>
          </div>

          <span className="directory-total">{data.count || 0} records</span>
        </div>

        <div className="directory-toolbar">
          <div className="directory-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search name, email, company or country..."
              value={search}
              onChange={(event) =>
                resetPageAndSet(setSearch, event.target.value)
              }
            />
          </div>

          <select
            className="directory-select"
            value={status}
            onChange={(event) =>
              resetPageAndSet(setStatus, event.target.value)
            }
          >
            <option value="">All account statuses</option>
            <option value="active">Active accounts</option>
            <option value="inactive">Inactive accounts</option>
          </select>

          <select
            className="directory-select"
            value={applicationStatus}
            onChange={(event) =>
              resetPageAndSet(setApplicationStatus, event.target.value)
            }
          >
            <option value="">All application statuses</option>
            <option value="not_created">No application</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="changes_requested">Changes requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && (
          <div className="directory-error">
            <AlertCircle size={18} />
            {error}
            <button onClick={loadVendors}>Retry</button>
          </div>
        )}

        <div className="directory-table-wrap">
          <table className="directory-table vendor-directory-table">
            <thead>
              <tr>
                <th>VENDOR</th>
                <th>COMPANY</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>REGISTERED</th>
                <th>APPLICATION</th>
                <th>ACCOUNT</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="directory-message">
                    <RefreshCw className="spin" size={20} />
                    <span>Loading registered vendors...</span>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="directory-message">
                    <Store size={25} />
                    <strong>No vendors found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className="directory-person">
                        <div className="directory-avatar vendor-avatar">
                          {getInitials(vendor.first_name, vendor.last_name)}
                        </div>
                        <div>
                          <strong>
                            {vendor.first_name} {vendor.last_name}
                          </strong>
                          <small>Vendor ID: #{vendor.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="directory-company">
                        <Store size={16} />
                        <span>{vendor.company_name || "Profile not completed"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="directory-contact">
                        <strong>{vendor.email}</strong>
                        <small>{vendor.contact_number || "No phone number"}</small>
                      </div>
                    </td>

                    <td>
                      <div className="directory-date">
                        <MapPin size={15} />
                        {vendor.country || "—"}
                      </div>
                    </td>

                    <td>
                      <div className="directory-date">
                        <CalendarDays size={15} />
                        {formatDate(vendor.created_at)}
                      </div>
                    </td>

                    <td>
                      <div className="directory-status-stack">
                        <span
                          className={`status-pill ${statusClass(
                            vendor.application_status
                          )}`}
                        >
                          <span className="status-dot" />
                          {statusLabel(vendor.application_status)}
                        </span>

                        <span className="verification-label">
                          {vendor.profile_submitted
                            ? `Submitted ${formatDate(vendor.submitted_at)}`
                            : "Profile not submitted"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-pill ${
                          vendor.is_active ? "status-active" : "status-inactive"
                        }`}
                      >
                        <span className="status-dot" />
                        {vendor.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* <div className="directory-pagination">
          <span>
            Showing {vendors.length ? (page - 1) * 10 + 1 : 0}–
            {(page - 1) * 10 + vendors.length} of {data.count || 0} vendors
          </span>

          <div className="pagination-actions">
            <button
              disabled={!data.previous || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span className="pagination-page">
              {page} / {totalPages}
            </span>

            <button
              disabled={!data.next || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div> */}
      </div>

      
      {/* PAGINATION SECTION */}
      <div className="pagination-container">

        <div className="pagination-info">
          Showing{" "}
          {vendors.length === 0 ? 0 : (page - 1) * 10 + 1}
          {" "}to{" "}
          {Math.min(
            (page - 1) * 10 + vendors.length,
            data.count || 0
          )}
          {" "}of{" "}
          {data.count || 0}
          {" "}entries
        </div>

        <div className="pagination-controls">

          <button
            disabled={!data.previous || loading}
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => (
              <button
                key={index}
                className={page === index + 1 ? "active-page" : ""}
                disabled={loading}
                aria-current={page === index + 1 ? "page" : undefined}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            disabled={!data.next || loading}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
}