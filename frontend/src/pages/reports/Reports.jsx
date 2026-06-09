import { useEffect, useState } from "react";
import { getProjects } from "../../api/projectApi";
import {
  getDashboardStats,
  getProjectReport,
  getSupplierStats,
} from "../../api/reportApi";
import StatCard from "../../components/common/StatCard";
import "./Reports.css";

function Reports() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectReport, setProjectReport] = useState(null);
  const [supplierStats, setSupplierStats] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const stats = await getDashboardStats();
      const projectData = await getProjects();

      setDashboardStats(stats);
      setProjects(projectData);
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

      <div className="stats-grid">
        <StatCard title="Total Hits" value={dashboardStats.total_hits} />
        <StatCard title="Completes" value={dashboardStats.completes} />
        <StatCard title="Terminates" value={dashboardStats.terminates} />
        <StatCard title="Quota Full" value={dashboardStats.quota_full} />
        <StatCard title="Security Term" value={dashboardStats.security_terminates} />
        <StatCard title="Overall IR" value={`${dashboardStats.ir}%`} />
      </div>

      <div className="section-card">
        <h3>Project Report</h3>

        <div className="form-group">
          <label>Select Project</label>

          <select value={selectedProject} onChange={handleProjectChange}>
            <option value="">Select project</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {projectReport && (
        <>
          <div className="section-card">
            <h3>Project Information</h3>

            <div className="report-info-grid">
              <div>
                <span>Project</span>
                <strong>{projectReport.project_name || "-"}</strong>
              </div>

              <div>
                <span>Client</span>
                <strong>{projectReport.client_name || "-"}</strong>
              </div>

              <div>
                <span>Country</span>
                <strong>{projectReport.country || "-"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{projectReport.status || "-"}</strong>
              </div>

              <div>
                <span>LOI</span>
                <strong>{projectReport.loi || 0}</strong>
              </div>

              <div>
                <span>IR</span>
                <strong>{projectReport.ir || 0}%</strong>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard title="Project Hits" value={projectReport.total_hits} />
            <StatCard title="Completes" value={projectReport.completes} />
            <StatCard title="Terminates" value={projectReport.terminates} />
            <StatCard title="Quota Full" value={projectReport.quota_full} />
            <StatCard title="Security Term" value={projectReport.security_terminates} />
            <StatCard title="Project IR" value={`${projectReport.ir}%`} />
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