import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../api/projectApi";
import { getClients } from "../../api/clientApi";

function AddProject() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    name: "",
    country: "",
    target: 0,
    cpc: "0.00",
    loi: 0,
    ir: 0,
    test_link: "",
    live_link: "",
    status: "active",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createProject(formData);
      navigate("/projects");
    } catch (error) {
      setError(JSON.stringify(error.response?.data || "Project creation failed"));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Project</h1>
        <p>Create project with client survey links</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form className="custom-form wide-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client *</label>
            <select name="client" required value={formData.client} onChange={handleChange}>
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Target</label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
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

          <div className="form-group">
            <label>LOI</label>
            <input
              type="number"
              name="loi"
              value={formData.loi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>IR</label>
            <input
              type="number"
              name="ir"
              value={formData.ir}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Test Link</label>
          <input
            type="url"
            name="test_link"
            placeholder="https://client-test-link.com?rid={{ID}}"
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
            placeholder="https://client-live-link.com?rid={{ID}}"
            value={formData.live_link}
            onChange={handleChange}
          />
          <small>Must contain {"{{ID}"}{"}"} placeholder.</small>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button type="submit" className="primary-btn">
          Create Project
        </button>
      </form>
    </div>
  );
}

export default AddProject;