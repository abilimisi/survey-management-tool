import {

  Activity,

  CheckCircle2,

  XCircle,

  Flag,

  Shield,

  Timer,

} from "lucide-react";

export default function ProjectSummaryCards({

  summary,

  project,

}) {

  return (

    <>

      {/* <div className="project-info-card">

        <h3>{project.name}</h3>

        <p>

          Client : <strong>{project.client}</strong>

        </p>

        <p>

          Country : <strong>{project.country}</strong>

        </p>

        <p>

          Status : <strong>{project.status}</strong>

        </p>

      </div> */}

      <div className="project-summary-grid">

        <div className="summary-card">

          <Activity />

          <div>

            <span>Total Hits</span>

            <h2>{summary.hits}</h2>

          </div>

        </div>

        <div className="summary-card">

          <CheckCircle2 />

          <div>

            <span>Completes</span>

            <h2>{summary.complete}</h2>

          </div>

        </div>

        <div className="summary-card">

          <XCircle />

          <div>

            <span>Terminates</span>

            <h2>{summary.terminate}</h2>

          </div>

        </div>

        <div className="summary-card">

          <Flag />

          <div>

            <span>Quota Full</span>

            <h2>{summary.quota_full}</h2>

          </div>

        </div>

        <div className="summary-card">

          <Shield />

          <div>

            <span>Security</span>

            <h2>{summary.security}</h2>

          </div>

        </div>

        <div className="summary-card">

          <Timer />

          <div>

            <span>IR</span>

            <h2>{summary.ir}%</h2>

          </div>

        </div>

      </div>

    </>

  );

}