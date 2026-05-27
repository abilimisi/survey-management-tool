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

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Clients</h1>
          <p>Manage survey clients</p>
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
              <th>Client Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>

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
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientsList;