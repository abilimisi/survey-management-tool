// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";

// import { getSingleProject } from "../../api/projectApi";
// import { getVendors } from "../../api/vendorApi";

// import { Eye, Trash2, Pencil } from "lucide-react";
// import {createProjectVendor,getSupplierStats,deleteProjectVendor,updateProjectVendor} from "../../api/projectVendorApi";

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";


// function ProjectDetails() {
//   const { id } = useParams();

//   const [project, setProject] = useState(null);
//   const [vendors, setVendors] = useState([]);
//   const [supplierStats, setSupplierStats] = useState([]);
//   const [error, setError] = useState("");
//   const [showLinkCodes, setShowLinkCodes] = useState(false);
//   const [showAddSupplier, setShowAddSupplier] = useState(false);
//   const [editingSupplier, setEditingSupplier] = useState(null);

//   const [formData, setFormData] = useState({
//     project: id,
//     vendor: "",
//     vendor_cpc: "0.00",
//     target: 1000,
//     max_redirects: 99999,
//     complete_link: "",
//     terminate_link: "",
//     quota_full_link: "",
//     security_terminate_link: "",
//     notes: "",
//     status: "active",
//     ask_email: false,
//     ask_zip: false,
//     ask_age: false,
//     ask_gender: false,
//     qualification_required: true,
//   });

