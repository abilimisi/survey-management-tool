import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ClientForm.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getSingleClient,
  updateClient,
} from "../../api/clientApi";

function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_type: "client",
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
    status: true,
    check_proxy: true,
    is_diy: true,
    test_link: "",
    live_link: "",
    rid_parameter: "RID",
    our_parameter: "ID",
    api_details: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const data = await getSingleClient(id);

      setFormData({
        company_type: data.company_type || "client",
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
        status: data.status ?? true,
        check_proxy: data.check_proxy ?? true,
        is_diy: data.is_diy ?? true,
        test_link: data.test_link || "",
        live_link: data.live_link || "",
        rid_parameter: data.rid_parameter || "RID",
        our_parameter: data.our_parameter || "ID",
        api_details: data.api_details || "",
      });
    } catch (error) {
      console.error(error);
      setError("Failed to load client details.");
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
    await updateClient(id, formData);

    toast.success("Client updated successfully!");

    setTimeout(() => {
      navigate("/clients");
    }, 1200);

  } catch (error) {
    console.error(error.response?.data || error);

    setError(
      JSON.stringify(error.response?.data || "Update failed")
    );

    toast.error("Update failed!");
  }
};
  return (
    <div>
      <div className="page-header">
        <h1>Edit Client</h1>
        <p>Update client company details</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="company-form-layout">
        <div className="form-card">
          <div className="form-grid-3">
            <div className="form-group">
              <label>Company Type</label>
              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
              >
                <option value="client">Client</option>

                <option value="internal_company">
                  Internal Company
                </option>

                <option value="affiliate_partner">
                  Affiliates Partner
                </option>

                <option value="api_partner">
                  API Partner
                </option>

                <option value="router_partner">
                  Router Partner
                </option>
              </select>
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
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              <label>Status Active</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                name="check_proxy"
                checked={formData.check_proxy}
                onChange={handleChange}
              />
              <label>Check Proxy</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                name="is_diy"
                checked={formData.is_diy}
                onChange={handleChange}
              />
              <label>Is DIY</label>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-btn create-client-btn">
              Update Client
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditClient;