import { useEffect, useState } from "react";
import { getProjects } from "../../api/projectApi";
import {
  getDashboardStats,
  getProjectReport,
  getSupplierStats,
} from "../../api/reportApi";
import StatCard from "../../components/common/StatCard";

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

  if (!dashboardStats) {
    return <p>Loading reports...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Analyze project and supplier performance</p>
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
        <div className="stats-grid">
          <StatCard title="Project Hits" value={projectReport.total_hits} />
          <StatCard title="Completes" value={projectReport.completes} />
          <StatCard title="Terminates" value={projectReport.terminates} />
          <StatCard title="Quota Full" value={projectReport.quota_full} />
          <StatCard title="Security Term" value={projectReport.security_terminates} />
          <StatCard title="Project IR" value={`${projectReport.ir}%`} />
        </div>
      )}

      {supplierStats.length > 0 && (
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
                  <th>Terminated</th>
                  <th>Quota Full</th>
                  <th>Security Term</th>
                  <th>IR</th>
                  <th>CPC</th>
                  <th>Last Completed</th>
                </tr>
              </thead>

              <tbody>
                {supplierStats.map((item) => (
                  <tr key={item.project_vendor_id}>
                    <td>{item.vendor_name}</td>
                    <td>{item.target}</td>
                    <td>{item.hits}</td>
                    <td>{item.completed}</td>
                    <td>{item.terminated}</td>
                    <td>{item.quota_full}</td>
                    <td>{item.security_term}</td>
                    <td>{item.ir}%</td>
                    <td>{item.vendor_cpc}</td>
                    <td>{item.last_completed || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;