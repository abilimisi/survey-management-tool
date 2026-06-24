import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCompanyContact } from "../../api/companyContactApi";
import { getClients } from "../../api/clientApi";

import "./CompanyContacts.css";

function AddCompanyContact() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    contact_type: "",
    salutation: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    dob: "",
    email: "",
    contact_no: "",
    address: "",
    city: "",
    zip_code: "",
    country: "",
    state: "",
    username: "",
    status: "active",
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Client load error:", error);
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
      await createCompanyContact(formData);
      navigate("/company-contacts");
    } catch (error) {
      console.error("Contact creation error:", error);
      setError(JSON.stringify(error.response?.data || "Contact creation failed"));
    }
  };

  return (
    <div className="form-page">
      <div className="form-header">
        <div>
          <h2>Add Company Contact</h2>
          <p>Create and store client/company contact details</p>
        </div>

        <button
          type="button"
          className="btn-back"
          onClick={() => navigate("/company-contacts")}
        >
          Back
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Contact Type *</label>
          <select
            name="contact_type"
            value={formData.contact_type}
            onChange={handleChange}
            required
          >
            <option value="">Please Select</option>
            <option value="ceo">CEO</option>
            <option value="project_manager">Project Manager</option>
            <option value="associate_project_manager">
              Associate Project Manager
            </option>
            <option value="assistant_manager">Assistant Manager</option>
            <option value="sales_person">Sales Person</option>
            <option value="client_contact">Client Contact</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Company Name *</label>
          <select
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
          >
            <option value="">Please Select</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label>Contact Salutation</label>
          <select
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
          >
            <option value="">Please Select</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
        </div>

        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="First Name"
          />
        </div>

        <div className="form-group">
          <label>Middle Name</label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            placeholder="Middle Name"
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Last Name"
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email Address"
          />
        </div>

        <div className="form-group">
          <label>Contact No *</label>
          <input
            type="text"
            name="contact_no"
            value={formData.contact_no}
            onChange={handleChange}
            required
            placeholder="Contact No"
          />
        </div>

        <div className="form-divider" />

        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
          />
        </div>

        <div className="form-group">
          <label>Zip Code</label>
          <input
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            placeholder="Zip Code"
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />
        </div>

        <div className="form-group">
            <label>Status</label>

            <select
                name="status"
                value={formData.status}
                onChange={handleChange}
            >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
            </select>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-save">
            Save
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/company-contacts")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCompanyContact;