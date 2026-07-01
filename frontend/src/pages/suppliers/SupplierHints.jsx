import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRespondentHints } from "../../api/respondentApi";

import { useSearchParams } from "react-router-dom";

function SupplierHints() {
  const { projectVendorId } = useParams();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHints();
  }, [projectVendorId, status]);

  const fetchHints = async () => {
    try {
      const response = await getRespondentHints(projectVendorId, status);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <p>Loading hints...</p>;


  const exportCSV = () => {

    if (!data.respondents.length) {
      alert("No respondents to export.");
      return;
    }

    const headers = [
      "Respondent ID",
      "Vendor PID",
      "Panel misc data:",
      "reconnect_id",
      "Project",
      "Country",
      "Vendor",
      "vCPC",
      "Status",
      "Previous Status",
      "IP Address",
      "Browser",
      "Operating System",
      "Device",
      "Time Taken",
      "Started",
      "Completed"
    ];

    const rows = data.respondents.map(item => [

      item.respondent_id,
      item.vendor_panelist_id,
      item.panel_misc_data || "",
      item.reconnect_id || "",
      item.project,
      item.country,
      item.vendor,
      item.vendor_cpc,
      item.status,
      item.previous_status || "",
      item.ip_address || "",
      item.browser || "",
      item.os || "",
      item.device || "",
      item.time_taken || "",
      item.started_at
        ? new Date(item.started_at).toLocaleString()
        : "",
      item.completed_at
        ? new Date(item.completed_at).toLocaleString()
        : ""

    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    // File Name
    link.download =
    `${data.project_vendor_id}_${data.project_name.replace(/\s+/g,"_")}_${data.vendor_name.replace(/\s+/g,"_")}_Respondent_Hints.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1>
        {
            status === "complete"
                ? "Completed Respondents"

            : status === "terminate"
                ? "Disqualified Respondents"

            : status === "quota_full"
                ? "Quota Full Respondents"

            : status === "security_terminate"
                ? "Security Terminated Respondents"

            : "All Respondents"
        }
        </h1>
        <p>
          Project: {data.project_name} | Vendor: {data.vendor_name}
        </p>
        <button className="btn btn-primary" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Respondent ID</th>
              <th>Vendor PID</th>
              <th>Panel misc data:</th>
              <th>reconnect_id</th>
              <th>Project</th>
              <th>Country</th>
              <th>Vendor</th>
              <th>vCPC</th>
              <th>Status</th>
              <th>Previous Status</th>
              {/* <th>S2S</th> */}
              <th>IP</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Device</th>
              <th>Time Taken</th>
              <th>Started</th>
              <th>Completed</th>
            </tr>
          </thead>

          <tbody>
            {data.respondents.map((item) => (
              <tr key={item.respondent_id}>
                <td>
                  <Link
                    to={`/respondents/${item.respondent_id}/journey`}
                    className="text-link"
                  >
                    {item.respondent_id}
                  </Link>
                </td>
                <td>{item.vendor_panelist_id}</td>
                <td>{item.panel_misc_data || "-"}</td>
                <td>{item.reconnect_id || "-"}</td>
                <td>{item.project}</td>
                <td>{item.country}</td>
                <td>{item.vendor}</td>
                <td>{item.vendor_cpc}</td>
                <td>
                  <span className={`status-pill status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.previous_status || "-"}</td>
                {/* <td>{item.s2s_status ? "Yes" : "No"}</td> */}
                <td>{item.ip_address || "-"}</td>
                <td>{item.browser}</td>
                <td>{item.os}</td>
                <td>{item.device}</td>
                <td>{item.time_taken || "-"}</td>
                <td>
                {item.started_at
                  ? new Date(item.started_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
                </td>

                <td>
                    {item.completed_at
                      ? new Date(item.completed_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                </td>
              </tr>
              ))}

            {data.respondents.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No respondents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierHints;