import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRespondentHints } from "../../api/respondentApi";

function SupplierHints() {
  const { projectVendorId } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHints();
  }, [projectVendorId]);

  const fetchHints = async () => {
    try {
      const response = await getRespondentHints(projectVendorId);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <p>Loading hints...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Respondent Hints</h1>
        <p>
          Project: {data.project_name} | Vendor: {data.vendor_name}
        </p>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Respondent ID</th>
              <th>Vendor PID</th>
              <th>Project</th>
              <th>Country</th>
              <th>Vendor</th>
              {/* <th>vCPC</th> */}
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
                <td>{item.project}</td>
                <td>{item.country}</td>
                <td>{item.vendor}</td>
                {/* <td>{item.vendor_cpc}</td> */}
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
                <td colSpan="11" style={{ textAlign: "center" }}>
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