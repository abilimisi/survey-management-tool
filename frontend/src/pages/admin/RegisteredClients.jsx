import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  Building2,
  UserCheck,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import { getRegisteredClients } from "../../api/diyAdminApi";
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
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "C";
};

export default function RegisteredClients() {
  const [data, setData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getRegisteredClients({
        page,
        pageSize: 10,
        search,
        status,
      });

      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load registered clients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(loadClients, 350);
    return () => clearTimeout(timer);
  }, [loadClients]);

  const clients = data.results || [];
  const activeCount = clients.filter((client) => client.is_active).length;
  const verifiedCount = clients.filter(
    (client) => client.is_email_verified
  ).length;

  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 10));

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="registered-directory">
      <div className="directory-heading">
        <div>
          <div className="directory-eyebrow">DIY MANAGEMENT / CLIENTS</div>
          <h1>Registered Clients</h1>
          <p>
            View and manage companies that have created a DIY client account.
          </p>
        </div>

        <button
          className="directory-refresh"
          onClick={loadClients}
          disabled={loading}
          title="Refresh clients"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="directory-stats">
        <div className="directory-stat-card">
          <div className="stat-icon stat-icon-blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total registered clients</span>
            <strong>{data.count || 0}</strong>
            <small>All client accounts</small>
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
            <Mail size={21} />
          </div>
          <div>
            <span>Email verified on this page</span>
            <strong>{verifiedCount}</strong>
            <small>Verified email addresses</small>
          </div>
        </div>
      </div>

      <div className="directory-panel">
        <div className="directory-panel-header">
          <div>
            <h2>Client directory</h2>
            <p>Registered DIY client accounts and their company details.</p>
          </div>

          <span className="directory-total">
            {data.count || 0} records
          </span>
        </div>

        <div className="directory-toolbar">
          <div className="directory-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search name, email or company..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>

          <select
            className="directory-select"
            value={status}
            onChange={(event) => handleStatus(event.target.value)}
          >
            <option value="">All account statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="directory-error">
            <AlertCircle size={18} />
            {error}
            <button onClick={loadClients}>Retry</button>
          </div>
        )}

        <div className="directory-table-wrap">
          <table className="directory-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>COMPANY</th>
                <th>EMAIL</th>
                <th>MEMBERSHIP</th>
                <th>REGISTERED</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="directory-message">
                    <RefreshCw className="spin" size={20} />
                    <span>Loading registered clients...</span>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="directory-message">
                    <Users size={25} />
                    <strong>No clients found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="directory-person">
                        <div className="directory-avatar">
                          {getInitials(client.first_name, client.last_name)}
                        </div>
                        <div>
                          <strong>
                            {client.first_name} {client.last_name}
                          </strong>
                          <small>Client ID: #{client.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="directory-company">
                        <Building2 size={16} />
                        <span>
                          {client.companies?.length
                            ? client.companies.map((company) => company.name).join(", ")
                            : "—"}
                        </span>
                      </div>
                    </td>

                    <td className="directory-email">{client.email}</td>

                    <td>
                      <div className="directory-memberships">
                        {client.companies?.length
                          ? client.companies.map((company) => (
                              <span
                                className="directory-role"
                                key={company.id}
                              >
                                {company.role || "Member"}
                              </span>
                            ))
                          : "—"}
                      </div>
                    </td>

                    <td>
                      <div className="directory-date">
                        <CalendarDays size={15} />
                        {formatDate(client.created_at)}
                      </div>
                    </td>

                    <td>
                      <div className="directory-status-stack">
                        <span
                          className={`status-pill ${
                            client.is_active ? "status-active" : "status-inactive"
                          }`}
                        >
                          <span className="status-dot" />
                          {client.is_active ? "Active" : "Inactive"}
                        </span>

                        {/* <span
                          className={`verification-label ${
                            client.is_email_verified
                              ? "verification-verified"
                              : "verification-pending"
                          }`}
                        >
                          {client.is_email_verified
                            ? "Email verified"
                            : "Email not verified"}
                        </span> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="directory-pagination">
          <span>
            Showing {clients.length ? (page - 1) * 10 + 1 : 0}–
            {(page - 1) * 10 + clients.length} of {data.count || 0} clients
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
        </div>
      </div>
    </div>
  );
}