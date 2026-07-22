import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


import {
    getPanelCampaign
} from "../../api/panelCampaignApi";

import "./CampaignDetail.css";

const CampaignDetail = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);

    useEffect(() => {

        loadCampaign();

    }, []);

    const loadCampaign = async () => {

        try {

            const data = await getPanelCampaign(id);

            setCampaign(data);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!campaign) {

        return <h3>Loading...</h3>;

    }

    return (

        <div className="campaign-detail">

            <h2>{campaign.name}</h2>

            <div className="campaign-card">

                <div>

                    <strong>Project</strong>

                    <p>{campaign.project_name}</p>

                </div>

                <div>

                    <strong>Status</strong>

                    <p>{campaign.status}</p>

                </div>

                <div>

                    <strong>Target</strong>

                    <p>{campaign.target}</p>

                </div>

                <div>

                    <strong>Country</strong>

                    <p>{campaign.country || "-"}</p>

                </div>

                <div>

                    <strong>Gender</strong>

                    <p>{campaign.gender || "-"}</p>

                </div>

                <div>

                    <strong>Industry</strong>

                    <p>{campaign.industry || "-"}</p>

                </div>

                <div>

                    <strong>Notes</strong>

                    <p>{campaign.notes}</p>

                </div>

            </div>

            <div className="campaign-actions">

                <button
                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/recipients`)
                    }
                >
                    Recipients
                </button>

                <button

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/generate`)
                    }

                >
                    Generate Recipients
                </button>

                <button

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/recipients`)
                    }

                >
                    View Recipients
                </button>

                <button

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/survey-links`)
                    }

                >
                    Survey Links
                </button>

                <button

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/stats`)
                    }

                >
                    Statistics
                </button>

            </div>

        </div>

    );

};

export default CampaignDetail;