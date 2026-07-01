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
  const isSuperUser =
    localStorage.getItem("is_superuser") === "true";

  const [currentPage, setCurrentPage] =
  useState(1);

  const [filters, setFilters] = useState({
    country: "",
    contactType: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      country: "",
      contactType: "",
    });

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
      country: "",
      contactType: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  const getStatusLabel = (status) => {
    return status === "active"
      ? "Active"
      : "Disabled";
  };

  const filteredContacts =
    contacts.filter((contact) => {

      const matchesCountry =
        !appliedFilters.country ||
        contact.country
          ?.trim()
          .toLowerCase() ===
        appliedFilters.country
          .trim()
          .toLowerCase();

      const matchesType =
        !appliedFilters.contactType ||
        contact.contact_type
          ?.trim()
          .toLowerCase() ===
        appliedFilters.contactType
          .trim()
          .toLowerCase();

      return (
        matchesCountry &&
        matchesType
      );
    });


    // Pagination

    const recordsPerPage = 10;

    const indexOfLastRecord =
      currentPage * recordsPerPage;

    const indexOfFirstRecord =
      indexOfLastRecord - recordsPerPage;

    const currentContacts =
      filteredContacts.slice(
        indexOfFirstRecord,
        indexOfLastRecord
      );

    const totalPages = Math.ceil(
      filteredContacts.length /
        recordsPerPage
    );


  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Company Contacts</h2>
          <p>Manage client contact persons</p>
        </div>

        <Link
          to="/company-contacts/add"
          className="btn btn-primary"
        >
          + Add Contact
        </Link>
      </div>

      <div className="search-panel">

        <select
          name="country"
          value={filters.country}
          onChange={handleFilterChange}
        >
          <option value="">
            Select Country
          </option>

          {[...new Set(
            contacts.map(
              (contact) => contact.country
            )
          )].map((country) => (

            <option
              key={country}
              value={country}
            >
              {country}
            </option>

          ))}
        </select>

        <select
          name="contactType"
          value={filters.contactType}
          onChange={handleFilterChange}
        >
          <option value="">
            Contact Type
          </option>

          {[...new Set(
            contacts.map(
              (contact) =>
                contact.contact_type
            )
          )].map((type) => (

            <option
              key={type}
              value={type}
            >
              {type}
            </option>

          ))}
        </select>

      </div>

      <div className="search-actions">
      
        <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          Submit
        </button>

        <button
          className="reset-btn"
          onClick={handleReset}
        >
          Reset
        </button>

      </div>

      <hr className="project-divider" />

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
            {currentContacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.full_name || "-"}</td>

                <td>
                  {contact.contact_type || "-"}
                </td>

                <td>
                  {contact.client_name || "-"}
                </td>

                <td>
                  {contact.contact_no || "-"}
                </td>

                <td>
                  {contact.email || "-"}
                </td>

                <td>
                  {contact.country || "-"}
                </td>

                <td>
                  <span
                    className={
                      contact.status === "active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {getStatusLabel(
                      contact.status
                    )}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <Link
                      to={`/company-contacts/edit/${contact.id}`}
                      className="edit-btn"
                      title="Edit Company Contact"
                    >
                      <Pencil
                        size={10}
                        strokeWidth={2}
                      />
                    </Link>
                    

                    {isSuperUser && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(contact.id)
                      }
                      title="Delete Company Contact"
                    >
                      <Trash2
                        size={10}
                        strokeWidth={2}
                      />
                    </button>
                  )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredContacts.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No company contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination-container">

          <div className="pagination-info">
            {filteredContacts.length > 0
              ? `Showing ${indexOfFirstRecord + 1}
                to ${Math.min(
                  indexOfLastRecord,
                  filteredContacts.length
                )}
                of ${filteredContacts.length} entries`
              : "Showing 0 to 0 of 0 entries"}
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
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
            >
              Next
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CompanyContactsList;