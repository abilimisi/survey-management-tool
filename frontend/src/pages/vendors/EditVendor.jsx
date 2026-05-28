import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleVendor,
  updateVendor,
} from "../../api/vendorApi";

import "./VendorForm.css";

function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    abrv_name: "",
    contact_number: "",
    email: "",
    invoice_email: "",
    tax_id: "",
    address: "",
    invoicing_method: "",
    payment_terms: "",
    city: "",
    zip_code: "",
    country: "",
    state: "",
    complete_link: "",
    terminate_link: "",
    quota_full_link: "",
    security_terminate_link: "",
    api_details: "",
    s2s_token: "",
    cpc: "0.00",
    status: true,
    check_proxy: true,
    is_diy: true,
  });

  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("end_links");

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const data = await getSingleVendor(id);

      setFormData({
        name: data.name || "",
        abrv_name: data.abrv_name || "",
        contact_number: data.contact_number || "",
        email: data.email || "",
        invoice_email: data.invoice_email || "",
        tax_id: data.tax_id || "",
        address: data.address || "",
        invoicing_method: data.invoicing_method || "",
        payment_terms: data.payment_terms || "",
        city: data.city || "",
        zip_code: data.zip_code || "",
        country: data.country || "",
        state: data.state || "",
        complete_link: data.complete_link || "",
        terminate_link: data.terminate_link || "",
        quota_full_link: data.quota_full_link || "",
        security_terminate_link: data.security_terminate_link || "",
        api_details: data.api_details || "",
        s2s_token: data.s2s_token || "",
        cpc: data.cpc || "0.00",
        status: data.status ?? true,
        check_proxy: data.check_proxy ?? true,
        is_diy: data.is_diy ?? true,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to load vendor details.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const copyText = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...formData,
    };

    delete payload.s2s_token;

    try {
      await updateVendor(id, payload);
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
        <p>Update vendor company details and redirect links</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="vendor-form-layout">
        <div className="vendor-left-card">
          <div className="form-grid-3">
            <div className="form-group">
              <label>Company Type</label>
              <input type="text" value="Vendor" disabled />
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>ABRV Name</label>
              <input
                type="text"
                name="abrv_name"
                value={formData.abrv_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Invoice Email</label>
              <input
                type="email"
                name="invoice_email"
                value={formData.invoice_email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Company Tax ID</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Invoicing Method</label>
              <select
                name="invoicing_method"
                value={formData.invoicing_method}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="monthly_basis">Monthly Basis</option>
                <option value="project_basis">Project Basis</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Terms</label>
              <select
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
              >
                <option value="">Select days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="45">45 Days</option>
                <option value="60">60 Days</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value === "true",
                  })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Check Proxy?</label>
              <select
                name="check_proxy"
                value={formData.check_proxy ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    check_proxy: e.target.value === "true",
                  })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Is DIY?</label>
              <select
                name="is_diy"
                value={formData.is_diy ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_diy: e.target.value === "true",
                  })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
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

          <div className="vendor-form-actions">
            <button type="submit" className="primary-btn">
              Update
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/vendors")}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="vendor-right-card">
          <div className="vendor-tabs">
            <button
              type="button"
              className={activeTab === "end_links" ? "active" : ""}
              onClick={() => setActiveTab("end_links")}
            >
              End Links
            </button>

            <button
              type="button"
              className={activeTab === "api_details" ? "active" : ""}
              onClick={() => setActiveTab("api_details")}
            >
              API Details
            </button>
          </div>

          {activeTab === "end_links" && (
            <div>
              <div className="form-group">
                <label>Complete Link</label>
                <textarea
                  name="complete_link"
                  value={formData.complete_link}
                  onChange={handleChange}
                  placeholder="https://vendor.com/complete?pid={{ID}}"
                />
              </div>

              <div className="form-group">
                <label>Disqualify Link</label>
                <textarea
                  name="terminate_link"
                  value={formData.terminate_link}
                  onChange={handleChange}
                  placeholder="https://vendor.com/terminate?pid={{ID}}"
                />
              </div>

              <div className="form-group">
                <label>Quotafull Link</label>
                <textarea
                  name="quota_full_link"
                  value={formData.quota_full_link}
                  onChange={handleChange}
                  placeholder="https://vendor.com/quota-full?pid={{ID}}"
                />
              </div>

              <div className="form-group">
                <label>Security Term Link</label>
                <textarea
                  name="security_terminate_link"
                  value={formData.security_terminate_link}
                  onChange={handleChange}
                  placeholder="https://vendor.com/security?pid={{ID}}"
                />
              </div>
            </div>
          )}

          {activeTab === "api_details" && (
            <div>
              <div className="form-group">
                <label>API Details</label>
                <textarea
                  name="api_details"
                  value={formData.api_details}
                  onChange={handleChange}
                  placeholder="Enter API details here"
                />
              </div>

              <div className="form-group">
                <label>S2S Token</label>
                <textarea
                  value={formData.s2s_token}
                  readOnly
                  className="readonly-textarea"
                />
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={() => copyText(formData.s2s_token)}
              >
                Copy S2S Token
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditVendor;