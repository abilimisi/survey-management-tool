import "./project-vendor.css";

export default function VendorPerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-empty">
        No Vendor Performance Data
      </div>
    );
  }

  return (
    <div className="analytics-table-wrapper">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Vendor</th>
            <th>Hits</th>
            <th>Complete</th>
            <th>IR</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {data.map((vendor) => (
            <tr key={vendor.vendor_id}>
              <td>
                <span className="rank-badge">
                  #{vendor.rank}
                </span>
              </td>

              <td className="table-name">
                {vendor.vendor_name}
              </td>

              <td>{vendor.hits}</td>

              <td>{vendor.completes}</td>

              <td>
                <div className="ir-cell">
                  <span
                    className={
                      vendor.ir >= 60
                        ? "status-good"
                        : vendor.ir >= 40
                        ? "status-warning"
                        : "status-bad"
                    }
                  >
                    {vendor.ir}%
                  </span>

                  <div className="ir-track">
                    <div
                      className={`ir-fill ${
                        vendor.ir >= 60
                          ? "fill-good"
                          : vendor.ir >= 40
                          ? "fill-warning"
                          : "fill-bad"
                      }`}
                      style={{ width: `${Math.min(vendor.ir, 100)}%` }}
                    />
                  </div>
                </div>
              </td>

              <td>
                <strong>{vendor.performance_score}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
