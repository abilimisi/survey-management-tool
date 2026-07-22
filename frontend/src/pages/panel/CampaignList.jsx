import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  getPanelCampaigns,
  deletePanelCampaign,
} from "../../api/panelCampaignApi";

import "./Campaign.css";

const CampaignList = () => {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase();

    setFilteredCampaigns(
      campaigns.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(value) ||
          campaign.project_name.toLowerCase().includes(value)
      )
    );
  }, [search, campaigns]);

  const fetchCampaigns = async () => {
    try {
      const data = await getPanelCampaigns();
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this campaign?"
    );

    if (!confirmDelete) return;

    try {
      await deletePanelCampaign(id);

      fetchCampaigns();
    } catch (err) {
      console.error(err);
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
          + Create Campaign
        </button>

      </div>

      <div className="campaign-toolbar">

        <input
          type="text"
          placeholder="Search Campaign..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <table className="campaign-table">

        <thead>

          <tr>

            <th>Name</th>

            <th>Project</th>

            <th>Status</th>

            <th>Target</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {filteredCampaigns.map((campaign) => (

            <tr key={campaign.id}>

              <td>{campaign.name}</td>

              <td>{campaign.project_name}</td>

              <td>{campaign.status}</td>

              <td>{campaign.target}</td>

              <td>

                <button
                    onClick={() =>
                        navigate(`/panel-campaigns/${campaign.id}`)
                    }
                >
                    View
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/edit`
                    )
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/recipients`
                    )
                  }
                >
                  Recipients
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/stats`
                    )
                  }
                >
                  Stats
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/panel-campaigns/${campaign.id}/survey-links`
                    )
                  }
                >
                  Links
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(campaign.id)
                    
                  }
                >
                  <Trash2 size={14} strokeWidth={2}/>
                </button>
                
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default CampaignList;