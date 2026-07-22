import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import {
    getCampaignRespondents
} from "../../api/panelCampaignApi";

import "./CampaignRespondents.css";

export default function CampaignRespondents() {

    const { id } = useParams();

    const [searchParams] = useSearchParams();

    const status = searchParams.get("status") || "";

    const [rows, setRows] = useState([]);

    const navigate=useNavigate();

    useEffect(() => {

        load();

    }, [status]);

    const load = async () => {

        try {

            const data = await getCampaignRespondents(
                id,
                status
            );

            setRows(data);

        }
        catch (err) {

            console.error(err);

        }

    };

    return (

        <div className="campaign-respondents">

            <div className="respondents-header">

                <h2>Campaign Respondents</h2>

            </div>

            <table className="respondents-table">

                <thead>

                    <tr>

                        <th>Respondent ID</th>

                        <th>Email</th>

                        <th>Project</th>

                        <th>Vendor</th>

                        <th>Country</th>

                        <th>Status</th>

                        <th>Previous Status</th>

                        <th>IP Address</th>

                        <th>Started</th>

                        <th>Completed</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        rows.length > 0 ? (

                            rows.map((r) => (

                                <tr key={r.respondent_id}>

                                    <td>

                                        <span

                                            className="respondent-id"

                                            onClick={()=>{

                                            navigate(

                                            `/respondents/${r.respondent_id}/journey`

                                            )

                                            }}

                                            >

                                            {r.respondent_id}

                                        </span>

                                    </td>

                                    <td>{r.email}</td>

                                    <td>{r.project}</td>

                                    <td>{r.vendor}</td>

                                    <td>{r.country}</td>

                                    <td>

                                        <span
                                            className={`status ${r.status}`}
                                        >

                                            {r.status}

                                        </span>

                                    </td>

                                    <td>{r.previous_status || "-"}</td>

                                    <td>{r.ip || "-"}</td>

                                    <td>

                                        {
                                            r.started_at
                                                ? new Date(r.started_at).toLocaleString()
                                                : "-"
                                        }

                                    </td>

                                    <td>

                                        {
                                            r.completed_at
                                                ? new Date(r.completed_at).toLocaleString()
                                                : "-"
                                        }

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan="10"
                                    className="no-data"
                                >

                                    No respondents found.

                                </td>

                            </tr>

                        )

                    }

                </tbody>

            </table>

        </div>

    );

}