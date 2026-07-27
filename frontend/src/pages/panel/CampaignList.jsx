import { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import {Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPanelCampaigns,
  deletePanelCampaign,
} from "../../api/panelCampaignApi";
import { getProjects } from "../../api/projectApi";
import "./Campaign.css";

const CampaignList = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filters, setFilters] = useState({

    campaignId: "",

    campaignName: "",

    project: "",

    status: "",

    country: ""

});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchCampaigns();
    loadProjects();
  }, []);

 

  // Pagination

  const indexOfLastRecord = currentPage * recordsPerPage;

  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredCampaigns.slice(
      indexOfFirstRecord,
      indexOfLastRecord
  );

  const totalPages = Math.ceil(
      filteredCampaigns.length / recordsPerPage
  );

  const fetchCampaigns = async () => {
    try {
      const data = await getPanelCampaigns();
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjects = async () => {

      try{

          const data = await getProjects();

          setProjects(data);

      }

      catch(err){

          console.error(err);

      }

  };

      const handleSearch = () => {

          const filtered = campaigns.filter((campaign) => {

              const campaignIdMatch =
                  filters.campaignId === "" ||
                  String(campaign.id)
                      .toLowerCase()
                      .includes(filters.campaignId.toLowerCase());

              const campaignNameMatch =
                  filters.campaignName === "" ||
                  campaign.name
                      .toLowerCase()
                      .includes(filters.campaignName.toLowerCase());

              const projectMatch =
                  filters.project === "" ||
                  campaign.project_name === filters.project;

              const statusMatch =
                  filters.status === "" ||
                  campaign.status === filters.status;

              const countryMatch =
                  filters.country === "" ||
                  campaign.country
                      .toLowerCase()
                      .includes(filters.country.toLowerCase());

              return (

                  campaignIdMatch &&
                  campaignNameMatch &&
                  projectMatch &&
                  statusMatch &&
                  countryMatch

              );

          });

          setFilteredCampaigns(filtered);
          setCurrentPage(1);
      };

      const clearFilters = () => {

          setFilters({

              campaignId: "",

              campaignName: "",

              project: "",

              status: "",

              country: ""

          });

          setFilteredCampaigns(campaigns);
          setCurrentPage(1);
      };

       const handleDelete = async (id) => {

          const confirmDelete = window.confirm(
            "Delete this campaign?"
          );

          if (!confirmDelete) return;

          try {

            await deletePanelCampaign(id);

            toast.success("Campaign deleted successfully!", {
              position: "top-right",
              autoClose: 2000,
            });

            fetchCampaigns();
       

    } catch (err) {

      console.error(err);

      toast.error("Failed to delete campaign!", {
        position: "top-right",
        autoClose: 2000,
      });

    }

  };

  return (
    <div className="campaign-page">

      <div className="campaign-header">

        <h2>Panel Campaigns</h2>

        <button
          className="primary-btn"
          onClick={() =>
            navigate("/panel-campaigns/create")
          }
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Campaign
        </button>

      </div>

      <div className="campaign-search-panel">

          <div className="search-row">

              <input

                  type="text"

                  placeholder="Campaign Name"

                  value={filters.campaignName}

                  onChange={(e)=>

                      setFilters({

                          ...filters,

                          campaignName:e.target.value

                      })

                  }

              />

              <select

                  value={filters.project}

                  onChange={(e)=>

                      setFilters({

                          ...filters,

                          project:e.target.value

                      })

                  }

              >

                  <option value="">Project</option>

                  {projects.map(project=>(

                      <option

                          key={project.id}

                          value={project.name}

                      >

                          {project.name}

                      </option>

                  ))}

              </select>

              <select

                  value={filters.status}

                  onChange={(e)=>

                      setFilters({

                          ...filters,

                          status:e.target.value

                      })

                  }

              >

                  <option value="">Status</option>

                  <option value="draft">Draft</option>

                  <option value="running">Running</option>

                  <option value="paused">Paused</option>

                  <option value="completed">Completed</option>

              </select>

              <input

                  type="text"

                  placeholder="Country"

                  value={filters.country}

                  onChange={(e)=>

                      setFilters({

                          ...filters,

                          country:e.target.value

                      })

                  }

              />

              <input

                  type="text"

                  placeholder="Campaign ID"

                  value={filters.campaignId}

                  onChange={(e)=>

                      setFilters({

                          ...filters,

                          campaignId:e.target.value

                      })

                  }

              />

          </div>

      </div>
      <div className="search-buttons">

              <button

                  // className="primary-btn"
                  className="submit-btn "

                  onClick={handleSearch}

              >

                  Submit

              </button>

              <button
                  className="reset-btn"
                  onClick={clearFilters}
              >

                  Reset

              </button>

              

          </div>

          <hr className="project-divider" />


      <div className="table-scroll">

      <table className="campaign-table">

        <thead>

          <tr>
              <th>Campaign ID</th>
              <th>Name</th>
              <th>Project</th>
              <th>Status</th>
              <th>Target</th>
              <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {filteredCampaigns.length === 0 && (

            <tr className="empty-row">
              <td colSpan={6}>No campaigns found.</td>
            </tr>

          )}

          {currentRecords.map((campaign) => (

            <tr key={campaign.id}>

                <td>
                    {campaign.id}
                </td>

                <td>
                    {campaign.name}
                </td>

                <td>
                    {campaign.project_name}
                </td>

              <td>

                <span
                  className={`status-pill status-${String(
                    campaign.status
                  ).toLowerCase()}`}
                >
                  {campaign.status}
                </span>

              </td>

              <td className="mono-cell">{campaign.target}</td>

              <td>

                <div className="table-actions_01">

                <Link
                    to={`/panel-campaigns/${campaign.id}`}
                    className="view-btn"
                  >
                    <Eye size={14} strokeWidth={2} />
                  </Link>

                <Link
                    to={ `/panel-campaigns/${campaign.id}/edit`}
                    className="edit-btn1"
                    title="Edit Project"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(campaign.id)
                      
                    }
                  >
                    <Trash2 size={14} strokeWidth={2}/>
                  </button>

                <button
                  className="btn-ghost"
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/recipients`
                    )
                  }
                >
                  Recipients
                </button>

                <button
                  className="btn-ghost"
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/survey-links`
                    )
                  }
                >
                  Links
                </button>

                <button
                  className="btn-ghost"
                  onClick={() =>
                      navigate(
                          `/panel-campaigns/${campaign.id}/email-template`
                      )
                  }
              >
                  Email Template
              </button>

                </div>
                
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      </div>
      
      <div className="pagination-section">

        <div className="pagination-info">

            Showing {filteredCampaigns.length === 0
                ? 0
                : indexOfFirstRecord + 1}
            {" "}to{" "}
            {Math.min(
                indexOfLastRecord,
                filteredCampaigns.length
            )}
            {" "}of{" "}
            {filteredCampaigns.length}
            {" "}entries

        </div>

        <div className="pagination-buttons">

            <button
                disabled={currentPage === 1}
                onClick={() =>
                    setCurrentPage(currentPage - 1)
                }
            >
                Previous
            </button>

            {Array.from(
                { length: totalPages },
                (_, index) => (

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

                )
            )}

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

      <ToastContainer />
      
    </div>
  );
};

export default CampaignList;
