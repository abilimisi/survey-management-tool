import { useEffect, useState } from "react";

import {
  Activity,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  getAnalyticsOverview,
  getAnalyticsHitsChart,
  getAnalyticsStatusChart,
  getVendorPerformance,
  getProjectPerformance,
  getAnalyticsFunnel,
} from "../../api/analyticsApi";

import HitsChart from "./HitsChart";
import StatusChart from "./StatusChart";
import FunnelChart from "./FunnelChart";
import VendorPerformance from "./VendorPerformance";
import ProjectPerformance from "./ProjectPerformance";

import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {

  const [overview, setOverview] = useState(null);
  const [hitsChart, setHitsChart] = useState([]);
  const [statusChart, setStatusChart] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        overviewData,
        hitsData,
        statusData,
        vendorData,
        projectData,
        funnelData,
      ] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsHitsChart(),
        getAnalyticsStatusChart(),
        getVendorPerformance(),
        getProjectPerformance(),
        getAnalyticsFunnel(),
      ]);

      setOverview(overviewData);
      setHitsChart(hitsData);
      setStatusChart(statusData);
      setVendors(vendorData);
      setProjects(projectData);
      setFunnel(funnelData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // Real, data-driven insights (was hardcoded text before).
  const buildInsights = () => {
    const insights = [];

    if (vendors.length > 0) {
      const topVendor = vendors[0];
      insights.push({
        type: "good",
        text: `${topVendor.vendor_name} is the top-ranked vendor with ${topVendor.ir}% IR.`,
      });
    }

    if (projects.length > 0) {
      const bestProject = [...projects].sort((a, b) => b.ir - a.ir)[0];
      insights.push({
        type: "good",
        text: `${bestProject.project_name} has the highest completion rate at ${bestProject.ir}%.`,
      });
    }

    const weakVendors = vendors.filter((v) => v.ir < 40);
    if (weakVendors.length > 0) {
      insights.push({
        type: "warning",
        text: `${weakVendors.length} vendor(s) are under 40% IR and need review.`,
      });
    }

    if (hitsChart.length >= 2) {
      const last = hitsChart[hitsChart.length - 1]?.hits || 0;
      const prev = hitsChart[hitsChart.length - 2]?.hits || 0;
      if (prev > 0 && last < prev) {
        insights.push({
          type: "warning",
          text: `Hits dropped from ${prev} to ${last} vs. the previous day.`,
        });
      } else if (last > prev) {
        insights.push({
          type: "good",
          text: `Hits are up from ${prev} to ${last} vs. the previous day.`,
        });
      }
    }

    if (insights.length === 0) {
      insights.push({ type: "good", text: "Not enough data yet to generate insights." });
    }

    return insights;
  };

  if (loading) {
    return <div className="analytics-loading">Loading Analytics...</div>;
  }

  const insights = buildInsights();

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Real-Time Survey Performance & Business Intelligence</p>
        </div>

        <div className="analytics-actions">
          <button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
          <button className="export-btn">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><Activity size={28} /></div>
          <div>
            <p>Total Hits</p>
            <h2>{overview.total_hits}</h2>
            <span>Overall Respondents</span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon"><TrendingUp size={28} /></div>
          <div>
            <p>Completion Rate</p>
            <h2>{overview.ir}%</h2>
            <span>Incidence Rate</span>
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon"><Users size={28} /></div>
          <div>
            <p>Total Vendors</p>
            <h2>{overview.total_vendors}</h2>
            <span>Active: {overview.active_vendors}</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon"><Briefcase size={28} /></div>
          <div>
            <p>Total Projects</p>
            <h2>{overview.total_projects}</h2>
            <span>Running: {overview.active_projects}</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="analytics-chart-layout">
        <div className="analytics-card large">
          <div className="card-header"><h3>Hits Trend (Last 7 Days)</h3></div>
          <HitsChart data={hitsChart} />
        </div>

        <div className="analytics-card small">
          <div className="card-header"><h3>Status Distribution</h3></div>
          <StatusChart
            data={statusChart}
            centerValue={overview.total_hits}
            centerLabel="Total Hits"
          />
        </div>
      </div>

      {/* FUNNEL */}
      <div className="analytics-card">
        <div className="card-header"><h3>Survey Funnel</h3></div>
        {funnel && <FunnelChart stages={funnel.stages} />}
      </div>

      {/* PERFORMANCE */}
      <div className="analytics-performance-grid">
        <div className="analytics-card">
          <div className="card-header"><h3>Top Vendor Performance</h3></div>
          <VendorPerformance data={vendors} />
        </div>

        <div className="analytics-card">
          <div className="card-header"><h3>Project Health</h3></div>
          <ProjectPerformance data={projects} />
        </div>
      </div>

      {/* AI / RULE-BASED INSIGHTS */}
      <div className="analytics-card">
        <div className="card-header">
          <h3><Sparkles size={18} /> Insights</h3>
        </div>

        <div className="insight-list">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-row ${insight.type}`}>
              {insight.type === "good"
                ? <CheckCircle2 size={16} />
                : <AlertTriangle size={16} />}
              <span>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
