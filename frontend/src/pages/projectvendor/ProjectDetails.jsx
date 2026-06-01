import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getSingleProject } from "../../api/projectApi";
import { getVendors } from "../../api/vendorApi";
import {
  createProjectVendor,
  getSupplierStats,
} from "../../api/projectVendorApi";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    project: id,
    vendor: "",
    vendor_cpc: "0.00",
    target: 1000,
    max_redirects: 99999,
    complete_link: "",
    terminate_link: "",
    quota_full_link: "",
    security_terminate_link: "",
    notes: "",
    status: "active",
    ask_email: false,
    ask_zip: false,
    ask_age: false,
    ask_gender: false,
    qualification_required: true,
  });

  const backendBaseUrl = "https://backwater-muster-repayment.ngrok-free.dev";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const projectData = await getSingleProject(id);
      const vendorsData = await getVendors();
      const statsData = await getSupplierStats(id);

      setProject(projectData);
      setVendors(vendorsData);
      setSupplierStats(statsData);
    } catch (error) {
      console.error(error);
    }
  };

  const copyText = async (text) => {
    if (!text || text === "-") return;
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "vendor") {
      const vendor = vendors.find((v) => String(v.id) === value);

      setFormData({
        ...formData,
        vendor: value,
        vendor_cpc: vendor?.cpc || "0.00",
        complete_link: vendor?.complete_link || "",
        terminate_link: vendor?.terminate_link || "",
        quota_full_link: vendor?.quota_full_link || "",
        security_terminate_link: vendor?.security_terminate_link || "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAssignSupplier = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createProjectVendor(formData);

      setFormData({
        project: id,
        vendor: "",
        vendor_cpc: "0.00",
        target: 1000,
        max_redirects: 99999,
        complete_link: "",
        terminate_link: "",
        quota_full_link: "",
        security_terminate_link: "",
        notes: "",
        status: "active",
        ask_email: false,
        ask_zip: false,
        ask_age: false,
        ask_gender: false,
        qualification_required: true,
      });

      fetchData();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(JSON.stringify(error.response?.data || "Supplier assignment failed"));
    }
  };

  if (!project) return <p>Loading project...</p>;

  const completeUrl = `${backendBaseUrl}/api/complete/?id={{OBID}}`;
  const terminateUrl = `${backendBaseUrl}/api/terminate/?id={{OBID}}`;
  const quotaFullUrl = `${backendBaseUrl}/api/quota-full/?id={{OBID}}`;
  const securityUrl = `${backendBaseUrl}/api/security-terminate/?id={{OBID}}`;
  const s2sUrl = `${backendBaseUrl}/api/s2s/process/?pid={{OBID}}&status_id={{status}}&token={{authToken}}`;

  return (
    <div>
      <div className="page-header">
        <h1>{project.name}</h1>
        <p>
          Client: {project.client_name} | Country: {project.country} | Status: {project.status}
        </p>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h3>Project Information</h3>
          <p><strong>Target:</strong> {project.target}</p>
          <p><strong>CPC:</strong> {project.cpc}</p>
          <p><strong>LOI:</strong> {project.loi}</p>
          <p><strong>IR:</strong> {project.ir}%</p>

          <p><strong>Live Link:</strong></p>
          <div className="link-box">{project.live_link}</div>
        </div>

        <div className="details-card">
          <h3>Client Redirect Links</h3>
          <LinkRow label="Complete" value={completeUrl} onCopy={copyText} />
          <LinkRow label="Terminate" value={terminateUrl} onCopy={copyText} />
          <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
          <LinkRow label="Security Term" value={securityUrl} onCopy={copyText} />
          <LinkRow label="S2S Link" value={s2sUrl} onCopy={copyText} />
        </div>
      </div>
      <div className="details-card">
        <h3>Supported Variables</h3>

        <div className="variables-box">
          <span><strong>{"{{OBID}}"}</strong> - Your respondent ID</span>
          <span><strong>{"{{ID}}"}</strong> - Same as OBID</span>
          <span><strong>{"{{panellist_id}}"}</strong> - Vendor panelist ID</span>
          <span><strong>{"{{PASSTHRU}}"}</strong> - Pass-through value</span>
          <span><strong>{"{{RECONNECTID}}"}</strong> - Reconnect ID</span>
          <span><strong>{"{{authToken}}"}</strong> - S2S token</span>
          <span><strong>{"{{status}}"}</strong> - S2S status code</span>
        </div>
      </div>

      <div className="section-card">
        <h3>Manage Suppliers</h3>

        {error && <div className="error-box">{error}</div>}

        <form className="supplier-form" onSubmit={handleAssignSupplier}>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Vendor</label>
              <select name="vendor" required value={formData.vendor} onChange={handleChange}>
                <option value="">Please Select</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Testing</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Cost Per Complete</label>
              <input
                type="number"
                step="0.01"
                name="vendor_cpc"
                value={formData.vendor_cpc}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Req. Completes</label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Max Redirects</label>
              <input
                type="number"
                name="max_redirects"
                value={formData.max_redirects}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Qualification Required</label>
              <select
                name="qualification_required"
                value={formData.qualification_required ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualification_required: e.target.value === "true",
                  })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Completion Link</label>
              <textarea name="complete_link" value={formData.complete_link} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Disqualify Link</label>
              <textarea name="terminate_link" value={formData.terminate_link} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Quota Full Link</label>
              <textarea name="quota_full_link" value={formData.quota_full_link} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Security Term Link</label>
              <textarea name="security_terminate_link" value={formData.security_terminate_link} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} />
            </div>

            <div className="checkbox-box">
              <strong>Data to Ask on Redirect:</strong>

              <label>
                <input type="checkbox" name="ask_email" checked={formData.ask_email} onChange={handleChange} />
                Email Address
              </label>

              <label>
                <input type="checkbox" name="ask_zip" checked={formData.ask_zip} onChange={handleChange} />
                Zip Code
              </label>

              <label>
                <input type="checkbox" name="ask_age" checked={formData.ask_age} onChange={handleChange} />
                Age
              </label>

              <label>
                <input type="checkbox" name="ask_gender" checked={formData.ask_gender} onChange={handleChange} />
                Gender
              </label>
            </div>

            <div className="supplier-form-actions">
              <button type="submit" className="primary-btn">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="section-card">
        <h3>Assigned Suppliers</h3>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Panel</th>
                <th>Status</th>
                <th>Hits</th>
                <th>Completed</th>
                <th>Dis</th>
                <th>Quota Full</th>
                <th>Security Term</th>
                <th>IR</th>
                <th>CPC</th>
                <th>s2s</th>
                <th>Last Completed</th>
                <th>Action</th>
                <th>Test Links</th>
              </tr>
            </thead>

            <tbody>
              {supplierStats.map((item) => (
                <tr key={item.project_vendor_id}>
                  <td>{item.project_vendor_id}</td>
                  <td>{item.vendor_name}</td>
                  <td>{item.status || "Testing"}</td>

                  <td>
                    <Link
                      to={`/project-vendors/${item.project_vendor_id}/hints`}
                      className="text-link"
                    >
                      {item.hits}/{item.max_redirects || 99999}
                    </Link>
                  </td>

                  <td>{item.completed}/{item.target}</td>
                  <td>{item.terminated}</td>
                  <td>{item.quota_full}</td>
                  <td>{item.security_term}</td>
                  <td>{item.ir}%</td>
                  <td>{item.vendor_cpc}</td>
                  <td><button className="small-btn" onClick={() => copyText(item.s2s_link)}>Copy</button></td>
                  <td>
                    {item.last_completed
                      ? new Date(item.last_completed).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>

                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/project-vendors/${item.project_vendor_id}/hints`}
                        className="view-btn"
                      >
                        View
                      </Link>

                      <button
                        className="small-btn"
                        onClick={() => copyText(item.supplier_link)}
                      >
                        Copy
                      </button>
                    </div>
                  </td>

                  <td>
                    <button
                      className="small-btn"
                      onClick={() => copyText(item.supplier_link)}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}

              {supplierStats.length === 0 && (
                <tr>
                  <td colSpan="14" style={{ textAlign: "center" }}>
                    No suppliers assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LinkRow({ label, value, onCopy }) {
  return (
    <div className="link-row">
      <strong>{label}</strong>
      <span>{value}</span>

      <button
        type="button"
        disabled={!value || value === "-"}
        onClick={() => onCopy(value)}
      >
        Copy
      </button>
    </div>
  );
}

export default ProjectDetails;