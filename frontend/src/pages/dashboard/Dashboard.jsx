
import { useEffect, useState } from "react";
import {
  MousePointerClick,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Activity,
 
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import "./Dashboard.css";

function Dashboard() {
 const [stats, setStats] = useState({
  overall: {
    total_hits: 0,
    completes: 0,
    terminates: 0,
    quota_full: 0,
    security_terminates: 0,
    ir: 0,
  },
  today: {
    total_hits: 0,
    completes: 0,
    terminates: 0,
    quota_full: 0,
    security_terminates: 0,
    ir: 0,
  },
  monthly: {
    total_hits: 0,
    completes: 0,
    terminates: 0,
    quota_full: 0,
    security_terminates: 0,
    ir: 0,
  },
});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/dashboard/stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }
  };

  const cards = [
    {
      title: "Total Hits",
      value: stats.overall.total_hits,
      icon: MousePointerClick,
      note: "Survey Starts",
      className: "card-blue",
    },
    {
      title: "Completes",
      value: stats.overall.completes,
      icon: CheckCircle,
      note: "Successful",
      className: "card-green",
    },
    {
      title: "Terminates",
      value: stats.overall.terminates,
      icon: XCircle,
      note: "Disqualified",
      className: "card-red",
    },
    {
      title: "Quota Full",
      value: stats.overall.quota_full,
      icon: AlertTriangle,
      note: "Quota Reached",
      className: "card-orange",
    },
    {
      title: "Security",
      value: stats.overall.security_terminates,
      icon: ShieldAlert,
      note: "Security Failures",
      className: "card-purple",
    },
    {
      title: "IR %",
      value: `${stats.overall.ir}%`,
      icon: BarChart3,
      note: "Incidence Rate",
      className: "card-indigo",
    },
  ];

  const nonCompletes =
    Number(stats.overall.terminates) +
    Number(stats.overall.quota_full) +
    Number(stats.overall.security_terminates);


  return (
    <div className="dashboard-page">
      
      {/* Header */}
      <div className="dashboard-header">
  
        <div className="header-content">
        <h1>Survey Dashboard</h1>
          <p>Monitor survey traffic, completions and respondent activity</p>
        </div>

      <div className="hero-badge">
    <Activity size={16} />
    Live Monitoring
  </div>

</div>

      {/* KPI Cards */}
      <div className="dashboard-stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className={`dashboard-card ${card.className}`}
              key={card.title}
            >
              <div className="dashboard-card-top">
                <div>
                  <p>{card.title}</p>
                  <h2>{card.value}</h2>
                </div>

                <div className="dashboard-icon">
                  <Icon size={22} />
                </div>
              </div>

              <span>{card.note}</span>
            </div>
          );
        })}
      </div>


  <div className="stats-section">
  <h2>Today's Project Statistics</h2>

  <div className="today-stats-grid">
    <div className="today-card completed">
      <h3>{stats.today.completes}</h3>
      <span>Completed</span>
    </div>

    <div className="today-card disqualified">
      <h3>{stats.today.terminates}</h3>
      <span>Disqualified</span>
    </div>

    <div className="today-card quota">
      <h3>{stats.today.quota_full}</h3>
      <span>Quota Full</span>
    </div>

    <div className="today-card security">
      <h3>{stats.today.security_terminates}</h3>
      <span>Security Term</span>
    </div>

    <div className="today-card blocked">
      <h3>0</h3>
      <span>Blocked</span>
    </div>
  </div>
</div>





  <div className="monthly-section">
  <h2>Monthly Statistics</h2>

  <div className="monthly-grid">
    <div className="monthly-item">
      <div className="monthly-header">
        <span>Completed</span>
        <strong>{stats.monthly.completes}%</strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill green"
          style={{ width: `${stats.monthly.completes}%` }}
        />
      </div>

      <small>{stats.monthly.completes}/{stats.monthly.total_hits}</small>
    </div>

    <div className="monthly-item">
      <div className="monthly-header">
        <span>Disqualified</span>
        <strong>
          {stats.monthly.total_hits
            ? ((stats.monthly.terminates / stats.monthly.total_hits) * 100).toFixed(1)
            : 0}
          %
        </strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill orange"
          style={{
            width: `${
              stats.monthly.total_hits
                ? (stats.monthly.terminates / stats.monthly.total_hits) * 100
                : 0
            }%`,
          }}
        />
      </div>

      <small>
        {stats.monthly.terminates}/{stats.monthly.total_hits}
      </small>
    </div>

    <div className="monthly-item">
      <div className="monthly-header">
        <span>Quota Full</span>
        <strong>
          {stats.monthly.total_hits
            ? ((stats.monthly.quota_full / stats.monthly.total_hits) * 100).toFixed(1)
            : 0}
          %
        </strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill blue"
          style={{
            width: `${
              stats.monthly.total_hits
                ? (stats.monthly.quota_full / stats.monthly.total_hits) * 100
                : 0
            }%`,
          }}
        />
      </div>

      <small>
        {stats.monthly.quota_full}/{stats.monthly.total_hits}
      </small>
    </div>

    <div className="monthly-item">
      <div className="monthly-header">
        <span>Security Term</span>
        <strong>
          {stats.monthly.total_hits
            ? (
                (stats.monthly.security_terminates / stats.monthly.total_hits) *
                100
              ).toFixed(1)
            : 0}
          %
        </strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill red"
          style={{
            width: `${
              stats.monthly.total_hits
                ? (stats.monthly.security_terminates / stats.monthly.total_hits) * 100
                : 0
            }%`,
          }}
        />
      </div>

      <small>
        {stats.monthly.security_terminates}/{stats.monthly.total_hits}
      </small>
    </div>
  </div>
</div>

      {/* Summary + Actions */}
      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-title">
            <h3>Performance Summary</h3>
            <TrendingUp size={18} />
          </div>

          <div className="summary-row">
            <span>Completion Rate</span>
            <strong>{stats.overall.ir}%</strong>
          </div>

          <div className="summary-row">
            <span>Total Non-Completes</span>
            <strong>{nonCompletes}</strong>
          </div>

          <div className="summary-row">
            <span>Valid Completes</span>
            <strong>{stats.overall.completes}</strong>
          </div>

          <div className="summary-row">
            <span>Total Hits</span>
            <strong>{stats.overall.total_hits}</strong>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-title">
            <h3>Quick Actions</h3>
            <Activity size={18} />
          </div>

          <div className="quick-actions">
            <a href="/projects/add">Create Project</a>
            <a href="/clients/add">Add Client</a>
            <a href="/vendors/add">Add Vendor</a>
            <a href="/projects">View Projects</a>
          </div>
        </div>
      </div>

     
    </div>
  );
}

export default Dashboard;