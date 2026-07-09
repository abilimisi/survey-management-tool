import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getSingleProject, updateProject } from "../../api/projectApi";
import { getClients } from "../../api/clientApi";
import "./ProjectForm.css";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    parent_project: "Self Parent",
    name: "",
    study_type: "",
    country: "",
    language: "",
    client: "",
    client_contact: "",
    project_manager: "",
    sales_person: "",
    target: 0,
    max_completes: 0,
    cpc: "0.00",
    loi: 0,
    ir: 0,
    reward_points: "0.00",
    supported_devices: "",
    test_link: "",
    live_link: "",
    start_date: "",
    end_date: "",
    notes: "",
    project_brief: "",
    status: "bidding",
  });

  useEffect(() => {
    fetchClients();
    fetchProject();
  }, [id]);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load clients.");
    }
  };

  const fetchProject = async () => {
    try {
      const data = await getSingleProject(id);

      setFormData({
        parent_project: data.parent_project || "Self Parent",
        name: data.name || "",
        study_type: data.study_type || "",
        country: data.country || "",
        language: data.language || "",
        client: data.client || "",
        client_contact: data.client_contact || "",
        project_manager: data.project_manager || "",
        sales_person: data.sales_person || "",
        target: data.target || 0,
        max_completes: data.max_completes || 0,
        cpc: data.cpc || "0.00",
        loi: data.loi || 0,
        ir: data.ir || 0,
        reward_points: data.reward_points || "0.00",
        supported_devices: data.supported_devices || "",
        test_link: data.test_link || "",
        live_link: data.live_link || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        notes: data.notes || "",
        project_brief: data.project_brief || "",
        status: data.status || "bidding",
      });
    } catch (error) {
      console.error(error);
      setError("Failed to load project details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDeviceChange = (device) => {
    const currentDevices = formData.supported_devices
      ? formData.supported_devices.split(",")
      : [];

    let updatedDevices;

    if (currentDevices.includes(device)) {
      updatedDevices = currentDevices.filter((item) => item !== device);
    } else {
      updatedDevices = [...currentDevices, device];
    }

    setFormData({
      ...formData,
      supported_devices: updatedDevices.join(","),
    });
  };

  const isDeviceSelected = (device) => {
    return formData.supported_devices?.split(",").includes(device);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await updateProject(id, formData);

      toast.success("Project updated successfully!");

      setTimeout(() => {
        navigate("/projects");
      }, 1500);

    } catch (error) {
      console.error(error.response?.data || error);

      setError(
        JSON.stringify(
          error.response?.data || "Project update failed"
        )
      );

      toast.error("Project update failed!");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Edit Project</h1>
        <p>Update project with survey links, metrics and timeline</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="project-section">
          <div className="form-grid-2">
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

            <div className="form-group">
              <label>Parent Project</label>
              <input
                type="text"
                name="parent_project"
                value={formData.parent_project}
                disabled
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Study Type</label>
              <select
                name="study_type"
                value={formData.study_type}
                onChange={handleChange}
              >
                <option value="">Please Select</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="CATI">CATI</option>
                <option value="Data Processing">Data Processing</option>
                <option value="Doctor">Doctor</option>
                <option value="Focus Group">Focus Group</option>
                <option value="Health care">Health care</option>
                <option value="IDI">IDI</option>
                <option value="IHUT">IHUT</option>
                <option value="In-depth telephone interviews(TDIs)">
                  In-depth telephone interviews(TDIs)
                </option>
                <option value="Online Board">Online Board</option>
                <option value="Online Community Recruitment">
                  Online Community Recruitment
                </option>
                <option value="panel build up">Panel Build Up</option>
                <option value="programming">Programming</option>
                <option value="TDI">TDI</option>
              </select>
            </div>

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
              <label>Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Survey Link *</label>
              <textarea
                name="live_link"
                required
                placeholder="https://client-live-link.com?pid={{ID}}"
                value={formData.live_link}
                onChange={handleChange}
              />
              <small>
                Must contain {"{{ID}"}{"}"} or {"{{OBID}"}{"}"} placeholder.
              </small>
            </div>

            <div className="form-group">
              <label>Survey Test Link</label>
              <textarea
                name="test_link"
                placeholder="https://client-test-link.com?pid={{ID}}"
                value={formData.test_link}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>CPC $</label>
            <input
              type="number"
              step="0.01"
              name="cpc"
              value={formData.cpc}
              onChange={handleChange}
            />
            <small>Must be between $0.01 to $1,000</small>
          </div>
        </div>

        <div className="section-title">Expected Metrics & Data</div>

        <div className="project-section">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Req. Completes</label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
              />
              <small>Must be between 1 to 99,999</small>
            </div>

            <div className="form-group">
              <label>Max. Completes</label>
              <input
                type="number"
                name="max_completes"
                value={formData.max_completes}
                onChange={handleChange}
              />
              <small>Quota buffer completes</small>
            </div>
          </div>

          <div className="form-grid-2">
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
              <label>IR %</label>
              <input
                type="number"
                name="ir"
                value={formData.ir}
                onChange={handleChange}
              />
              <small>Must be between 1 to 100</small>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label># of points to award</label>
              <input
                type="number"
                step="0.01"
                name="reward_points"
                value={formData.reward_points}
                onChange={handleChange}
              />
              <small>Value of 01 reward point = 0.01 USD</small>
            </div>

            <div className="form-group">
              <label>Supported Devices</label>

              <div className="device-options">
                {["desktop", "tablet", "mobile"].map((device) => (
                  <label key={device} className="device-check">
                    <input
                      type="checkbox"
                      checked={isDeviceSelected(device)}
                      onChange={() => handleDeviceChange(device)}
                    />
                    {device}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-title">People</div>

        <div className="project-section">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Client *</label>
              <select
                name="client"
                required
                value={formData.client}
                onChange={handleChange}
              >
                <option value="">Please Select</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Client Contact</label>
              <input
                type="text"
                name="client_contact"
                value={formData.client_contact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Project Manager</label>
              <input
                type="text"
                name="project_manager"
                value={formData.project_manager}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Sales Person</label>
              <input
                type="text"
                name="sales_person"
                value={formData.sales_person}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="section-title">Timeline</div>

        <div className="project-section">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="section-title">Memorandum</div>

        <div className="project-section">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Project Brief</label>
              <textarea
                name="project_brief"
                value={formData.project_brief}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="section-title">Status</div>

        <div className="project-section">
          <div className="form-group small-field">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="bidding">Bidding</option>
              <option value="api_staging">API Staging</option>
              <option value="running">Running</option>
              <option value="testing">Testing</option>
              <option value="on_hold">On Hold</option>
              <option value="awaiting_ids">Awaiting ID&apos;s</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">
            Update Project
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/projects")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;