//   const backendBaseUrl = " https://backwater-muster-repayment.ngrok-free.dev";

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const fetchData = async () => {
//     try {
//       const projectData = await getSingleProject(id);
//       const vendorsData = await getVendors();
//       const statsData = await getSupplierStats(id);

//       setProject(projectData);
//       setVendors(vendorsData);
//       setSupplierStats(statsData);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const copyText = async (text) => {
//     if (!text || text === "-") return;
//     await navigator.clipboard.writeText(text);
//     alert("Copied!");
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name === "vendor") {
//       const vendor = vendors.find((v) => String(v.id) === value);

//       setFormData({
//         ...formData,
//         vendor: value,
//         vendor_cpc: vendor?.cpc || "0.00",
//         complete_link: vendor?.complete_link || "",
//         terminate_link: vendor?.terminate_link || "",
//         quota_full_link: vendor?.quota_full_link || "",
//         security_terminate_link: vendor?.security_terminate_link || "",
//       });

//       return;
//     }

//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };


//   const handleDeleteSupplier = async (projectVendorId) => {
//   const confirmDelete = window.confirm(
//     "Are you sure you want to delete this supplier?"
//   );

//   if (!confirmDelete) return;

//   try {
//     await deleteProjectVendor(projectVendorId);

//     setSupplierStats((prev) =>
//       prev.filter(
//         (item) => item.project_vendor_id !== projectVendorId
//       )
//     );

//     toast.success("Supplier deleted successfully!");
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to delete supplier!");
//   }
// };


//   const handleEditSupplier = (supplier) => {
//   setEditingSupplier(supplier);

//   setFormData({
//     project: id,
//     vendor: supplier.vendor_id,
//     vendor_cpc: supplier.vendor_cpc,
//     target: supplier.target,
//     max_redirects: supplier.max_redirects,
//     complete_link: supplier.complete_link,
//     terminate_link: supplier.terminate_link,
//     quota_full_link: supplier.quota_full_link,
//     security_terminate_link: supplier.security_terminate_link,
//     notes: supplier.notes,
//     status: supplier.status,
//   });

//   setShowAddSupplier(true);
// };


//   const handleAssignSupplier = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {

//       if (editingSupplier) {

//         await updateProjectVendor(
//           editingSupplier.project_vendor_id,
//           formData
//         );

//         toast.success("Supplier updated successfully!");

//       } else {

//         await createProjectVendor(formData);

//         toast.success("Supplier assigned successfully!");

//       }

//       setShowAddSupplier(false);

//       setEditingSupplier(null);

//       setFormData({
//         project: id,
//         vendor: "",
//         vendor_cpc: "0.00",
//         target: 1000,
//         max_redirects: 99999,
//         complete_link: "",
//         terminate_link: "",
//         quota_full_link: "",
//         security_terminate_link: "",
//         notes: "",
//         status: "active",
//         ask_email: false,
//         ask_zip: false,
//         ask_age: false,
//         ask_gender: false,
//         qualification_required: true,
//       });

//       fetchData();

//     } catch (error) {
//       console.error(error);
//       toast.error("Operation failed!");
//     }
//   };

//   if (!project) return <p>Loading project...</p>;

//   const completeUrl = `${backendBaseUrl}/api/complete/?id={{OBID}}`;
//   const terminateUrl = `${backendBaseUrl}/api/terminate/?id={{OBID}}`;
//   const quotaFullUrl = `${backendBaseUrl}/api/quota-full/?id={{OBID}}`;
//   const securityUrl = `${backendBaseUrl}/api/security-terminate/?id={{OBID}}`;
//   const s2sUrl = `${backendBaseUrl}/api/s2s/process/?pid={{OBID}}&status_id={{status}}&token={{authToken}}`;

//   return (
//     <div>

//       <div className="page-header project-header-design">
//         <div>
//           <h1>{project.name}</h1>
//           <p>
//             Client: {project.client_name} | Country: {project.country} | Status: {project.status}
//           </p>
//         </div>

//         <button
//           className="link-codes-btn"
//           onClick={() => setShowLinkCodes(true)}
//         >
//           Link Codes
//         </button>
//       </div>

//       <div className="details-grid">
//         <div className="details-card">
//           <h3>Project Information</h3>
//           <p><strong>Target:</strong> {project.target}</p>
//           <p><strong>CPC:</strong> {project.cpc}</p>
//           <p><strong>LOI:</strong> {project.loi}</p>
//           <p><strong>IR:</strong> {project.ir}%</p>

//           <p><strong>Live Link:</strong></p>
//           <div className="link-box">{project.live_link}</div>
//         </div>

//         <div className="details-card">
//           <div className="section-header">
//             <h3>Client Redirect Links</h3>
//           </div>
//           <LinkRow label="Complete" value={completeUrl} onCopy={copyText} />
//           <LinkRow label="Terminate" value={terminateUrl} onCopy={copyText} />
//           <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
       
//         </div>
//       </div>

     

//       <div className="section-card">

//         <div className="section-header">
//           <h3>Assigned Suppliers</h3>
//          <button
//             className="add-supplier-btn"
//             onClick={() => {
//               console.log("Button Clicked");
//               setShowAddSupplier(true);
//             }}>
//             + Add Supplier
//           </button>

          
//       </div>

//         <div className="table-wrapper">
//           <table className="custom-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Panel</th>
//                 <th>Status</th>
//                 <th>Hits</th>
//                 <th>Completed</th>
//                 <th>Dis</th>
//                 <th>Quota Full</th>
//                 <th>Security Term</th>
//                 <th>IR</th>
//                 <th>Last Completed</th>
//                 <th>Action</th>
//                 </tr>
//             </thead>

//             <tbody>
//               {supplierStats.map((item) => (
//                 <tr key={item.project_vendor_id}>
//                   <td>{item.project_vendor_id}</td>
//                   <td>{item.vendor_name}</td>
//                   <td>{item.status || "Testing"}</td>

//                   <td>
//                     <Link
//                       to={`/project-vendors/${item.project_vendor_id}/hints`}
//                       className="text-link"
//                     >
//                       {item.hits}/{item.max_redirects || 99999}
//                     </Link>
//                   </td>

//                   <td>{item.completed}/{item.target}</td>
//                   <td>{item.terminated}</td>
//                   <td>{item.quota_full}</td>
//                   <td>{item.security_term}</td>
//                   <td>{item.ir}%</td>
                  
//                   <td>
//                     {item.last_completed
//                       ? new Date(item.last_completed).toLocaleString("en-IN", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : "-"}
//                   </td>

//                   <td>
//                     <div className="table-actions">


//                       <button
//                           className="small-btn"
//                           onClick={() => copyText(item.supplier_link)}
//                         >
//                           URL
//                         </button>

//                       <Link
//                         to={`/project-vendors/${item.project_vendor_id}/hints`}
//                         className="icon-btn"
//                         title="View Details"
//                       >
//                         <Eye size={16} />
//                       </Link>
                      
//                       <button
//                         className="edit-btn"
//                         onClick={() => handleEditSupplier(item)}
//                         title="Edit Supplier">
//                         <Pencil size={16} />
//                       </button>

//                       <button
//                         className="delete-btn"
//                         onClick={() =>
//                           handleDeleteSupplier(item.project_vendor_id)
//                         }
//                         title="Delete Supplier"
//                       >
//                         <Trash2 size={16} />
//                       </button>

//                     </div>
//                   </td>

//                 </tr>
//               ))}

//               {supplierStats.length === 0 && (
//                 <tr>
//                   <td colSpan="11" style={{ textAlign: "center" }}>
//                     No suppliers assigned
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         </div>
      
//       {showAddSupplier && (
//   <div
//     className="modal-overlay"
//     onClick={() => {
//     setShowAddSupplier(false);
//     setEditingSupplier(null);
//     }}
//   >
//     <div
//       className="supplier-modal"
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div className="modal-header">
//         <h2>
//           {editingSupplier
//             ? "Edit Supplier"
//             : "Manage Suppliers"}
//         </h2>

//         <button
//           className="close-btn"
//           onClick={() => {
//             setShowAddSupplier(false);
//             setEditingSupplier(null);
//           }}
//         >
//           ✕
//         </button>
//       </div>

//       {error && <div className="error-box">{error}</div>}

//        <form className="supplier-form" onSubmit={handleAssignSupplier}>
//           <div className="form-grid-2">
//             <div className="form-group">
//               <label>Vendor</label>
//               <select name="vendor" required value={formData.vendor} onChange={handleChange}>
//                 <option value="">Please Select</option>
//                 {vendors.map((vendor) => (
//                   <option key={vendor.id} value={vendor.id}>
//                     {vendor.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Status</label>
//               <select name="status" value={formData.status} onChange={handleChange}>
//                 <option value="active">Testing</option>
//                 <option value="paused">Paused</option>
//                 <option value="closed">Closed</option>
//               </select>
//             </div>
//           </div>

//           <div className="form-grid-4">
//             <div className="form-group">
//               <label>Cost Per Complete</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 name="vendor_cpc"
//                 value={formData.vendor_cpc}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Req. Completes</label>
//               <input
//                 type="number"
//                 name="target"
//                 value={formData.target}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Max Redirects</label>
//               <input
//                 type="number"
//                 name="max_redirects"
//                 value={formData.max_redirects}
//                 onChange={handleChange}
//               />
//             </div>

//             <div className="form-group">
//               <label>Qualification Required</label>
//               <select
//                 name="qualification_required"
//                 value={formData.qualification_required ? "true" : "false"}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     qualification_required: e.target.value === "true",
//                   })
//                 }
//               >
//                 <option value="true">Yes</option>
//                 <option value="false">No</option>
//               </select>
//             </div>
//           </div>

//           <div className="form-grid-4">
//             <div className="form-group">
//               <label>Completion Link</label>
//               <textarea name="complete_link" value={formData.complete_link} onChange={handleChange} />
//             </div>

//             <div className="form-group">
//               <label>Disqualify Link</label>
//               <textarea name="terminate_link" value={formData.terminate_link} onChange={handleChange} />
//             </div>

//             <div className="form-group">
//               <label>Quota Full Link</label>
//               <textarea name="quota_full_link" value={formData.quota_full_link} onChange={handleChange} />
//             </div>

//             <div className="form-group">
//               <label>Security Term Link</label>
//               <textarea name="security_terminate_link" value={formData.security_terminate_link} onChange={handleChange} />
//             </div>
//           </div>

//           <div className="form-grid-3">
//             <div className="form-group">
//               <label>Notes</label>
//               <textarea name="notes" value={formData.notes} onChange={handleChange} />
//             </div>

//             <div className="checkbox-box">
//               <strong>Data to Ask on Redirect:</strong>

//               <label>
//                 <input type="checkbox" name="ask_email" checked={formData.ask_email} onChange={handleChange} />
//                 Email Address
//               </label>

//               <label>
//                 <input type="checkbox" name="ask_zip" checked={formData.ask_zip} onChange={handleChange} />
//                 Zip Code
//               </label>

//               <label>
//                 <input type="checkbox" name="ask_age" checked={formData.ask_age} onChange={handleChange} />
//                 Age
//               </label>

//               <label>
//                 <input type="checkbox" name="ask_gender" checked={formData.ask_gender} onChange={handleChange} />
//                 Gender
//               </label>
//             </div>

//             <div className="supplier-form-actions">
//               <button type="submit" className="primary-btn">
//                 {editingSupplier ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </form>

//     </div>
//   </div>
// )}

//       {showLinkCodes && (
//         <div
//           className="modal-overlay"
//           onClick={() => setShowLinkCodes(false)}
//         >
//           <div
//             className="link-codes-modal"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="modal-header">
//               <h2>Redirect End Pages & Variables</h2>

//               <button
//                 className="close-btn"
//                 onClick={() => setShowLinkCodes(false)}
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="modal-content-grid">

//               <div>
//                 <h3>Client Link Variables</h3>

//                 <table className="variables-table">
//                   <tbody>
//                     <tr>
//                       <td>ID</td>
//                       <td>{"{{ID}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Pass Through</td>
//                       <td>{"{{PASSTHRU}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Reconnect ID</td>
//                       <td>{"{{RECONNECTID}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Auth Token</td>
//                       <td>{"{{authToken}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Status</td>
//                       <td>{"{{status}}"}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>

//               <div>
//                 <h3>Vendor Link Variables</h3>

//                 <table className="variables-table">
//                   <tbody>
//                     <tr>
//                       <td>Panelist ID</td>
//                       <td>{"{{panellist_id}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Pass Through</td>
//                       <td>{"{{PASSTHRU}}"}</td>
//                     </tr>
//                     <tr>
//                       <td>Reconnect ID</td>
//                       <td>{"{{RECONNECTID}}"}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
     

// function LinkRow({ label, value, onCopy }) {
//   return (
//     <div className="link-row">
//       <strong>{label}</strong>
//       <span>{value}</span>

//       <button
//         type="button"
//         disabled={!value || value === "-"}
//         onClick={() => onCopy(value)}
//       >
//         Copy
//       </button>
//     </div>
//   );
// }


// export default ProjectDetails;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, Trash2, Pencil } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getSingleProject } from "../../api/projectApi";
import { getVendors } from "../../api/vendorApi";
import {
  createProjectVendor,
  getSupplierStats,
  deleteProjectVendor,
  updateProjectVendor,
} from "../../api/projectVendorApi";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [error, setError] = useState("");
  const [showLinkCodes, setShowLinkCodes] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const backendBaseUrl = "https://backwater-muster-repayment.ngrok-free.dev";

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
    qualification_required: true,
  };

  const [formData, setFormData] = useState(initialFormData);

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

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      qualification_required: supplier.qualification_required ?? true,
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

  const completeUrl = `${backendBaseUrl}/api/simple-process/?status=1&pid={{OBID}}`;
  const terminateUrl = `${backendBaseUrl}/api/simple-process/?status=2&pid={{OBID}}`;
  const quotaFullUrl = `${backendBaseUrl}/api/simple-process/?status=3&pid={{OBID}}`;
  const securityUrl = `${backendBaseUrl}/api/simple-process/?status=4&pid={{OBID}}`;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="page-header project-header-design">
        <div>
          <h1>{project.name}</h1>
          <p>
            Client: {project.client_name} | Country: {project.country} | Status:{" "}
            {project.status}
          </p>
        </div>

        <button className="link-codes-btn" onClick={() => setShowLinkCodes(true)}>
          Link Codes
        </button>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <h3>Project Information</h3>
          <p><strong>Target:</strong> {project.target}</p>
          <p><strong>CPC:</strong> {project.cpc}</p>
          <p><strong>LOI:</strong> {project.loi}</p>
          <p><strong>IR:</strong> {project.ir}%</p>

          <p><strong>Client Live Link:</strong></p>
          <div className="link-box">{project.live_link}</div>
        </div>

        <div className="details-card">
          <div className="section-header">
            <h3>Client Redirect Links</h3>
          </div>

          <LinkRow label="Complete" value={completeUrl} onCopy={copyText} />
          <LinkRow label="Terminate" value={terminateUrl} onCopy={copyText} />
          <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
          <LinkRow label="Security Term" value={securityUrl} onCopy={copyText} />
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Assigned Suppliers</h3>

          <button
            className="add-supplier-btn"
            onClick={() => {
              setEditingSupplier(null);
              setFormData(initialFormData);
              setShowAddSupplier(true);
            }}
          >
            + Add Supplier
          </button>
        </div>

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
                <th>Last Completed</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {supplierStats.map((item) => (
                <tr key={item.project_vendor_id}>
                  <td>{item.project_vendor_id}</td>
                  <td>{item.vendor_name}</td>
                  <td>{item.status || "-"}</td>

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
                      <button
                        className="small-btn"
                        onClick={() => copyText(item.supplier_link)}
                      >
                        URL
                      </button>

                      <Link
                        to={`/project-vendors/${item.project_vendor_id}/hints`}
                        className="icon-btn"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>

                      <button
                        className="edit-btn"
                        onClick={() => handleEditSupplier(item)}
                        title="Edit Supplier"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteSupplier(item.project_vendor_id)}
                        title="Delete Supplier"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
      </div>

      {showAddSupplier && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddSupplier(false);
            setEditingSupplier(null);
          }}
        >
          <div className="supplier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSupplier ? "Edit Supplier" : "Manage Suppliers"}</h2>

              <button
                className="close-btn"
                onClick={() => {
                  setShowAddSupplier(false);
                  setEditingSupplier(null);
                }}
              >
                ✕
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form className="supplier-form" onSubmit={handleAssignSupplier}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Vendor</label>
                  <select
                    name="vendor"
                    required
                    value={formData.vendor}
                    onChange={handleChange}
                  >
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
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Supplier Parameter Template</label>
                <textarea
                  name="supplier_parameter_template"
                  value={formData.supplier_parameter_template}
                  onChange={handleChange}
                  placeholder="pid={{PANELIST IDENTIFIER}}&ext={{PANEL MISC DATA}}&reconnectID={{RECONNECTID}}"
                />
                <small>
                  This will be added after gid in vendor link. Example:
                  pid=&#123;&#123;PANELIST IDENTIFIER&#125;&#125;
                </small>
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
                  <textarea
                    name="complete_link"
                    value={formData.complete_link}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Disqualify Link</label>
                  <textarea
                    name="terminate_link"
                    value={formData.terminate_link}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Quota Full Link</label>
                  <textarea
                    name="quota_full_link"
                    value={formData.quota_full_link}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Security Term Link</label>
                  <textarea
                    name="security_terminate_link"
                    value={formData.security_terminate_link}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkbox-box">
                  <strong>Data to Ask on Redirect:</strong>

                  <label>
                    <input
                      type="checkbox"
                      name="ask_email"
                      checked={formData.ask_email}
                      onChange={handleChange}
                    />
                    Email Address
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="ask_zip"
                      checked={formData.ask_zip}
                      onChange={handleChange}
                    />
                    Zip Code
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="ask_age"
                      checked={formData.ask_age}
                      onChange={handleChange}
                    />
                    Age
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="ask_gender"
                      checked={formData.ask_gender}
                      onChange={handleChange}
                    />
                    Gender
                  </label>
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

      {showLinkCodes && (
        <div className="modal-overlay" onClick={() => setShowLinkCodes(false)}>
          <div className="link-codes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Redirect End Pages & Variables</h2>

              <button className="close-btn" onClick={() => setShowLinkCodes(false)}>
                ✕
              </button>
            </div>

            <div className="modal-content-grid">
              <div>
                <h3>Client Redirect Links</h3>
                <LinkRow label="Complete" value={completeUrl} onCopy={copyText} />
                <LinkRow label="Terminate" value={terminateUrl} onCopy={copyText} />
                <LinkRow label="Quota Full" value={quotaFullUrl} onCopy={copyText} />
                <LinkRow label="Security" value={securityUrl} onCopy={copyText} />
              </div>

              <div>
                <h3>Variables</h3>
                <table className="variables-table">
                  <tbody>
                    <tr><td>Our Respondent ID</td><td>{"{{ID}} / {{OBID}}"}</td></tr>
                    <tr><td>Vendor Panelist ID</td><td>{"{{panellist_id}}"}</td></tr>
                    <tr><td>Vendor Template PID</td><td>{"{{PANELIST IDENTIFIER}}"}</td></tr>
                    <tr><td>Panel Misc Data</td><td>{"{{PANEL MISC DATA}}"}</td></tr>
                    <tr><td>Pass Through</td><td>{"{{PASSTHRU}}"}</td></tr>
                    <tr><td>Reconnect ID</td><td>{"{{RECONNECTID}}"}</td></tr>
                    <tr><td>Status</td><td>{"{{status}}"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
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