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
    const data = await getProjects();
    setProjects(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(id);
    fetchProjects();
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
              <th>Country</th>
              <th>Target</th>
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
                <td>{project.name}</td>
                <td>{project.client_name}</td>
                <td>{project.country}</td>
                <td>{project.target}</td>
                <td>{project.cpc}</td>
                <td>{project.loi}</td>
                <td>{project.ir}%</td>
                <td>
                  <span className={`status-pill status-${project.status}`}>
                    {project.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/projects/${project.id}`} className="view-btn">
                      <Eye size={16} />
                    </Link>

                    <Link to={`/projects/edit/${project.id}`} className="edit-btn">
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
                <td colSpan="10" style={{ textAlign: "center" }}>
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