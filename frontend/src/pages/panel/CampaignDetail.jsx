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

        return <h3 className="page-loading">Loading...</h3>;

    }

    return (

        <div className="campaign-detail">

            <div className="campaign-detail-header">

                <h2>{campaign.name}</h2>

                <span
                    className={`status-badge status-${String(
                        campaign.status
                    ).toLowerCase()}`}
                >
                    {campaign.status}
                </span>

            </div>

            <div className="campaign-card">

                <div className="detail-field">

                    <strong>Project</strong>

                    <p>{campaign.project_name}</p>

                </div>

                <div className="detail-field">

                    <strong>Status</strong>

                    <p>{campaign.status}</p>

                </div>

                <div className="detail-field">

                    <strong>Target</strong>

                    <p>{campaign.target}</p>

                </div>

                <div className="detail-field">

                    <strong>Country</strong>

                    <p>{campaign.country || "-"}</p>

                </div>

                <div className="detail-field">

                    <strong>Gender</strong>

                    <p>{campaign.gender || "-"}</p>

                </div>

                <div className="detail-field">

                    <strong>Industry</strong>

                    <p>{campaign.industry || "-"}</p>

                </div>

                <div className="detail-field detail-field-wide">

                    <strong>Notes</strong>

                    <p>{campaign.notes}</p>

                </div>

            </div>

            <div className="campaign-actions">

                <button
                    className="btn-ghost"
                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/recipients`)
                    }
                >
                    Recipients
                </button>

                <button

                    className="btn-ghost"

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/generate`)
                    }

                >
                    Generate Recipients
                </button>

                <button

                    className="btn-ghost"

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/recipients`)
                    }

                >
                    View Recipients
                </button>

                <button

                    className="btn-ghost"

                    onClick={() =>
                        navigate(`/panel-campaigns/${id}/survey-links`)
                    }

                >
                    Survey Links
                </button>

                <button

                    className="btn-primary"

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
