import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import StatCard from "../../components/common/StatCard";

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

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of survey traffic and performance</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Hits" value={stats.total_hits} />
        <StatCard title="Completes" value={stats.completes} />
        <StatCard title="Terminates" value={stats.terminates} />
        <StatCard title="Quota Full" value={stats.quota_full} />
        <StatCard title="Security Term" value={stats.security_terminates} />
        <StatCard title="IR" value={`${stats.ir}%`} subtitle="Incidence Rate" />
      </div>
    </div>
  );
}

export default Dashboard;