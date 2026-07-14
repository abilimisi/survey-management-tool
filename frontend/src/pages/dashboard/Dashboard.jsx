import { useEffect, useState } from "react";
import {
  MousePointerClick, CheckCircle, XCircle,
  AlertTriangle, ShieldAlert, BarChart3,
  TrendingUp, ArrowUpRight, Users,
  Activity, Clock, Eye, Zap, Target,
  ChevronRight
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    overall: { total_hits:0, completes:0, terminates:0, quota_full:0, security_terminates:0, ir:0 },
    today:   { total_hits:0, completes:0, terminates:0, quota_full:0, security_terminates:0, ir:0 },
    monthly: { total_hits:0, completes:0, terminates:0, quota_full:0, security_terminates:0, ir:0 },
  });
  const [recentProjects,  setRecentProjects]  = useState([]);
  const [recentResponses, setRecentResponses] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentProjects();
    fetchRecentResponses();
  }, []);

  const fetchStats = async () => {
    try { const r = await axiosInstance.get("/dashboard/stats/"); setStats(r.data); }
    catch(e) { console.error(e); }
  };
  const fetchRecentProjects = async () => {
    try { const r = await axiosInstance.get("/dashboard/recent_projects/"); setRecentProjects(r.data); }
    catch(e) { console.error(e); }
  };
  const fetchRecentResponses = async () => {
    try { const r = await axiosInstance.get("/dashboard/recent_responses/"); setRecentResponses(r.data); }
    catch(e) { console.error(e); }
  };

  const nonCompletes =
    Number(stats.overall.terminates) +
    Number(stats.overall.quota_full) +
    Number(stats.overall.security_terminates);

  const convRate = stats.overall.total_hits > 0
    ? ((stats.overall.completes / stats.overall.total_hits) * 100).toFixed(1)
    : "0.0";
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

  const todayCells = [
    { label:"Completed",  value:stats.today.completes,            color:"green"  },
    { label:"Terminates", value:stats.today.terminates,           color:"amber"  },
    { label:"Quota Full", value:stats.today.quota_full,           color:"blue"   },
    { label:"Security",   value:stats.today.security_terminates,  color:"red"    },
    { label:"Blocked",    value:0,                                color:"slate"  },
  ];

  const monthlyRows = [
    { label:"Completed",  value:stats.monthly.completes,           color:"green"  },
    { label:"Terminates", value:stats.monthly.terminates,          color:"amber"  },
    { label:"Quota Full", value:stats.monthly.quota_full,          color:"blue"   },
    { label:"Security",   value:stats.monthly.security_terminates, color:"red"    },
  ].map(r => ({
    ...r,
    pct: stats.monthly.total_hits
      ? ((r.value / stats.monthly.total_hits) * 100).toFixed(1)
      : "0.0",
  }));

  const pill = (s = "") => {
    const map = {
      complete:           { c:"g", t:"Complete"   },
      completed:          { c:"g", t:"Complete"   },
      running:            { c:"b", t:"Running"    },
      testing:            { c:"y", t:"Testing"    },
      terminate:          { c:"r", t:"Terminate"  },
      quota_full:         { c:"y", t:"Quota Full" },
      security_terminate: { c:"p", t:"Security"   },
      bidding:            { c:"p", t:"Bidding"    },
      started:            { c:"b", t:"Started"    },
      on_hold:            { c:"y", t:"On Hold"    },
    };
    const k = map[s.toLowerCase()] || { c:"n", t: s || "—" };
    return <span className={`dp dp-${k.c}`}>{k.t}</span>;
  };

  return (
    <div className="db">
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

      {/* ── TODAY + MONTHLY ── */}
      <div className="db-row2">

        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title">
              <Activity size={14} className="db-icon-accent" />
              Today's Activity
            </div>
            <span className="db-badge db-badge-green">
              <span className="db-dot db-dot-sm" /> Live
            </span>
          </div>
          <div className="db-today-grid">
            {todayCells.map(c => (
              <div className={`db-tc db-tc-${c.color}`} key={c.label}>
                <strong>{c.value}</strong>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title">
              <BarChart3 size={14} className="db-icon-accent" />
              Monthly Breakdown
            </div>
            <span className="db-badge">
              <Clock size={10} /> This month
            </span>
          </div>
          <div className="db-month-list">
            {monthlyRows.map(r => (
              <div className="db-mrow" key={r.label}>
                <div className="db-mrow-left">
                  <span className={`db-mrow-dot db-mrow-dot-${r.color}`} />
                  <span className="db-mrow-lbl">{r.label}</span>
                </div>
                <div className="db-mrow-track">
                  <div className={`db-mrow-fill db-mfill-${r.color}`}
                    style={{width:`${Math.min(Number(r.pct),100)}%`}} />
                </div>
                <span className="db-mrow-right">
                  <b>{r.pct}%</b>
                  <small>{r.value}/{stats.monthly.total_hits}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── RECENT RESPONSES ── */}
      <div className="db-panel">
        <div className="db-panel-head">
          <div className="db-panel-title">
            <Eye size={14} className="db-icon-accent" />
            Recent Responses
          </div>
          <span className="db-badge db-badge-blue">
            <Eye size={10} /> Latest activity
          </span>
        </div>

        {recentResponses.length === 0 ? (
          <div className="db-empty">
            <Eye size={30} strokeWidth={1.2} />
            <p>No responses yet</p>
            <small>Responses appear here as respondents click survey links</small>
          </div>
        ) : (
          <div className="db-tscroll">
            <table className="db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Vendor</th>
                  <th>Respondent ID</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentResponses.map((r, i) => (
                  <tr key={i}>
                    <td className="db-td-num">{i + 1}</td>
                    <td className="db-td-bold">{r.project_name || "—"}</td>
                    <td>{r.vendor_name || "—"}</td>
                    <td className="db-td-mono">{r.respondent_id || "—"}</td>
                    <td className="db-td-dim">
                      {r.timestamp
                        ? new Date(r.timestamp).toLocaleTimeString("en-IN",
                            {hour:"2-digit", minute:"2-digit"})
                        : "—"}
                    </td>
                    <td>{pill(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── BOTTOM: PROJECTS + RIGHT SIDEBAR ── */}
      <div className="db-bottom">

        {/* Recent Projects */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title">
              <Target size={14} className="db-icon-accent" />
              Recent Projects
            </div>
            <a href="/projects" className="db-viewall">
              View all <ChevronRight size={13} />
            </a>
          </div>
          {recentProjects.length === 0 ? (
            <div className="db-empty">
              <p>No recent projects</p>
            </div>
          ) : (
            <div className="db-tscroll">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Project</th>
                    <th>Country</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map(p => {
                    const pct = p.target > 0
                      ? Math.min(Math.round((p.completes / p.target) * 100), 100)
                      : 0;
                    return (
                      <tr key={p.id}>
                        <td className="db-td-num">#{p.id}</td>
                        <td className="db-td-bold">{p.name}</td>
                        <td className="db-td-dim">{p.country || "—"}</td>
                        <td>
                          <div className="db-prog">
                            <div className="db-prog-track">
                              <div className="db-prog-fill" style={{width:`${pct}%`}} />
                            </div>
                            <span>{p.completes}/{p.target}</span>
                          </div>
                        </td>
                        <td>{pill(p.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="db-sidebar">

          {/* Performance */}
          <div className="db-panel">
            <div className="db-panel-head">
              <div className="db-panel-title">
                <TrendingUp size={14} className="db-icon-accent" />
                Performance
              </div>
            </div>
            <div className="db-perf-list">
              {[
                { label:"Completion Rate", val:`${stats.overall.ir}%`,  hi:true  },
                { label:"Valid Completes", val:stats.overall.completes, hi:false },
                { label:"Non-Completes",   val:nonCompletes,            hi:false },
                { label:"Total Hits",      val:stats.overall.total_hits,hi:false },
              ].map(r => (
                <div className="db-perf-row" key={r.label}>
                  <span>{r.label}</span>
                  <strong className={r.hi ? "db-perf-hi" : ""}>{r.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="db-panel">
            <div className="db-panel-head">
              <div className="db-panel-title">
                <Zap size={14} className="db-icon-accent" />
                Quick Actions
              </div>
            </div>
            <div className="db-qa-list">
              {[
                { label:"New Project",  href:"/projects/add", primary:true  },
                { label:"Add Client",   href:"/clients/add",  primary:false },
                { label:"Add Vendor",   href:"/vendors/add",  primary:false },
                { label:"All Projects", href:"/projects",     primary:false },
              ].map(a => (
                <a key={a.label} href={a.href}
                  className={`db-qa ${a.primary ? "db-qa-primary" : "db-qa-outline"}`}>
                  <span>{a.label}</span>
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
