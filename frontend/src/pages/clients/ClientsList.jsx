import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getClients,
  deleteClient,
} from "../../api/clientApi";

function ClientsList() {

  const [clients, setClients] = useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    id: "",
    companyType: "",
    companyName: "",
    country: "",
    status: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      id: "",
      companyType: "",
      companyName: "",
      country: "",
      status: "",
    });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) return;

    try {
      await deleteClient(id);
      fetchClients();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleReset = () => {

    const emptyFilters = {
      id: "",
      companyType: "",
      companyName: "",
      country: "",
      status: "",
    };

  setFilters(emptyFilters);
  setAppliedFilters(emptyFilters);
  setCurrentPage(1);
};

  const getCompanyTypeLabel = (type) => {
    if (type === "client") return "Client";

    if (type === "internal_company")
      return "Internal Company";

    if (type === "affiliate_partner")
      return "Affiliates Partner";

    if (type === "api_partner")
      return "API Partner";

    if (type === "router_partner")
      return "Router Partner";

    return type || "-";
  };


  const filteredClients = clients.filter(
    (client) => {

      const matchesId =
        !appliedFilters.id ||
        String(client.id).includes(
          appliedFilters.id
        );

      const matchesType =
        !appliedFilters.companyType ||
        client.company_type ===
          appliedFilters.companyType;

      const matchesName =
        !appliedFilters.companyName ||
        client.name
          ?.toLowerCase()
          .includes(
            appliedFilters.companyName.toLowerCase()
          );

      const matchesCountry =
        !appliedFilters.country ||
        client.country
          ?.toLowerCase()
          .includes(
            appliedFilters.country.toLowerCase()
          );

      const matchesStatus =
        !appliedFilters.status ||
        String(client.status) ===
          appliedFilters.status;

      return (
        matchesId &&
        matchesType &&
        matchesName &&
        matchesCountry &&
        matchesStatus
      );
    }
  );

  const indexOfLastRow =
  currentPage * rowsPerPage;

  const indexOfFirstRow =
    indexOfLastRow - rowsPerPage;

  const currentClients =
    filteredClients.slice(
      indexOfFirstRow,
      indexOfLastRow
    );

  const totalPages = Math.ceil(
    filteredClients.length / rowsPerPage
  );

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Clients</h1>
          <p>Manage client company details</p>
        </div>

        <Link to="/clients/add" className="primary-btn">
          <Plus size={18} />
          Add Client
        </Link>
      </div>

      <div className="search-panel">

        <input
          type="text"
          name="id"
          placeholder="ID"
          value={filters.id}
          onChange={handleFilterChange}
        />

        <select
          name="companyType"
          value={filters.companyType}
          onChange={handleFilterChange}
        >
          <option value="">
            Company Type
          </option>

          <option value="client">
            Client
          </option>

          <option value="internal_company">
            Internal Company
          </option>

          <option value="affiliate_partner">
            Affiliate Partner
          </option>

          <option value="api_partner">
            API Partner
          </option>

          <option value="router_partner">
            Router Partner
          </option>
        </select>

        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={filters.companyName}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={filters.country}
          onChange={handleFilterChange}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">
            All Status
          </option>

          <option value="true">
            Active
          </option>

          <option value="false">
            Inactive
          </option>
        </select>

      </div>

      <div className="search-actions">

        <button
          className="submit-btn"
          type="button"
          onClick={handleSubmit}
        >
          Submit
        </button>

        <button
          className="reset-btn"
          type="button"
          onClick={handleReset}
        >
          Reset
        </button>

      </div>

      <hr className="project-divider" />

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company Type</th>
              <th>Company Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentClients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>

                <td>{getCompanyTypeLabel(client.company_type)}</td>

                <td>{client.name || "-"}</td>

                <td>{client.email || "-"}</td>

                <td>{client.contact_number || "-"}</td>

                <td>{client.country || "-"}</td>

                <td>
                  <span
                    className={
                      client.status
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {client.status ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <Link
                      to={`/clients/edit/${client.id}`}
                      className="edit-btn"
                      title="Edit Client"
                    >
                      <Pencil size={14} strokeWidth={2} />
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(client.id)}
                      title="Delete Client"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination-container">

        <div className="pagination-info">

          Showing {indexOfFirstRow + 1} to{" "}
          {Math.min(
            indexOfLastRow,
            filteredClients.length
          )} of {filteredClients.length} entries

        </div>

        <div className="pagination-controls">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
          >
            Previous
          </button>

          {[...Array(totalPages)].map(
            (_, index) => (
              <button
                key={index + 1}
                className={
                  currentPage === index + 1
                    ? "active-page"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </button>
            )
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}

export default ClientsList;