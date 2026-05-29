// import { useEffect, useState } from "react";
// import axiosInstance from "../../api/axiosInstance";
// import StatCard from "../../components/common/StatCard";

// function Dashboard() {
//   const [stats, setStats] = useState({
//     total_hits: 0,
//     completes: 0,
//     terminates: 0,
//     quota_full: 0,
//     security_terminates: 0,
//     ir: 0,
//   });

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const response = await axiosInstance.get("/dashboard/stats/");
//       setStats(response.data);
//     } catch (error) {
//       console.error("Dashboard stats error:", error);
//     }
//   };

//   return (
//     <div>
//       <div className="page-header">
//         <h1>Dashboard</h1>
//         <p>Overview of survey traffic and performance</p>
//       </div>

//       <div className="stats-grid">
//         <StatCard title="Total Hits" value={stats.total_hits} />
//         <StatCard title="Completes" value={stats.completes} />
//         <StatCard title="Terminates" value={stats.terminates} />
//         <StatCard title="Quota Full" value={stats.quota_full} />
//         <StatCard title="Security Term" value={stats.security_terminates} />
//         <StatCard title="IR" value={`${stats.ir}%`} subtitle="Incidence Rate" />
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


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
    total_hits: 0,
    completes: 0,
    terminates: 0,
    quota_full: 0,
    security_terminates: 0,
    ir: 0,
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
      value: stats.total_hits,
      icon: MousePointerClick,
      note: "Total survey starts",
      className: "card-blue",
    },
    {
      title: "Completes",
      value: stats.completes,
      icon: CheckCircle,
      note: "Successful completes",
      className: "card-green",
    },
    {
      title: "Terminates",
      value: stats.terminates,
      icon: XCircle,
      note: "Disqualified users",
      className: "card-red",
    },
    {
      title: "Quota Full",
      value: stats.quota_full,
      icon: AlertTriangle,
      note: "Quota reached",
      className: "card-orange",
    },
    {
      title: "Security Term",
      value: stats.security_terminates,
      icon: ShieldAlert,
      note: "Security failures",
      className: "card-purple",
    },
    {
      title: "IR",
      value: `${stats.ir}%`,
      icon: BarChart3,
      note: "Incidence Rate",
      className: "card-indigo",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h1>Dashboard</h1>
          <p>Live overview of survey traffic, performance and redirects</p>
        </div>

        <div className="hero-badge">
          <Activity size={18} />
          Active Monitoring
        </div>
      </div>

      <div className="dashboard-stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className={`dashboard-card ${card.className}`} key={card.title}>
              <div className="dashboard-card-top">
                <div>
                  <p>{card.title}</p>
                  <h2>{card.value}</h2>
                </div>

                <div className="dashboard-icon">
                  <Icon size={26} />
                </div>
              </div>

              <span>{card.note}</span>
            </div>
          );
        })}
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-title">
            <h3>Performance Summary</h3>
            <TrendingUp size={20} />
          </div>

          <div className="summary-row">
            <span>Completion Rate</span>
            <strong>{stats.ir}%</strong>
          </div>

          <div className="summary-row">
            <span>Total Non-Completes</span>
            <strong>
              {Number(stats.terminates) +
                Number(stats.quota_full) +
                Number(stats.security_terminates)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Valid Completes</span>
            <strong>{stats.completes}</strong>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-title">
            <h3>Quick Actions</h3>
            <Activity size={20} />
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