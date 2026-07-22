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

   const handleExportCSV = () => {

        if (rows.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = [
            "Respondent ID",
            "Email",
            "Project",
            "Vendor",
            "Country",
            "Status",
            "Previous Status",
            "IP Address",
            "Started",
            "Completed"
        ];

        const csvRows = [];

        csvRows.push(headers.join(","));

        rows.forEach((row) => {

            csvRows.push([
                row.respondent_id,
                row.email,
                row.project,
                row.vendor,
                row.country,
                row.status,
                row.previous_status || "",
                row.ip || "",
                row.started_at
                    ? new Date(row.started_at).toLocaleString()
                    : "",
                row.completed_at
                    ? new Date(row.completed_at).toLocaleString()
                    : ""
            ].join(","));

        });

        const csvString = csvRows.join("\n");

        const blob = new Blob([csvString], {
            type: "text/csv;charset=utf-8;"
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `Campaign_Respondents_${id}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

    };

    return (

        <div className="campaign-respondents">

          <div className="respondents-header">

            <h2>Campaign Respondents</h2>

            <button
                className="export-btn1"
                onClick={handleExportCSV}
            >
                Export CSV
            </button>

        </div>

            <div className="table-scroll">

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

                                    <td className="mono-cell">{r.ip || "-"}</td>

                                    <td className="mono-cell">

                                        {
                                            r.started_at
                                                ? new Date(r.started_at).toLocaleString()
                                                : "-"
                                        }

                                    </td>

                                    <td className="mono-cell">

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

        </div>

    );

}
