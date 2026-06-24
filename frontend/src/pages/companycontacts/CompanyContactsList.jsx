import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCompanyContacts,
  deleteCompanyContact,
} from "../../api/companyContactApi";

import "./CompanyContacts.css";
import { Pencil, Trash2 } from "lucide-react";


function CompanyContactsList() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await getCompanyContacts();
      setContacts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Contact?")) return;

    try {
      await deleteCompanyContact(id);
      fetchContacts();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusLabel = (status) => {
    return status === "active" ? "Active" : "Disabled";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Company Contacts</h2>
          <p>Manage client contact persons</p>
        </div>

        <Link to="/company-contacts/add" className="btn btn-primary">
          + Add Contact
        </Link>
      </div>

      <div className="responsive-table-wrapper">
        <table className="custom-table company-contact-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Type</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.full_name || "-"}</td>
                <td>{contact.contact_type || "-"}</td>
                <td>{contact.client_name || "-"}</td>
                <td>{contact.contact_no || "-"}</td>
                <td>{contact.email || "-"}</td>
                <td>{contact.country || "-"}</td>

                <td>
                  <span
                    className={
                      contact.status === "active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {getStatusLabel(contact.status)}
                  </span>
                </td>

        
                <td>
                  <div className="table-actions">
                    <Link
                      to={`/company-contacts/edit/${contact.id}`}
                      className="edit-btn"
                      title="Edit Company Contact"
                    >
                      <Pencil size={10} strokeWidth={2} />
                    </Link>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(contact.id)}
                      title="Delete Company Contact"
                    >
                      <Trash2 size={10} strokeWidth={2} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}

            {contacts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No company contacts found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompanyContactsList;