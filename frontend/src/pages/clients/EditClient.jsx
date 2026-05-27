import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleClient,
  updateClient,
} from "../../api/clientApi";

function EditClient() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    test_link: "",
    live_link: "",
    rid_parameter: "RID",
    our_parameter: "ID",
    status: true,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchClient();
  }, []);

  const fetchClient = async () => {
    try {
      const data = await getSingleClient(id);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        company_name: data.company_name || "",
        test_link: data.test_link || "",
        live_link: data.live_link || "",
        rid_parameter: data.rid_parameter || "RID",
        our_parameter: data.our_parameter || "ID",
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
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await updateClient(id, formData);
      navigate("/clients");
    } catch (error) {
      console.error(error.response?.data || error);

      setError(
        JSON.stringify(
          error.response?.data || "Update failed"
        )
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Edit Client</h1>
        <p>Update client details</p>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <form className="custom-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Client Name *</label>

          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Company Name</label>

          <input
            type="text"
            name="company_name"
            value={formData.company_name}
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

        <div className="form-group">
          <label>Test Link</label>

          <input
            type="url"
            name="test_link"
            placeholder="https://example.com/test?rid={{ID}}"
            value={formData.test_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Live Link *</label>

          <input
            type="url"
            name="live_link"
            required
            placeholder="https://example.com/live?rid={{ID}}"
            value={formData.live_link}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Client RID Parameter</label>

            <input
              type="text"
              name="rid_parameter"
              value={formData.rid_parameter}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Our Parameter</label>

            <input
              type="text"
              name="our_parameter"
              value={formData.our_parameter}
              onChange={handleChange}
            />
          </div>

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
          Update Client
        </button>

      </form>
    </div>
  );
}

export default EditClient;