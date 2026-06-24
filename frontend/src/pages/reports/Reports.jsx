import { useEffect, useState } from "react";
import { getProjects } from "../../api/projectApi";
import { getClients } from "../../api/clientApi";
import { getVendors } from "../../api/vendorApi";
import {
  getDashboardStats,
  getProjectReport,
  getSupplierStats,
  getClientProjects,
  getVendorProjects,
} from "../../api/reportApi";
import StatCard from "../../components/common/StatCard";
import "./Reports.css";

function Reports() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectReport, setProjectReport] = useState(null);
  const [supplierStats, setSupplierStats] = useState([]);
  const [activeTab, setActiveTab] = useState("project");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientProjects, setClientProjects] = useState([]);
  const [selectedClientProject, setSelectedClientProject] =
  useState("");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendorProjects, setVendorProjects] = useState([]);
  // const [clientProjects, setClientProjects] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const stats = await getDashboardStats();
      const projectData = await getProjects();
      const clientData = await getClients();
      const vendorData = await getVendors();
       
      // console.log("Projects:", projectData);

      setDashboardStats(stats);
      setProjects(projectData);
      setClients(clientData);
      setVendors(vendorData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);

    if (!projectId) {
      setProjectReport(null);
      setSupplierStats([]);
      return;
    }

    try {
      const report = await getProjectReport(projectId);
      const suppliers = await getSupplierStats(projectId);

      setProjectReport(report);
      setSupplierStats(suppliers);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClientChange = async (e) => {
    const clientId = e.target.value;

    setSelectedClient(clientId);

    setSelectedProject("");
    setProjectReport(null);
    setSupplierStats([]);

    if (!clientId) {
      setClientProjects([]);
      return;
    }

    try {
      const projects =
        await getClientProjects(clientId);

      console.log(
        "Projects Received:",
        projects
      );

      setClientProjects(projects);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVendorChange = async (e) => {

    const vendorId = e.target.value;

    setSelectedVendor(vendorId);

    setSelectedProject("");
    setProjectReport(null);
    setSupplierStats([]);

    if (!vendorId) {
      setVendorProjects([]);
      return;
    }

    try {

      const projects =
        await getVendorProjects(vendorId);

      setVendorProjects(projects);

    } catch (error) {
      console.error(error);
    }
  };

  const handleVendorProjectClick = async (
    projectId
  ) => {

    setSelectedProject(projectId);

    try {

      const report =
        await getProjectReport(projectId);

      const suppliers =
        await getSupplierStats(projectId);

      setProjectReport(report);
      setSupplierStats(suppliers);

    } catch (error) {
      console.error(error);
    }
  };



  const handleClientProjectClick = async (
    projectId
  ) => {
    setSelectedClientProject(projectId);
    setSelectedProject(projectId);
    try {
      const report =
        await getProjectReport(projectId);

      const suppliers =
        await getSupplierStats(projectId);

      setProjectReport(report);
      setSupplierStats(suppliers);

    } catch (error) {
      console.error(error);
    }
  };



  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportCSV = () => {
    if (!supplierStats.length) {
      alert("No supplier data to export.");
      return;
    }

    const headers = [
      "Vendor",
      "Target",
      "Hits",
      "Completed",
      "Terminated",
      "Quota Full",
      "Security Term",
      "IR",
      "CPC",
      "Last Completed",
    ];

    const rows = supplierStats.map((item) => [
      item.vendor_name,
      item.target,
      item.hits,
      item.completed,
      item.terminated,
      item.quota_full,
      item.security_term,
      `${item.ir}%`,
      item.vendor_cpc,
      formatDateTime(item.last_completed),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "supplier_report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const totalCompletes = supplierStats.reduce(
    (sum, item) => sum + Number(item.completed || 0),
    0
  );

  const bestIR = supplierStats.length
    ? Math.max(...supplierStats.map((item) => Number(item.ir || 0)))
    : 0;

  if (!dashboardStats) {
    return <p>Loading reports...</p>;
  }

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Reports</h1>
          <p>Analyze project, supplier and respondent performance</p>
        </div>

        <button className="primary-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>


      <div className="report-tabs">

        <button
          className={
            activeTab === "project"
              ? "tab-active"
              : ""
          }
          onClick={() => setActiveTab("project")}
        >
          Project
        </button>

        <button
          className={
            activeTab === "client"
              ? "tab-active"
              : ""
          }
          onClick={() => setActiveTab("client")}
        >
          Client
        </button>

        <button
          className={
            activeTab === "vendor"
              ? "tab-active"
              : ""
          }
          onClick={() => setActiveTab("vendor")}
        >
          Vendor
        </button>

      </div>

      {activeTab === "project" && (

      <div className="section-card">

        <h3>Project Report</h3>
        <p>Total Projects: {projects.length}</p>

        <div className="form-group">
          <label>Select Project</label>

          <select
            value={selectedProject}
            onChange={handleProjectChange}
          >
            <option value="">Select project</option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name} - {project.client_name}
              </option>
            ))}
          </select>
        </div>

      </div>
)}

{activeTab === "client" && (
  <div className="section-card">
    <h3>Client Reports</h3>

    <div className="report-filter-grid">

      <div className="form-group">
        <label>Select Client</label>
        <select
          value={selectedClient}
          onChange={handleClientChange}
        >
          <option value="">Select Client</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      
    </div>

    {clientProjects.length > 0 && (

      <div className="client-projects-section">

        <h4>Projects</h4>

        <table className="custom-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
            </tr>
          </thead>

          <tbody>

            {clientProjects.map((project) => (

              <tr
                key={project.id}
                onClick={() =>
                  handleClientProjectClick(project.id)
                }
                className="project-row"
              >
                <td>{project.id}</td>
                <td>{project.name}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}
  </div>
)}

{activeTab === "vendor" && (

<div className="section-card">

  <h3>Vendor Reports</h3>

  <div className="form-group">
    <label>Select Vendor</label>

    <select
      value={selectedVendor}
      onChange={handleVendorChange}
    >
      <option value="">
        Select Vendor
      </option>

      {vendors.map((vendor) => (
        <option
          key={vendor.id}
          value={vendor.id}
        >
          {vendor.name}
        </option>
      ))}
    </select>
  </div>
     

  {vendorProjects.length > 0 && (

      <div className="client-projects-section">

        <h4>Projects Handled By Vendor</h4>

        <table className="custom-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
            </tr>
          </thead>

          <tbody>

            {vendorProjects.map((project) => (

              <tr
                key={project.id}
                className="project-row"
                onClick={() =>
                  handleVendorProjectClick(project.id)
                }
              >
                <td>{project.id}</td>
                <td>{project.name}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}
      
</div>

)}



      {projectReport && (
        <>
          <div className="section-card">

  <h3>Project Information</h3>

  <div className="table-wrapper">

    <table className="custom-table">

      <thead>
        <tr>
          <th>Project</th>
          <th>Client</th>
          <th>Country</th>
          <th>Status</th>
          <th>LOI</th>
          <th>IR</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>{projectReport.project_name || "-"}</td>
          <td>{projectReport.client_name || "-"}</td>
          <td>{projectReport.country || "-"}</td>
          <td>{projectReport.status || "-"}</td>
          <td>{projectReport.loi || 0}</td>
          <td>{projectReport.ir || 0}%</td>
        </tr>
      </tbody>

    </table>

  </div>

</div>

          <div className="section-card">

            <h3>Project Statistics</h3>

            <div className="table-wrapper">

              <table className="custom-table">

                <thead>
                  <tr>
                    <th>Project Hits</th>
                    <th>Completes</th>
                    <th>Terminates</th>
                    <th>Quota Full</th>
                    <th>Security Term</th>
                    <th>Project IR</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{projectReport.total_hits}</td>
                    <td>{projectReport.completes}</td>
                    <td>{projectReport.terminates}</td>
                    <td>{projectReport.quota_full}</td>
                    <td>{projectReport.security_terminates}</td>
                    <td>{projectReport.ir}%</td>
                  </tr>
                </tbody>

              </table>

            </div>

          </div>
        </>
      )}

      {supplierStats.length > 0 && (
        <>
          <div className="section-card">
            <h3>Supplier Summary</h3>

            <div className="stats-grid">
              <StatCard title="Total Suppliers" value={supplierStats.length} />
              <StatCard title="Total Completes" value={totalCompletes} />
              <StatCard title="Best IR" value={`${bestIR}%`} />
            </div>
          </div>

          <div className="section-card">
            <h3>Supplier Performance</h3>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Target</th>
                    <th>Hits</th>
                    <th>Completed</th>
                    <th>Progress</th>
                    <th>Terminated</th>
                    <th>Quota Full</th>
                    <th>Security Term</th>
                    <th>IR</th>
                    <th>CPC</th>
                    <th>Last Completed</th>
                  </tr>
                </thead>

                <tbody>
                  {supplierStats.map((item) => {
                    const progress =
                      item.target > 0
                        ? Math.round((item.completed / item.target) * 100)
                        : 0;

                    return (
                      <tr key={item.project_vendor_id}>
                        <td>{item.vendor_name}</td>
                        <td>{item.target}</td>
                        <td>{item.hits}</td>
                        <td>
                          {item.completed}/{item.target}
                        </td>
                        <td>{progress}%</td>
                        <td>{item.terminated}</td>
                        <td>{item.quota_full}</td>
                        <td>{item.security_term}</td>
                        <td>
                          <span
                            className={
                              Number(item.ir) >= 20 ? "ir-good" : "ir-bad"
                            }
                          >
                            {item.ir}%
                          </span>
                        </td>
                        <td>{item.vendor_cpc}</td>
                 
                        <td>{formatDateTime(item.last_completed)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;