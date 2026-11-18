import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownToLine, Building2, CalendarDays, CheckCircle2,
  CircleAlert, Clock3, Globe2, RefreshCw, Search, ShieldAlert,
  Target, Timer, TrendingUp, Users, XCircle, Flag,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import {
  getProjectList,
  getAnalyticsProjectDetails,
} from "../../../api/analyticsApi";
import "./ProjectAnalytics.css";

const STATUS_COLORS = {
  complete: "#16a36a",
  terminate: "#e05a67",
  quota_full: "#e9a23b",
  security_terminate: "#8b6de9",
  started: "#4387e8",
};

const numberFormat = new Intl.NumberFormat("en-IN");
const formatNumber = (value) => numberFormat.format(Number(value) || 0);
const formatPercent = (value) => `${(Number(value) || 0).toFixed(1)}%`;

function downloadCsv(project, summary, trend, statusBreakdown, vendorSplit) {
  const rows = [
    ["Project Analytics Report"],
    ["Project", project?.name || ""],
    ["Client", project?.client || ""],
    ["Country", project?.country || ""],
    [],
    ["Metric", "Value"],
    ["Total hits", summary?.hits ?? 0],
    ["Completes", summary?.complete ?? 0],
    ["Terminates", summary?.terminate ?? 0],
    ["Quota full", summary?.quota_full ?? 0],
    ["Security", summary?.security ?? 0],
    ["Incidence rate", `${summary?.ir ?? 0}%`],
    ["Target", project?.target ?? 0],
    ["Target progress", `${project?.target ? ((summary?.complete || 0) / project.target) * 100 : 0}%`],
    [],
    ["Daily trend", "Date", "Hits"],
    ...trend.map((item) => [item.day, item.date, item.hits]),
    [],
    ["Status", "Count"],
    ...statusBreakdown.map((item) => [item.name, item.value]),
    [],
    ["Vendor", "Hits"],
    ...vendorSplit.map((item) => [item.vendor_name, item.hits]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(project?.name || "project").replace(/[^a-z0-9-_]+/gi, "_")}_analytics.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ label, value, note, icon: Icon, tone = "blue", suffix = "" }) {
  return (
    <article className="pa-metric-card">
      <div className={`pa-metric-icon ${tone}`}><Icon size={19} /></div>
      <div className="pa-metric-copy">
        <span>{label}</span>
        <strong>{typeof value === "number" ? formatNumber(value) : value}{suffix}</strong>
        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

function Panel({ title, subtitle, action, className = "", children }) {
  return (
    <section className={`pa-panel ${className}`}>
      <div className="pa-panel-heading">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        {action && <div className="pa-panel-action">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ children = "No data available for this view." }) {
  return <div className="pa-empty-chart">{children}</div>;
}

export default function ProjectAnalytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectData, setProjectData] = useState(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError("");
    try {
      const data = await getProjectList();
      const list = Array.isArray(data) ? data : data?.results || [];
      setProjects(list);
      setSelectedProject((current) => {
        if (current && list.some((item) => String(item.id) === String(current))) return current;
        return list.length ? String(list[0].id) : "";
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load projects. Please try again.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadProjectDetails = useCallback(async (id) => {
    if (!id) {
      setProjectData(null);
      return;
    }
    setLoadingDetails(true);
    setError("");
    try {
      const data = await getAnalyticsProjectDetails(id);
      setProjectData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setProjectData(null);
      setError(err?.response?.data?.detail || "Unable to load analytics for this project.");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { if (selectedProject) loadProjectDetails(selectedProject); }, [selectedProject, loadProjectDetails]);

  const summary = projectData?.summary || {};
  const project = projectData?.project || {};
  const trend = projectData?.trend || [];
  const statusBreakdown = projectData?.status_breakdown || [];
  const vendorSplit = projectData?.vendor_split || [];
  const target = Number(project.target) || 0;
  const completes = Number(summary.complete) || 0;
  const targetProgress = target > 0 ? Math.min((completes / target) * 100, 100) : 0;
  const remaining = Math.max(target - completes, 0);
  const filteredProjects = useMemo(() => projects.filter((item) =>
    `${item.name || ""} ${item.client || ""} ${item.country || ""}`.toLowerCase().includes(projectSearch.toLowerCase())
  ), [projects, projectSearch]);
  const chartStatus = useMemo(() => statusBreakdown.map((item) => ({
    ...item,
    fill: STATUS_COLORS[item.status] || "#94a3b8",
  })), [statusBreakdown]);
  const sortedVendors = useMemo(() => [...vendorSplit].sort((a, b) => (b.hits || 0) - (a.hits || 0)), [vendorSplit]);

  const refreshAll = async () => {
    if (!selectedProject) return;
    await loadProjectDetails(selectedProject);
  };

  const handleExport = () => downloadCsv(project, summary, trend, statusBreakdown, vendorSplit);

  if (loadingProjects) {
    return <div className="pa-page"><div className="pa-loading"><RefreshCw className="pa-spin" size={22} />Loading project analytics…</div></div>;
  }

  return (
    <main className="pa-page">
      <header className="pa-header">
        <div>
          <div className="pa-eyebrow">BUSINESS INTELLIGENCE</div>
          <h1>Project Analytics</h1>
          <p>Explore delivery performance, respondent outcomes and vendor contribution.</p>
        </div>
        <div className="pa-header-actions">
          <button className="pa-button secondary" onClick={refreshAll} disabled={!selectedProject || loadingDetails}>
            <RefreshCw size={16} className={loadingDetails ? "pa-spin" : ""} /> Refresh
          </button>
          <button className="pa-button primary" onClick={handleExport} disabled={!projectData || loadingDetails}>
            <ArrowDownToLine size={16} /> Export CSV
          </button>
        </div>
      </header>

      <section className="pa-filterbar">
        <div className="pa-filter-title"><CalendarDays size={18} /><div><strong>Analysis scope</strong><span>Select the project you want to inspect</span></div></div>
        <div className="pa-project-select-wrap">
          <Search size={16} />
          <input aria-label="Search projects" placeholder="Search project or client…" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} />
          <select aria-label="Select project" value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
            {filteredProjects.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.client || "No client"}</option>)}
          </select>
        </div>
        {lastUpdated && <span className="pa-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
      </section>

      {error && <div className="pa-alert"><CircleAlert size={18} />{error}<button onClick={refreshAll}>Retry</button></div>}
      {!error && !projects.length && <div className="pa-empty-state"><Building2 size={30} /><h2>No projects found</h2><p>Projects will appear here when they are available for analytics.</p></div>}
      {projects.length > 0 && filteredProjects.length === 0 && <div className="pa-empty-state"><Search size={28} /><h2>No matching projects</h2><p>Try a different project or client name.</p></div>}

      {projectData && (
        <div className={`pa-content ${loadingDetails ? "is-loading" : ""}`}>
          <section className="pa-project-banner">
            <div className="pa-project-main">
              <div className="pa-project-mark"><Activity size={21} /></div>
              <div><span className="pa-overline">SELECTED PROJECT</span><h2>{project.name || "Project"}</h2><div className="pa-project-meta"><span><Building2 size={14} />{project.client || "—"}</span><span><Globe2 size={14} />{project.country || "—"}</span><span><Clock3 size={14} />LOI {project.loi ?? 0} min</span></div></div>
            </div>
            <div className="pa-project-status"><span className={`pa-status-pill ${String(project.status || "").toLowerCase()}`}>{String(project.status || "Unknown").replaceAll("_", " ")}</span><span className="pa-project-id">Project ID: {project.id}</span></div>
          </section>

          <div className="pa-section-label"><span>PERFORMANCE OVERVIEW</span><small>Key respondent metrics for this project</small></div>
          <section className="pa-metric-grid">
            <MetricCard label="Total hits" value={Number(summary.hits) || 0} note="Respondent entries" icon={Activity} tone="blue" />
            <MetricCard label="Completes" value={completes} note="Successfully completed" icon={CheckCircle2} tone="green" />
            <MetricCard label="Incidence rate" value={formatPercent(summary.ir)} note="Completes ÷ total hits" icon={TrendingUp} tone="violet" />
            <MetricCard label="Terminations" value={Number(summary.terminate) || 0} note="Respondents terminated" icon={XCircle} tone="red" />
            <MetricCard label="Quota full" value={Number(summary.quota_full) || 0} note="Quota limit reached" icon={Flag} tone="amber" />
            <MetricCard label="Security flags" value={Number(summary.security) || 0} note="Security terminations" icon={ShieldAlert} tone="slate" />
          </section>

          <section className="pa-progress-panel">
            <div className="pa-progress-copy"><div><span className="pa-overline">TARGET DELIVERY</span><h3>Project completion progress</h3><p>{formatNumber(completes)} completes out of {formatNumber(target)} target</p></div><strong>{target > 0 ? formatPercent(targetProgress) : "—"}</strong></div>
            <div className="pa-progress-track"><div style={{ width: `${targetProgress}%` }} /></div>
            <div className="pa-progress-foot"><span>{target > 0 ? `${formatNumber(remaining)} completes remaining` : "No target configured for this project"}</span><span>{target > 0 ? `${formatNumber(target)} target` : "Target unavailable"}</span></div>
          </section>

          <div className="pa-section-label"><span>RESPONDENT ANALYSIS</span><small>Volume and outcome distribution</small></div>
          <section className="pa-chart-grid">
            <Panel title="Respondent activity" subtitle="Daily hits over the last 7 days" className="pa-trend-panel">
              {trend.length ? <div className="pa-chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="paHitsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3478f6" stopOpacity={0.24} /><stop offset="95%" stopColor="#3478f6" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#edf1f6" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#7b8798", fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#7b8798", fontSize: 12 }} /><Tooltip contentStyle={{ border: "1px solid #e5eaf1", borderRadius: 10, boxShadow: "0 8px 24px rgba(20,35,60,.10)" }} labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""} /><Area type="monotone" dataKey="hits" name="Hits" stroke="#3478f6" strokeWidth={2.8} fill="url(#paHitsGradient)" activeDot={{ r: 5, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div> : <EmptyChart />}
            </Panel>
            <Panel title="Outcome distribution" subtitle="Share of respondent outcomes">
              {chartStatus.length ? <div className="pa-donut-layout"><div className="pa-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartStatus} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="88%" paddingAngle={3} stroke="none">{chartStatus.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}</Pie><Tooltip formatter={(value) => formatNumber(value)} /></PieChart></ResponsiveContainer><div className="pa-donut-center"><strong>{formatNumber(summary.hits)}</strong><span>Total hits</span></div></div><div className="pa-legend-list">{chartStatus.map((item) => <div className="pa-legend-row" key={item.status}><span><i style={{ background: item.fill }} />{item.name}</span><strong>{formatNumber(item.value)}</strong></div>)}</div></div> : <EmptyChart />}
            </Panel>
          </section>

          <div className="pa-section-label"><span>VENDOR CONTRIBUTION</span><small>Respondent volume by delivery partner</small></div>
          <Panel title="Vendor delivery mix" subtitle="Hits attributed to each vendor for this project" action={<span className="pa-panel-count">{vendorSplit.length} vendors</span>}>
            {sortedVendors.length ? <div className="pa-vendor-chart"><ResponsiveContainer width="100%" height={Math.max(230, sortedVendors.length * 48)}><BarChart data={sortedVendors} layout="vertical" margin={{ top: 4, right: 28, left: 12, bottom: 4 }}><CartesianGrid stroke="#edf1f6" strokeDasharray="4 4" horizontal={false} /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#7b8798", fontSize: 11 }} /><YAxis type="category" dataKey="vendor_name" width={115} tickLine={false} axisLine={false} tick={{ fill: "#536174", fontSize: 12 }} /><Tooltip formatter={(value) => [formatNumber(value), "Hits"]} contentStyle={{ border: "1px solid #e5eaf1", borderRadius: 10 }} /><Bar dataKey="hits" name="Hits" fill="#477ff0" radius={[0, 7, 7, 0]} barSize={19} /></BarChart></ResponsiveContainer></div> : <EmptyChart>Vendor attribution is not available for this project yet.</EmptyChart>}
          </Panel>

          <div className="pa-section-label"><span>DETAILED BREAKDOWN</span><small>Underlying figures returned by the analytics service</small></div>
          <section className="pa-detail-grid">
            <Panel title="Respondent outcomes" subtitle="Counts by recorded status">
              <div className="pa-data-table-wrap"><table className="pa-data-table"><thead><tr><th>Outcome</th><th>Respondents</th><th>Share of hits</th></tr></thead><tbody>{chartStatus.map((item) => <tr key={item.status}><td><span className="pa-table-label"><i style={{ background: item.fill }} />{item.name}</span></td><td>{formatNumber(item.value)}</td><td>{summary.hits ? formatPercent((item.value / summary.hits) * 100) : "0.0%"}</td></tr>)}</tbody></table></div>
            </Panel>
            <Panel title="Project information" subtitle="Configuration and delivery context">
              <div className="pa-info-list"><div><span>Project status</span><strong>{String(project.status || "—").replaceAll("_", " ")}</strong></div><div><span>Study type</span><strong>{project.study_type || "Not provided"}</strong></div><div><span>Country</span><strong>{project.country || "Not provided"}</strong></div><div><span>Length of interview</span><strong>{project.loi ?? 0} minutes</strong></div><div><span>Project target</span><strong>{formatNumber(target)}</strong></div><div><span>Completes remaining</span><strong>{target ? formatNumber(remaining) : "—"}</strong></div></div>
            </Panel>
          </section>
          <footer className="pa-footnote"><Timer size={14} /> Metrics reflect the data currently returned by the PanelSphere analytics API. Trend is limited to the latest 7 days.</footer>
        </div>
      )}
      {loadingDetails && <div className="pa-loading-overlay"><RefreshCw className="pa-spin" size={20} />Updating project data…</div>}
    </main>
  );
}
