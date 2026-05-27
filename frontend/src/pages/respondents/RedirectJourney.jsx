import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRedirectJourney } from "../../api/respondentApi";

function RedirectJourney() {
  const { respondentId } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchJourney();
  }, [respondentId]);

  const fetchJourney = async () => {
    try {
      const response = await getRedirectJourney(respondentId);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <p>Loading journey...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Redirect Journey</h1>
        <p>
          Respondent: {data.respondent_id} | Status: {data.status}
        </p>
      </div>

      <div className="details-card">
        <p><strong>Project:</strong> {data.project}</p>
        <p><strong>Vendor:</strong> {data.vendor}</p>
        <p><strong>Previous Status:</strong> {data.previous_status || "-"}</p>
        <p><strong>Started:</strong> {data.started_at}</p>
        <p><strong>Completed:</strong> {data.completed_at || "-"}</p>
      </div>

      <div className="section-card">
        <h3>Journey Timeline</h3>

        <div className="timeline">
          {data.journey.map((log, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-dot"></div>

              <div className="timeline-content">
                <h4>{log.redirect_type}</h4>
                <p>{log.created_at}</p>
                <div className="link-box">{log.redirect_url}</div>
              </div>
            </div>
          ))}

          {data.journey.length === 0 && (
            <p>No redirect logs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RedirectJourney;