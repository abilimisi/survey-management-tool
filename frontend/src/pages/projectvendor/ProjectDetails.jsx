import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, Trash2, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { mapForeignIds } from "../../api/mapForeignApi";
import { getSingleProject } from "../../api/projectApi";
import { getVendors } from "../../api/vendorApi";
import {
  createProjectVendor,
  getSupplierStats,
  deleteProjectVendor,
  updateProjectVendor,
} from "../../api/projectVendorApi";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject]           = useState(null);
  const [vendors, setVendors]           = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [error, setError]               = useState("");
  const [showRedirectLinks, setShowRedirectLinks] = useState(false);
  const [showVariables, setShowVariables]         = useState(false);
  const [showAddSupplier, setShowAddSupplier]     = useState(false);
  const [editingSupplier, setEditingSupplier]     = useState(null);
  const [showMapForeignIds, setShowMapForeignIds] = useState(false);
  const [redirectIdsInput, setRedirectIdsInput]   = useState("");
  const [mappedResults, setMappedResults]         = useState([]);

  const backendBaseUrl = "https://carpenter-trodden-upstate.ngrok-free.dev";

  const initialFormData = {
    project: id,
    vendor: "",
    vendor_cpc: "0.00",
    target: 1000,
    max_redirects: 99999,
    supplier_parameter_template:
      "pid={{PANELIST IDENTIFIER}}&ext={{PANEL MISC DATA}}&reconnectID={{RECONNECTID}}",
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
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [projectData, vendorsData, statsData] = await Promise.all([
        getSingleProject(id),
        getVendors(),
        getSupplierStats(id),
      ]);
      setProject(projectData);
      setVendors(vendorsData);
      setSupplierStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project details");
    }
  };

  const copyText = async (text) => {
    if (!text || text === "-") return;
    await navigator.clipboard.writeText(text);
    toast.success("Copied!");
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
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDeleteSupplier = async (projectVendorId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteProjectVendor(projectVendorId);
      toast.success("Supplier deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete supplier!");
    }
  };

  const handleMapForeignIds = async () => {
    try {
      const response = await mapForeignIds(redirectIdsInput.trim());
      setMappedResults(response.results || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to map IDs");
    }
  };

  const exportMappedCSV = () => {
    if (!mappedResults.length) { toast.warning("No records to export."); return; }
    const headers = [
      "Searched By","Searched Value","Redirect ID","Foreign ID","Ext",
      "Reconnect ID","Status","Termination Reason","Project","Vendor",
      "Country","LOI","Vendor CPI","Started","Completed",
    ];
    const rows = mappedResults.map(item => [
      item.searched_by, item.searched_value, item.redirect_id, item.foreign_id,
      item.ext, item.reconnect_id, item.status, item.termination_reason || "-",
      item.project_name, item.vendor_name, item.country, item.loi, item.vendor_cpi,
      item.entrant_time   ? new Date(item.entrant_time).toLocaleString("en-IN")   : "",
      item.completed_time ? new Date(item.completed_time).toLocaleString("en-IN") : "",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v ?? ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Foreign_ID_Mapping_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      project: id,
      vendor: supplier.vendor_id || "",
      vendor_cpc: supplier.vendor_cpc || "0.00",
      target: supplier.target || 1000,
      max_redirects: supplier.max_redirects || 99999,
      supplier_parameter_template:
        supplier.supplier_parameter_template ||
        "pid={{PANELIST IDENTIFIER}}&ext={{PANEL MISC DATA}}&reconnectID={{RECONNECTID}}",
      complete_link: supplier.complete_link || "",
      terminate_link: supplier.terminate_link || "",
      quota_full_link: supplier.quota_full_link || "",
      security_terminate_link: supplier.security_terminate_link || "",
      notes: supplier.notes || "",
      status: supplier.status || "active",
      ask_email: supplier.ask_email || false,
      ask_zip: supplier.ask_zip || false,
      ask_age: supplier.ask_age || false,
      ask_gender: supplier.ask_gender || false,
    });
    setShowAddSupplier(true);
  };

  const handleAssignSupplier = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingSupplier) {
        await updateProjectVendor(editingSupplier.project_vendor_id, formData);
        toast.success("Supplier updated successfully!");
      } else {
        await createProjectVendor(formData);
        toast.success("Supplier assigned successfully!");
      }
      setShowAddSupplier(false);
      setEditingSupplier(null);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error(error);
      setError(JSON.stringify(error.response?.data || "Operation failed"));
      toast.error("Operation failed!");
    }
  };

  if (!project) return <p>Loading project...</p>;

  const completeUrl  = `${backendBaseUrl}/api/simple-process/?status=1&pid={{OBID}}`;
  const terminateUrl = `${backendBaseUrl}/api/simple-process/?status=2&pid={{OBID}}`;
  const quotaFullUrl = `${backendBaseUrl}/api/simple-process/?status=3&pid={{OBID}}`;
  const securityUrl  = `${backendBaseUrl}/api/simple-process/?status=4&pid={{OBID}}`;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ── Page Header ── */}
      <div className="page-header project-header-design">
        <div>
          <h1>{project.name}</h1>
          <p>Client: {project.client_name} | Country: {project.country} | Status: {project.status}</p>
        </div>

        <div className="pd-action-bar">
          <button className="link-codes-btn" onClick={() => setShowRedirectLinks(true)}>
            End Pages
          </button>
          <button className="link-codes-btn" onClick={() => setShowVariables(true)}>
            Link Variables
          </button>
          <button className="link-codes-btn" onClick={() => {
            setRedirectIdsInput(""); setMappedResults([]); setShowMapForeignIds(true);
          }}>
            Map Foreign IDs
          </button>
          <Link to={`/projects/${project.id}/questions`} className="primary-btn">
            Screening Questions
          </Link>
        </div>
      </div>

      {/* ── Assigned Suppliers ── */}
      <div className="section-card">
        <div className="section-header">
          <h3>Assigned Suppliers</h3>
          <button className="add-supplier-btn" onClick={() => {
            setEditingSupplier(null); setFormData(initialFormData); setShowAddSupplier(true);
          }}>
            + Add Supplier
          </button>
        </div>

        <div className="table-wrapper">
          <table className="pd-supplier-table">
            <thead>
              <tr>
                <th>ID</th><th>Panel</th><th>Status</th><th>Hits</th>
                <th>Completed</th><th>Terminates</th><th>Quota Full</th>
                <th>Security Term</th><th>IR</th><th>Last Completed</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {supplierStats.map((item) => (
                <tr key={item.project_vendor_id}>
                  <td>{item.project_vendor_id}</td>
                  <td>{item.vendor_name}</td>
                  <td>{item.status || "-"}</td>
                  <td>
                    <Link to={`/project-vendors/${item.project_vendor_id}/hints`} className="text-link">
                      {item.hits}/{item.max_redirects || 99999}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/project-vendors/${item.project_vendor_id}/hints?status=complete`} className="text-link">
                      {item.completed}/{item.target}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/project-vendors/${item.project_vendor_id}/hints?status=terminate`} className="text-link">
                      {item.terminated}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/project-vendors/${item.project_vendor_id}/hints?status=quota_full`} className="text-link">
                      {item.quota_full}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/project-vendors/${item.project_vendor_id}/hints?status=security_terminate`} className="text-link">
                      {item.security_term}
                    </Link>
                  </td>
                  <td>{item.ir}%</td>
                  <td>
                    {item.last_completed
                      ? new Date(item.last_completed).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="small-btn" onClick={() => copyText(item.supplier_link)}>URL</button>
                      <Link to={`/project-vendors/${item.project_vendor_id}/hints`} className="icon-btn" title="View Details">
                        <Eye size={16} />
                      </Link>
                      <button className="edit-btn" onClick={() => handleEditSupplier(item)} title="Edit Supplier">
                        <Pencil size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteSupplier(item.project_vendor_id)} title="Delete Supplier">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {supplierStats.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                    No suppliers assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Supplier Modal ── */}
      {showAddSupplier && (
        <div className="modal-overlay" onClick={() => { setShowAddSupplier(false); setEditingSupplier(null); }}>
          <div className="supplier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-head">
              <h2>{editingSupplier ? "Edit Supplier" : "Manage Suppliers"}</h2>
              <button className="close-btn" onClick={() => { setShowAddSupplier(false); setEditingSupplier(null); }}>✕</button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form className="supplier-form" onSubmit={handleAssignSupplier}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Vendor</label>
                  <select name="vendor" required value={formData.vendor} onChange={handleChange}>
                    <option value="">Please Select</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-4">
                <div className="form-group">
                  <label>Cost Per Complete</label>
                  <input type="number" step="0.01" name="vendor_cpc" value={formData.vendor_cpc} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Req. Completes</label>
                  <input type="number" name="target" value={formData.target} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Redirects</label>
                  <input type="number" name="max_redirects" value={formData.max_redirects} onChange={handleChange} />
                </div>
              </div>

              <div className="form-grid-4">
                <div className="form-group">
                  <label>Completion Link</label>
                  <textarea name="complete_link" value={formData.complete_link} readOnly />
                </div>
                <div className="form-group">
                  <label>Disqualify Link</label>
                  <textarea name="terminate_link" value={formData.terminate_link} readOnly />
                </div>
                <div className="form-group">
                  <label>Quota Full Link</label>
                  <textarea name="quota_full_link" value={formData.quota_full_link} readOnly />
                </div>
                <div className="form-group">
                  <label>Security Term Link</label>
                  <textarea name="security_terminate_link" value={formData.security_terminate_link} readOnly />
                </div>
              </div>

              <small className="warning-text">
                Vendor end links are managed from Vendor Master. Shown here for reference only.
              </small>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} />
                </div>
                <div className="checkbox-box">
                  <strong>Data to Ask on Redirect:</strong>
                  {[
                    { name:"ask_email", label:"Email Address" },
                    { name:"ask_zip",   label:"Zip Code" },
                    { name:"ask_age",   label:"Age" },
                    { name:"ask_gender",label:"Gender" },
                  ].map(f => (
                    <label key={f.name}>
                      <input type="checkbox" name={f.name} checked={formData[f.name]} onChange={handleChange} />
                      {f.label}
                    </label>
                  ))}
                </div>
                <div className="supplier-form-actions">
                  <button type="submit" className="primary-btn">
                    {editingSupplier ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── End Pages Modal ── */}
      {showRedirectLinks && (
        <RedirectLinksPopup
          onClose={() => setShowRedirectLinks(false)}
          completeUrl={completeUrl}
          terminateUrl={terminateUrl}
          quotaFullUrl={quotaFullUrl}
          securityUrl={securityUrl}
          copyText={copyText}
        />
      )}

      {/* ── Link Variables Modal ── */}
      {showVariables && <LinkCodesPopup onClose={() => setShowVariables(false)} />}

      {/* ── Map Foreign IDs Modal ── */}
      {showMapForeignIds && (
        <MapForeignIdsPopup
          onClose={() => setShowMapForeignIds(false)}
          redirectIdsInput={redirectIdsInput}
          setRedirectIdsInput={setRedirectIdsInput}
          mappedResults={mappedResults}
          onSearch={handleMapForeignIds}
          exportMappedCSV={exportMappedCSV}
        />
      )}
    </div>
  );
}

