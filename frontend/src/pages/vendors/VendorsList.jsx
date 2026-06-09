import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getVendors,
  deleteVendor,
} from "../../api/vendorApi";

function VendorsList() {
  const [vendors, setVendors] = useState([]);

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

  const getInvoiceLabel = (value) => {
    if (value === "monthly_basis") return "Monthly Basis";
    if (value === "project_basis") return "Project Basis";
    return "-";
  };

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
            {vendors.map((vendor) => (
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

            {vendors.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorsList;