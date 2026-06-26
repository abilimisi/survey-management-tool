import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { getProjects, deleteProject } from "../../api/projectApi";
import "./ProjectList.css";

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const isSuperUser =
    localStorage.getItem("is_superuser") === "true";
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [filters, setFilters] = useState({
    id: "",
    projectName: "",
    client: "",
    country: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] =
    useState({
      id: "",
      projectName: "",
      client: "",
      country: "",
      status: "",
    });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      setAppliedFilters({
        id: "",
        projectName: "",
        client: "",
        country: "",
        status: "",
      });
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {

    const emptyFilters = {
      id: "",
      projectName: "",
      client: "",
      country: "",
      status: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
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

  // Pagination


// Pagination

  const indexOfLastRow =
    currentPage * recordsPerPage;

  const filteredProjects = projects.filter((project) => {

    const matchesId =
      !appliedFilters.id ||
      String(project.id).includes(appliedFilters.id);

    const matchesName =
      !appliedFilters.projectName ||
      project.name
        ?.toLowerCase()
        .includes(appliedFilters.projectName.toLowerCase());

    const matchesClient =
      !appliedFilters.client ||
      project.client_name
        ?.toLowerCase()
        .includes(appliedFilters.client.toLowerCase());

    const matchesCountry =
      !appliedFilters.country ||
      project.country
        ?.toLowerCase()
        .includes(appliedFilters.country.toLowerCase());

    const matchesStatus =
      !appliedFilters.status ||
      project.status === appliedFilters.status;

    return (
      matchesId &&
      matchesName &&
      matchesClient &&
      matchesCountry &&
      matchesStatus
    );
  });

  

  const indexOfFirstRow =
    indexOfLastRow - recordsPerPage;

  const currentProjects =
    filteredProjects.slice(
      indexOfFirstRow,
      indexOfLastRow
    );

  const totalPages = Math.ceil(
    filteredProjects.length / recordsPerPage
  );


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


      <div className="search-panel">

        <input
          type="text"
          name="id"
          placeholder="ID"
          value={filters.id}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="projectName"
          placeholder="Project Name"
          value={filters.projectName}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="client"
          placeholder="Client"
          value={filters.client}
          onChange={handleFilterChange}
        />

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={filters.country}
          onChange={handleFilterChange}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="running">Running</option>
          <option value="testing">Testing</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>

      </div>

      <div className="search-actions">

        <button
          className="submit-btn"
          type="button"
          onClick={handleSubmit}
        >

          Submit
        </button>

        <button
          className="reset-btn"
          type="button"
          onClick={handleReset}
        >
          Reset
        </button>

      </div>

      <hr className="project-divider" />
      


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
          {currentProjects.map((project) => (
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


                  {isSuperUser && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(project.id)}
                    title="Delete Project"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>        
      </table>
    </div>

    {/* <div className="table-footer">
      Showing 1 to {projects.length} of {projects.length} entries
    </div> */}

    <div className="pagination-container">

      <span className="pagination-info">
        Showing {indexOfFirstRow + 1}
        to {Math.min(indexOfLastRow, filteredProjects.length)}
        of {filteredProjects.length} entries
      </span>

      <div className="pagination-controls">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={
              currentPage === index + 1
                ? "active-page"
                : ""
            }
            onClick={() =>
              setCurrentPage(index + 1)
            }
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>

      </div>

    </div>

    </div>
  );
}

export default ProjectsList;