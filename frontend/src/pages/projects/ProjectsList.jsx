import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { getProjects, deleteProject } from "../../api/projectApi";

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
          <Plus size={18} />
          Add Project
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Client</th>
              <th>Study Type</th>
              <th>Country</th>
              <th>Language</th>
              <th>Req. Completes</th>
              <th>Max. Completes</th>
              <th>CPC</th>
              <th>LOI</th>
              <th>IR</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>

                <td>{project.name || "-"}</td>

                <td>{project.client_name || "-"}</td>

                <td>{project.study_type || "-"}</td>

                <td>{project.country || "-"}</td>

                <td>{project.language || "-"}</td>

                <td>{project.target}</td>

                <td>{project.max_completes}</td>

                <td>{project.cpc}</td>

                <td>{project.loi}</td>

                <td>{project.ir}%</td>

                <td>
                  <span className={`status-pill status-${project.status}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <Link to={`/projects/${project.id}`} className="view-btn">
                      <Eye size={16} />
                    </Link>

                    <Link
                      to={`/projects/edit/${project.id}`}
                      className="edit-btn"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {projects.length === 0 && (
              <tr>
                <td colSpan="13" style={{ textAlign: "center" }}>
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectsList;