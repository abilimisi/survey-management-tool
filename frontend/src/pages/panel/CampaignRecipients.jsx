import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getCampaignRecipients,
    generateRecipients,
    sendCampaignEmails,
} from "../../api/panelCampaignApi";

import "./CampaignRecipients.css";

export default function CampaignRecipients() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [recipients, setRecipients] = useState([]);


    const loadRecipients = async () => {

        const data = await getCampaignRecipients(id);

        setRecipients(data);
    };

    useEffect(() => {

        loadRecipients();

    }, []);

    const handleGenerate = async () => {

        try {

            await generateRecipients(id, {});

            await loadRecipients();

            alert("Recipients generated successfully");

        }

        catch (err) {

            alert(
                err.response?.data?.message ||
                "Failed to generate recipients."
            );

        }

    };

    const handleLinks = () => {

        navigate(`/panel-campaigns/${id}/survey-links`);

    };

    const handleSendEmails = async () => {

        try {

            const data = await sendCampaignEmails(id);

            alert(`${data.emails_sent} emails sent`);

            loadRecipients();

        }

        catch (err) {

            console.error(err);

        }

    };

    return (

        <div className="campaign-recipients">

            <h2>Campaign Recipients</h2>

            <div className="top-buttons">

                <button className="btn-secondary" onClick={handleGenerate}>
                    Generate Recipients
                </button>

                <button className="btn-secondary" onClick={handleLinks}>
                    View Survey Links
                </button>

                <button className="btn-primary" onClick={handleSendEmails}>
                    Send Emails
                </button>

            </div>

            <div className="table-scroll">

            <table className="recipients-table">

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Country</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {recipients.length === 0 && (

                        <tr className="empty-row">
                            <td colSpan={4}>No recipients yet.</td>
                        </tr>

                    )}

                    {recipients.map(r=>(

                        <tr key={r.id}>

                            <td>{r.name}</td>

                            <td>{r.email}</td>

                            <td>{r.country}</td>

                            <td>
                                <span
                                    className={`status-pill status-${String(
                                        r.status
                                    ).toLowerCase()}`}
                                >
                                    {r.status}
                                </span>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            </div>


        </div>

    );

}
