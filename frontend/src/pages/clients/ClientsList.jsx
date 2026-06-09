import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getClients,
  deleteClient,
} from "../../api/clientApi";

function ClientsList() {
  const [clients, setClients] = useState([]);

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
            {clients.map((client) => (
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
    </div>
  );
}

export default ClientsList;