import { useEffect, useState } from "react";
import { getPanelists, syncPanelists } from "../../api/panelistApi";
import "./Panelists.css";

function Panelists() {
  const [panelists, setPanelists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    country: "",
    gender: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      country: "",
      gender: "",
    });
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleReset = () => {
    const emptyFilters = {
      country: "",
      gender: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };


  const filteredPanelists =
    panelists.filter((p) => {

      const matchesCountry =
        !appliedFilters.country ||
        p.country ===
          appliedFilters.country;

      const matchesGender =
        !appliedFilters.gender ||
        p.gender ===
          appliedFilters.gender;

      return (
        matchesCountry &&
        matchesGender
      );
    });

    const recordsPerPage = 5;

    const indexOfLastRecord =
      currentPage * recordsPerPage;

    const indexOfFirstRecord =
      indexOfLastRecord - recordsPerPage;

    const currentPanelists =
      filteredPanelists.slice(
        indexOfFirstRecord,
        indexOfLastRecord
      );

    const totalPages = Math.ceil(
      filteredPanelists.length /
        recordsPerPage
    );

    const exportToCSV = () => {

      const headers = [
        "Panelist ID",
        "First Name",
        "Last Name",
        "Email",
        "Gender",
        "Country",
        "Industry",
        "Age",
        "Registered",
        "Opt-in",
        "Verified",
        "Verified Date",
        "Total Surveys",
        "Completed",
        "Terminated",
        "Quota Full",
        "Security Terminated",
        "IR (%)"
      ];

      const rows = filteredPanelists.map((p) => {

        const total = p.total_surveys || 0;
        const completed = p.completed_surveys || 0;

        const ir =
          total > 0
            ? ((completed / total) * 100).toFixed(2)
            : "0.00";

        return [
          p.id,
          p.fname,
          p.lname,
          p.email,
          p.gender,
          p.country,
          p.industry,
          p.age,
          p.registered_at,
          p.optin_type,
          p.email_verified ? "Verified" : "Pending",
          p.email_verified_at || "",
          total,
          completed,
          p.terminated_surveys || 0,
          p.quota_full_surveys || 0,
          p.security_terminated_surveys || 0,
          ir
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(row =>
          row.map(item => `"${item ?? ""}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "panelists.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
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

      <div className="search-panel">

        <select
          name="country"
          value={filters.country}
          onChange={handleFilterChange}
        >
          <option value="">
            Select Country
          </option>

          {[...new Set(
            panelists.map(
              (p) => p.country
            )
          )].map((country) => (

            <option
              key={country}
              value={country}
            >
              {country}
            </option>

          ))}
        </select>

        <select
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
        >
          <option value="">
            Select Gender
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>
        </select>

      </div>

      <div className="search-actions">

        <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          Submit
        </button>

        <button
          className="reset-btn"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="export-btn"
          onClick={exportToCSV}
        >
          Export CSV
        </button>

      </div>

      <hr className="project-divider" />

      <div className="panelist-card">
        <div className="panelist-card-header">
          <h3>Website Signup List</h3>
          <span>
            {filteredPanelists.length} records
          </span>
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
                <th>AGE</th>
                <th>Registered</th>
                <th>Opt-in</th>
                <th>Verified</th>
                <th>Verified Date</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Terminated</th>
                <th>Quota</th>
                <th>Security</th>
                <th>IR</th>
              </tr>
            </thead>

            <tbody>
              {currentPanelists.map((p) => {
                const ir =
                  p.total_surveys > 0
                    ? ((p.completed_surveys / p.total_surveys) * 100).toFixed(1)
                    : "0.0";
                return (
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
                  <td>{p.age || "-"}</td>
                  <td>{p.registered_at || "-"}</td>
                  <td>
                    <span className={`badge ${p.optin_type === "DOI" ? "badge-success" : "badge-warning"}`}>
                      {p.optin_type || "-"}
                    </span>
                  </td>

                  <td>
                    {p.email_verified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <span className="badge badge-danger">Pending</span>
                    )}
                  </td>

                  <td>
                    {p.verified_at
                      ? new Date(p.verified_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{p.total_surveys}</td>
                  <td>{p.completed_surveys}</td>
                  <td>{p.terminated_surveys}</td>
                  <td>{p.quota_full_surveys}</td>
                  <td>{p.security_terminated_surveys}</td>
                  <td>{ir}</td>
                  
                </tr>
                );
              })}

              {filteredPanelists.length === 0 && (
                <tr>
                  <td colSpan="10" className="empty-table">
                    No panelists found. Click Sync Website Users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-container">

            <div className="pagination-info">

              {filteredPanelists.length > 0
                ? `Showing ${indexOfFirstRecord + 1}
                  to ${Math.min(
                    indexOfLastRecord,
                    filteredPanelists.length
                  )}
                  of ${filteredPanelists.length}
                  entries`
                : "Showing 0 to 0 of 0 entries"}

            </div>

            <div className="pagination-controls">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(currentPage - 1)
                }
              >
                Previous
              </button>

              {[...Array(totalPages)].map(
                (_, index) => (
                  <button
                    key={index + 1}
                    className={
                      currentPage === index + 1
                        ? "active-page"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                  >
                    {index + 1}
                  </button>
                )
              )}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
              >
                Next
              </button>

            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Panelists;