/* ── Link Row (End Pages) ── */
function LinkRow({ label, value, onCopy }) {
  return (
    <div className="pd-link-row">
      <span className="pd-link-label">{label}</span>
      <code className="pd-link-url">{value}</code>
      <button
        type="button"
        className="pd-copy-btn"
        disabled={!value || value === "-"}
        onClick={() => onCopy(value)}
      >
        Copy
      </button>
    </div>
  );
}

/* ── Redirect Links Popup ── */
function RedirectLinksPopup({ onClose, completeUrl, terminateUrl, quotaFullUrl, securityUrl, copyText }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pd-redirect-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-head">
          <h2>Client Redirect Links</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="pd-redirect-body">
          <LinkRow label="Complete"   value={completeUrl}  onCopy={copyText} />
          <LinkRow label="Terminate"  value={terminateUrl} onCopy={copyText} />
          <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
          <LinkRow label="Security"   value={securityUrl}  onCopy={copyText} />
        </div>
        <div className="modal-footer">
          <button className="primary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Link Variables Popup ── */
function LinkCodesPopup({ onClose }) {
  const clientVars = [
    { name:"ClientCode",   code:"{{CLIENTKEY}}"    },
    { name:"ID",           code:"{{ID}}"           },
    { name:"Ext",          code:"{{PASSTHRU}}"     },
    { name:"Re Connect ID",code:"{{RECONNECTID}}"  },
    { name:"Email",        code:"{{Email}}"        },
    { name:"Zip",          code:"{{Zip}}"          },
    { name:"Age",          code:"{{Age}}"          },
    { name:"Gender",       code:"{{Gender}}"       },
    { name:"authToken",    code:"{{authToken}}"    },
  ];
  const vendorVars = [
    { name:"Ext",          code:"{{PASSTHRU}}"     },
    { name:"Re Connect ID",code:"{{RECONNECTID}}"  },
    { name:"Panellist ID", code:"{{panellist_id}}" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pd-vars-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-head">
          <h2>Link Variables</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pd-vars-body">
          <p className="pd-vars-note">
            These variables are <strong>case-sensitive</strong> and will be automatically
            replaced with actual values during survey redirect.
          </p>

          <div className="pd-vars-grid">
            {/* Client */}
            <div className="pd-vars-section">
              <div className="pd-vars-section-head">
                <h3>Client Link Variables</h3>
                <p>Used in client survey links. Values replaced before redirecting to client survey.</p>
              </div>
              <table className="pd-vars-table">
                <thead>
                  <tr><th>Variable Name</th><th>Placeholder</th></tr>
                </thead>
                <tbody>
                  {clientVars.map(v => (
                    <tr key={v.name}>
                      <td>{v.name}</td>
                      <td><code className="pd-code">{v.code}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vendor */}
            <div className="pd-vars-section">
              <div className="pd-vars-section-head">
                <h3>Vendor Link Variables</h3>
                <p>Used with vendor end pages. Values replaced before redirecting to vendor.</p>
              </div>
              <table className="pd-vars-table">
                <thead>
                  <tr><th>Variable Name</th><th>Placeholder</th></tr>
                </thead>
                <tbody>
                  {vendorVars.map(v => (
                    <tr key={v.name}>
                      <td>{v.name}</td>
                      <td><code className="pd-code">{v.code}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Map Foreign IDs Popup ── */
function MapForeignIdsPopup({ onClose, redirectIdsInput, setRedirectIdsInput, mappedResults, onSearch, exportMappedCSV }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pd-foreign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-head">
          <h2>Map Redirect IDs → Foreign IDs</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pd-foreign-body">
          <div className="pd-foreign-top">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Paste Redirect IDs (one per line)</label>
              <textarea
                rows={3}
                value={redirectIdsInput}
                onChange={(e) => setRedirectIdsInput(e.target.value)}
                placeholder="e.g. A939F91FCC53"
                style={{ resize: "vertical", minHeight: "72px" }}
              />
            </div>
            <div className="pd-foreign-btns">
              <button
                className="primary-btn"
                disabled={!redirectIdsInput.trim()}
                onClick={onSearch}
              >
                🔍 Search
              </button>
              <button
                className="export-btn"
                disabled={!mappedResults.length}
                onClick={exportMappedCSV}
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          <div className="pd-foreign-table-wrap">
            <table className="pd-foreign-table">
              <thead>
                <tr>
                  <th>Redirect ID</th>
                  <th>Foreign ID</th>
                  <th>Ext</th>
                  <th>Reconnect ID</th>
                  <th>Status</th>
                  <th>Project</th>
                  <th>Vendor</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {mappedResults.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign:"center", padding:"24px", color:"#6b7280" }}>
                      No results — search to see mapped IDs
                    </td>
                  </tr>
                ) : (
                  mappedResults.map((item, i) => (
                    <tr key={i}>
                      <td><code style={{fontSize:"11.5px"}}>{item.redirect_id}</code></td>
                      <td><code style={{fontSize:"11.5px"}}>{item.foreign_id}</code></td>
                      <td>{item.ext}</td>
                      <td>{item.reconnect_id}</td>
                      <td>{item.status}</td>
                      <td>{item.project_name}</td>
                      <td>{item.vendor_name}</td>
                      <td>{item.country}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
