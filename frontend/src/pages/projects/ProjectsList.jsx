import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { getProjects, deleteProject } from "../../api/projectApi";
import "./ProjectList.css";

function ProjectsList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(id);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      bidding: "Bidding",
      api_staging: "API Staging",
      running: "Running",
      testing: "Testing",
      on_hold: "On Hold",
      awaiting_ids: "Awaiting ID's",
      completed: "Completed",
      closed: "Closed",
    };

    return labels[status] || status || "-";
  };

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1>Projects</h1>
          <p>Manage client survey projects</p>
        </div>

        <Link to="/projects/add" className="primary-btn">
          <Plus size={17} />
          Add Project
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Client</th>
              <th>Country</th>
              <th>Start Date</th>
              <th>Target</th>
              <th>Hits</th>
              <th>Comp.</th>
              <th>QF</th>
              <th>IR%</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <td>{project.id}</td>

            <td>
              <div className="project-name-cell">
                <div>{project.name}</div>
                <span className="project-country">
                  {project.country}
                </span>
              </div>
            </td>

            <td>{project.client_name || "-"}</td>

            <td>{project.country || "-"}</td>

            <td>
              {project.start_date
                ? new Date(project.start_date).toLocaleDateString()
                : "-"}
            </td>

            <td>{project.target || 0}</td>

            <td>{project.hits || 0}</td>

            <td>{project.completes || 0}</td>

            <td>{project.quota_full_count || 0}</td>

            <td>
              <span
                className={
                  project.ir_percentage > 20
                    ? "ir-good"
                    : "ir-bad"
                }
              >
                {project.ir_percentage || 0}%
              </span>
            </td>

            <td>
              <span
                className={`status-pill status-${project.status}`}
              >
                {getStatusLabel(project.status)}
              </span>
            </td>

            <td>
              <div className="table-actions">
                <Link
                  to={`/projects/${project.id}`}
                  className="view-btn"
                >
                  <Eye size={14} strokeWidth={2} />
                </Link>

                <Link
                  to={`/projects/edit/${project.id}`}
                  className="edit-btn"
                  title="Edit Project"
                >
                  <Pencil size={14} strokeWidth={2} />
                </Link>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(project.id)}
                  title="Delete Project"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>        
      </table>
    </div>
    </div>
  );
}

export default ProjectsList;