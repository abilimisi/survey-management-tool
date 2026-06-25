import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getVendors,
  deleteVendor,
} from "../../api/vendorApi";

function VendorsList() {

  const [vendors, setVendors] = useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    id: "",
    vendorName: "",
    country: "",
    status: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      id: "",
      vendorName: "",
      country: "",
      status: "",
    });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vendor?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVendor(id);
      fetchVendors();
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
    vendorName: "",
    country: "",
    status: "",
  };

  setFilters(emptyFilters);
  setAppliedFilters(emptyFilters);
  setCurrentPage(1);
};

  const getInvoiceLabel = (value) => {
    if (value === "monthly_basis") return "Monthly Basis";
    if (value === "project_basis") return "Project Basis";
    return "-";
  };

  const filteredVendors = vendors.filter(
  (vendor) => {

    const matchesId =
      !appliedFilters.id ||
      String(vendor.id).includes(
        appliedFilters.id
      );

    const matchesVendor =
      !appliedFilters.vendorName ||
      vendor.name
        ?.toLowerCase()
        .includes(
          appliedFilters.vendorName.toLowerCase()
        );

    const matchesCountry =
      !appliedFilters.country ||
      vendor.country
        ?.toLowerCase()
        .includes(
          appliedFilters.country.toLowerCase()
        );

    const matchesStatus =
      !appliedFilters.status ||
      String(vendor.status) ===
        appliedFilters.status;

    return (
      matchesId &&
      matchesVendor &&
      matchesCountry &&
      matchesStatus
    );
  }
);

const indexOfLastRow =
  currentPage * rowsPerPage;

const indexOfFirstRow =
  indexOfLastRow - rowsPerPage;

const currentVendors =
  filteredVendors.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

const totalPages = Math.ceil(
  filteredVendors.length / rowsPerPage
);

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Vendors</h1>
          <p>Manage supplier company details and redirect links</p>
        </div>

        <Link to="/vendors/add" className="primary-btn">
          <Plus size={18} />
          Add Vendor
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

        <input
          type="text"
          name="vendorName"
          placeholder="Vendor Name"
          value={filters.vendorName}
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
              <th>Vendor Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>

                <td>{vendor.name || "-"}</td>

                <td>{vendor.email || "-"}</td>

                <td>{vendor.contact_number || "-"}</td>

                <td>{vendor.country || "-"}</td>

                <td>
                  <span
                    className={
                      vendor.status
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {vendor.status ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <Link
                      to={`/vendors/edit/${vendor.id}`}
                      className="edit-btn"
                      title="Edit Vendor"
                    >
                       <Pencil size={14} strokeWidth={2} />
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(vendor.id)}
                      title="Delete Vendor"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      <div className="pagination-container">

        <div className="pagination-info">

          Showing {filteredVendors.length === 0
            ? 0
            : indexOfFirstRow + 1}
          {" "}to{" "}
          {Math.min(
            indexOfLastRow,
            filteredVendors.length
          )}
          {" "}of{" "}
          {filteredVendors.length}
          {" "}entries

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
              currentPage === totalPages ||
              totalPages === 0
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
  );
}

export default VendorsList;