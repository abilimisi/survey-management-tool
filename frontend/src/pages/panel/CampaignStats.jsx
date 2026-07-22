import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCampaignStats } from "../../api/panelCampaignApi";

import "./CampaignStats.css";

export default function CampaignStats() {

    const { id } = useParams();

    const [stats, setStats] = useState(null);

    useEffect(() => {

        loadStats();

    }, []);

    const loadStats = async () => {

        const data = await getCampaignStats(id);

        setStats(data);

    };

    if (!stats) {

        return <h3>Loading...</h3>;

    }

    return (

        <div className="campaign-stats">

            <h2>{stats.campaign}</h2>

            <div className="stats-grid">

                <div className="stat-card">
                    <h3>Total</h3>
                    <p>{stats.total}</p>
                </div>

                <div className="stat-card">
                    <h3>Email Sent</h3>
                    <p>{stats.sent}</p>
                </div>

                <div className="stat-card">
                    <h3>Clicked</h3>
                    <p>{stats.clicked}</p>
                </div>

                <div className="stat-card">
                    <h3>Started</h3>
                    <p>{stats.started}</p>
                </div>

                <div className="stat-card">
                    <h3>Complete</h3>
                    <p>{stats.complete}</p>
                </div>

                <div className="stat-card">
                    <h3>Terminate</h3>
                    <p>{stats.terminate}</p>
                </div>

                <div className="stat-card">
                    <h3>Quota Full</h3>
                    <p>{stats.quota_full}</p>
                </div>

            </div>

        </div>

    );

}