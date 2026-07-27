import "./project-vendor.css";

export default function ProjectPerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-empty">
        No Project Performance Data
      </div>
    );
  }

  return (
    <div className="analytics-table-wrapper">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Project</th>
            <th>Hits</th>
            <th>Complete</th>
            <th>IR</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((project) => (
            <tr key={project.project_id}>
              <td>
                <span className="rank-badge">
                  #{project.rank}
                </span>
              </td>

              <td className="table-name">
                {project.project_name}
              </td>

              <td>{project.total_hits}</td>

              <td>{project.completes}</td>

              <td>
                <span
                  className={
                    project.ir >= 60
                      ? "status-good"
                      : project.ir >= 40
                      ? "status-warning"
                      : "status-bad"
                  }
                >
                  {project.ir}%
                </span>
              </td>

              <td>
                <span
                  className={`project-status ${project.status}`}
                >
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}