import { useEffect, useState } from "react";

import {
  BarChart3,
  Activity,
  Users,
  Briefcase,
  TrendingUp,
  RefreshCw,
  Download,
  Sparkles,
} from "lucide-react";

import {
  getAnalyticsOverview,
  getAnalyticsHitsChart,
  getAnalyticsStatusChart,
  getVendorPerformance,
  getProjectPerformance,
} from "../../api/analyticsApi";

import HitsChart from "./HitsChart";
import StatusChart from "./StatusChart";
import VendorPerformance from "./VendorPerformance";
import ProjectPerformance from "./ProjectPerformance";

import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {

  const [overview,setOverview]=useState(null);

  const [hitsChart,setHitsChart]=useState([]);

  const [statusChart,setStatusChart]=useState([]);

  const [vendors,setVendors]=useState([]);

  const [projects,setProjects]=useState([]);

  const [loading,setLoading]=useState(true);

  const [openMenu, setOpenMenu] = useState("Analytics");

  useEffect(()=>{

      loadDashboard();

  },[]);

  const loadDashboard=async()=>{

      try{

          const [

              overviewData,

              hitsData,

              statusData,

              vendorData,

              projectData

          ]=await Promise.all([

              getAnalyticsOverview(),

              getAnalyticsHitsChart(),

              getAnalyticsStatusChart(),

              getVendorPerformance(),

              getProjectPerformance(),

          ]);

          setOverview(overviewData);

          setHitsChart(hitsData);

          setStatusChart(statusData);

          setVendors(vendorData);

          setProjects(projectData);

      }

      finally{

          setLoading(false);

      }

  };

  if(loading){

      return(

          <div className="analytics-loading">

              Loading Analytics...

          </div>

      )

  }

  return(

<div className="analytics-page">

{/* HEADER */}

<div className="analytics-header">

<div>

<h1>Analytics Dashboard</h1>

<p>

Real-Time Survey Performance & Business Intelligence

</p>

</div>

<div className="analytics-actions">

<button>

<RefreshCw size={18}/>

Refresh

</button>

<button className="export-btn">

<Download size={18}/>

Export

</button>

</div>

</div>

{/* KPI */}

<div className="analytics-kpi-grid">

<div className="kpi-card blue">

<div className="kpi-icon">

<Activity size={28}/>

</div>

<div>

<p>Total Hits</p>

<h2>{overview.total_hits}</h2>

<span>Overall Respondents</span>

</div>

</div>

<div className="kpi-card green">

<div className="kpi-icon">

<TrendingUp size={28}/>

</div>

<div>

<p>Completion Rate</p>

<h2>{overview.ir}%</h2>

<span>Incidence Rate</span>

</div>

</div>

<div className="kpi-card orange">

<div className="kpi-icon">

<Users size={28}/>

</div>

<div>

<p>Total Vendors</p>

<h2>{overview.total_vendors}</h2>

<span>Active Vendors</span>
<h4>{overview.active_vendors}</h4>

</div>

</div>

<div className="kpi-card purple">

<div className="kpi-icon">

<Briefcase size={28}/>

</div>

<div>

<p>Total Projects</p>

<h2>{overview.total_projects}</h2>

<span>Running Projects</span>
<h4>{overview.active_projects}</h4>

</div>

</div>

</div>

{/* CHARTS */}

<div className="analytics-chart-layout">

<div className="analytics-card large">

<div className="card-header">

<h3>

Hits Trend

</h3>

</div>

<HitsChart data={hitsChart}/>

</div>

<div className="analytics-card small">

<div className="card-header">

<h3>

Status Distribution

</h3>

</div>

<StatusChart data={statusChart}/>

</div>

</div>

{/* FUNNEL */}

<div className="analytics-card">

<div className="card-header">

<h3>

Survey Funnel

</h3>

</div>

<div className="funnel-placeholder">

Started

↓

Complete

↓

Terminate

↓

Quota Full

↓

Security

</div>

</div>

{/* PERFORMANCE */}

<div className="analytics-performance-grid">

<div className="analytics-card">

<div className="card-header">

<h3>

Top Vendor Performance

</h3>

</div>

<VendorPerformance

data={vendors}

/>

</div>

<div className="analytics-card">

<div className="card-header">

<h3>

Project Health

</h3>

</div>

<ProjectPerformance

data={projects}

/>

</div>

</div>

{/* AI */}

<div className="analytics-card">

<div className="card-header">

<h3>

<Sparkles size={18}/>

AI Insights

</h3>

</div>

<div className="insight-list">

<div>

✔ Vendor 4 has the highest completion rate.

</div>

<div>

✔ Project A is performing well.

</div>

<div>

⚠ Termination rate increased today.

</div>

<div>

⚠ Review low-performing vendors.

</div>

</div>

</div>

</div>

);

}