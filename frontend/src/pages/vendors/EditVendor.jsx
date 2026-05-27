import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleVendor,
  updateVendor,
} from "../../api/vendorApi";

function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_person: "",
    complete_link: "",
    terminate_link: "",
    quota_full_link: "",
    security_terminate_link: "",
    cpc: "0.00",
    status: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendor();
  }, []);

  const fetchVendor = async () => {
    try {
      const data = await getSingleVendor(id);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        contact_person: data.contact_person || "",
        complete_link: data.complete_link || "",
        terminate_link: data.terminate_link || "",
        quota_full_link: data.quota_full_link || "",
        security_terminate_link: data.security_terminate_link || "",
        cpc: data.cpc || "0.00",
        status: data.status,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await updateVendor(id, formData);
      navigate("/vendors");
    } catch (error) {
      console.error(error.response?.data || error);
      setError(JSON.stringify(error.response?.data || "Vendor update failed"));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Edit Vendor</h1>
        <p>Update vendor redirect links and details</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form className="custom-form wide-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Complete Link</label>
          <input
            type="url"
            name="complete_link"
            value={formData.complete_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Terminate / Disqualify Link</label>
          <input
            type="url"
            name="terminate_link"
            value={formData.terminate_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Quota Full Link</label>
          <input
            type="url"
            name="quota_full_link"
            value={formData.quota_full_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Security Terminate Link</label>
          <input
            type="url"
            name="security_terminate_link"
            value={formData.security_terminate_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>CPC</label>
          <input
            type="number"
            step="0.01"
            name="cpc"
            value={formData.cpc}
            onChange={handleChange}
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />

          <label>Active</label>
        </div>

        <button type="submit" className="primary-btn">
          Update Vendor
        </button>
      </form>
    </div>
  );
}

export default EditVendor;