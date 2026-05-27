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

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Vendors</h1>
          <p>Manage suppliers and their redirect links</p>
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
              <th>CPC</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.email || "-"}</td>
                <td>{vendor.contact_person || "-"}</td>
                <td>{vendor.cpc}</td>
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
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(vendor.id)}
                    >
                      <Trash2 size={16} />
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