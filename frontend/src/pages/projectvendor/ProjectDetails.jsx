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
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    project: id,
    vendor: "",
    vendor_cpc: "0.00",
    target: 0,
  });

  // const backendBaseUrl = "http://127.0.0.1:8000";
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
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "vendor") {
      const vendor = vendors.find((v) => String(v.id) === value);

      setSelectedVendor(vendor || null);

      setFormData({
        ...formData,
        vendor: value,
        vendor_cpc: vendor?.cpc || "0.00",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
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
        target: 0,
      });

      setSelectedVendor(null);
      fetchData();
    } catch (error) {
      console.error(error.response?.data || error);
      setError(JSON.stringify(error.response?.data || "Supplier assignment failed"));
    }
  };

  if (!project) {
    return <p>Loading project...</p>;
  }

  const completeUrl = `${backendBaseUrl}/api/complete/?id={{OBID}}`;
  const terminateUrl = `${backendBaseUrl}/api/terminate/?id={{OBID}}`;
  const quotaFullUrl = `${backendBaseUrl}/api/quota-full/?id={{OBID}}`;
  const securityUrl = `${backendBaseUrl}/api/security-terminate/?id={{OBID}}`;
  
  return (
    <div>
      <div className="page-header">
        <h1>{project.name}</h1>
        <p>
          Client: {project.client_name} | Country: {project.country} | Status:{" "}
          {project.status}
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
          <p>Give these links to client.</p>

          <LinkRow label="Complete" value={completeUrl} onCopy={copyText} />
          <LinkRow label="Terminate" value={terminateUrl} onCopy={copyText} />
          <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
          <LinkRow label="Security Term" value={securityUrl} onCopy={copyText} />
        </div>
      </div>

      <div className="section-card">
        <h3>Assign Supplier to Project</h3>

        {error && <div className="error-box">{error}</div>}

        <form className="inline-form" onSubmit={handleAssignSupplier}>
          <div className="form-group">
            <label>Vendor</label>
            <select
              name="vendor"
              required
              value={formData.vendor}
              onChange={handleChange}
            >
              <option value="">Select Vendor</option>

              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vendor CPC</label>
            <input
              type="number"
              step="0.01"
              name="vendor_cpc"
              value={formData.vendor_cpc}
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

          <button type="submit" className="primary-btn">
            Assign Supplier
          </button>
        </form>

        {selectedVendor && (
          <div className="vendor-preview-card">
            <h4>Selected Vendor Links</h4>
            <p>These links are auto-copied from vendor when assigning supplier.</p>

            <LinkRow
              label="Complete"
              value={selectedVendor.complete_link || "-"}
              onCopy={copyText}
            />

            <LinkRow
              label="Terminate"
              value={selectedVendor.terminate_link || "-"}
              onCopy={copyText}
            />

            <LinkRow
              label="Quota Full"
              value={selectedVendor.quota_full_link || "-"}
              onCopy={copyText}
            />

            <LinkRow
              label="Security"
              value={selectedVendor.security_terminate_link || "-"}
              onCopy={copyText}
            />
          </div>
        )}
      </div>

      <div className="section-card">
        <h3>Assigned Suppliers</h3>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Target</th>
                <th>Hits</th>
                <th>Completed</th>
                <th>Terminated</th>
                <th>Quota Full</th>
                <th>Security Term</th>
                <th>IR</th>
                <th>CPC</th>
                <th>Last Completed</th>
                <th>Supplier Link</th>
              </tr>
            </thead>

            <tbody>
              {supplierStats.map((item) => (
                <tr key={item.project_vendor_id}>
                  <td>{item.vendor_name}</td>
                  <td>{item.target}</td>

                  <td>
                    <Link
                      to={`/project-vendors/${item.project_vendor_id}/hints`}
                      className="text-link"
                    >
                      {item.hits}
                    </Link>
                  </td>

                  {/* <td>{item.completed}</td> */}
                  <td>
                    {item.completed}/{item.target}
                  </td>
                  <td>{item.terminated}</td>
                  <td>{item.quota_full}</td>
                  <td>{item.security_term}</td>
                  <td>{item.ir}%</td>
                  <td>{item.vendor_cpc}</td>
                  <td>{item.last_completed || "-"}</td>

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
                  <td colSpan="11" style={{ textAlign: "center" }}>
                    No suppliers assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {supplierStats.length > 0 && (
          <div className="assigned-links-section">
            <h3>Assigned Vendor Redirect Links</h3>

            {supplierStats.map((item) => (
              <div className="assigned-link-card" key={item.project_vendor_id}>
                <h4>{item.vendor_name}</h4>

                <LinkRow
                  label="Complete"
                  value={item.complete_link || "-"}
                  onCopy={copyText}
                />

                <LinkRow
                  label="Terminate"
                  value={item.terminate_link || "-"}
                  onCopy={copyText}
                />

                <LinkRow
                  label="Quota Full"
                  value={item.quota_full_link || "-"}
                  onCopy={copyText}
                />

                <LinkRow
                  label="Security"
                  value={item.security_terminate_link || "-"}
                  onCopy={copyText}
                />
              </div>
            ))}
          </div>
        )}
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