import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCampaignDashboard,
    getCampaignPanelSummary,
} from "../../api/panelCampaignApi";

import "./CampaignDashboard.css";

export default function CampaignDashboard() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);

    const [summary, setSummary] = useState([]);

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        const dashboard = await getCampaignDashboard(id);

        const panelSummary = await getCampaignPanelSummary(id);

        setCampaign(dashboard);

        setSummary(panelSummary);

    };

    const openList = (type) => {

        navigate(
            `/panel-campaigns/${id}/respondents?status=${type}`
        );

    };

    if (!campaign)
        return <p className="page-loading">Loading...</p>;

    return (

        <div className="campaign-dashboard">

            <div className="dashboard-header_01">

                <div className="dashboard-header-info_02">

                    <h2>{campaign.campaign.name}</h2>

                    <p>
                        <strong>Project :</strong> {campaign.campaign.project_name}
                    </p>

                    <p>
                        <strong>Vendor :</strong> {campaign.campaign.vendor_name}
                    </p>

                </div>

                <div className={`status-badge status-${String(campaign.campaign.status).toLowerCase()}`}>

                    {campaign.campaign.status}

                </div>

            </div>

            <div className="table-scroll">

            <table className="dashboard-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Panel</th>

                        <th>Status</th>

                        <th>Hits</th>

                        <th>Completed</th>

                        <th>Terminate</th>

                        <th>Quota Full</th>

                        <th>Security</th>

                        <th>IR</th>

                        {/* <th>Last Completed</th> */}

                    </tr>

                </thead>

                <tbody>

                    {

                        summary.map((row)=>(

                            <tr key={row.id}>

                                <td>{row.id}</td>

                                <td>{row.panel}</td>

                                <td>{row.status}</td>

                                <td>

                                    <button
                                        className="table-link"
                                        onClick={() => openList("hits")}
                                    >
                                        {row.hits}/{row.generated}
                                    </button>

                                </td>

                                <td>

                                    <button
                                        className="table-link"
                                        onClick={() => openList("complete")}
                                    >
                                        {row.completed}/{row.generated}
                                    </button>

                                </td>

                                <td>

                                    <button
                                        className="table-link"
                                        onClick={() => openList("terminate")}
                                    >
                                        {row.terminate}
                                    </button>

                                </td>

                                <td>

                                    <button
                                        className="table-link"
                                        onClick={() => openList("quota")}
                                    >
                                        {row.quota_full}
                                    </button>

                                </td>

                                <td>

                                    <button
                                        className="table-link"
                                        onClick={() => openList("security")}
                                    >
                                        {row.security_term}
                                    </button>

                                </td>

                                <td>{row.ir}%</td>

                                {/* <td>{row.last_completed}</td> */}

                            </tr>

                        ))

                    }

                </tbody>

            </table>

            </div>

        </div>

    );

}
