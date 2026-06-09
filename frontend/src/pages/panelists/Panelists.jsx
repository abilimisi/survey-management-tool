import { useEffect, useState } from "react";
import { getPanelists, syncPanelists } from "../../api/panelistApi";
import "./Panelists.css";

function Panelists() {
  const [panelists, setPanelists] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPanelists();
  }, []);

  const fetchPanelists = async () => {
    try {
      const data = await getPanelists();
      setPanelists(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);

      const result = await syncPanelists();

      alert(
        `Sync completed. Created: ${result.created}, Updated: ${result.updated}`
      );

      fetchPanelists();
    } catch (error) {
      console.error(error);
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="panelists-page">
      <div className="page-header-flex">
        <div>
          <h1>Panelists</h1>
          <p>Website signup users from OB Panel</p>
        </div>

        <button
          className="primary-btn"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Sync Website Users"}
        </button>
      </div>

      <div className="panelist-stats-grid">
        <div className="panelist-stat-card">
          <span>Total Panelists</span>
          <strong>{panelists.length}</strong>
        </div>

        <div className="panelist-stat-card">
          <span>Male</span>
          <strong>
            {panelists.filter((p) => p.gender === "Male").length}
          </strong>
        </div>

        <div className="panelist-stat-card">
          <span>Female</span>
          <strong>
            {panelists.filter((p) => p.gender === "Female").length}
          </strong>
        </div>
      </div>

      <div className="panelist-card">
        <div className="panelist-card-header">
          <h3>Website Signup List</h3>
          <span>{panelists.length} records</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table panelist-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Country</th>
                <th>Industry</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {panelists.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="panelist-name">
                      <div className="avatar">
                        {(p.fname?.[0] || "P").toUpperCase()}
                      </div>

                      <div className="panelist-info">
                        <strong
                            title={`${p.fname} ${p.lname}`}
                            className="panelist-fullname"
                        >
                            {p.fname} {p.lname}
                        </strong>

                        <small>Panelist ID: {p.id}</small>
                        </div>
                    </div>
                  </td>

                  <td>{p.email}</td>
                  <td>
                    <span className="badge">{p.gender || "-"}</span>
                  </td>
                  <td>{p.country || "-"}</td>
                  <td>{p.industry || "-"}</td>
                  <td>{p.registered_at || "-"}</td>
                </tr>
              ))}

              {panelists.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No panelists found. Click Sync Website Users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Panelists;