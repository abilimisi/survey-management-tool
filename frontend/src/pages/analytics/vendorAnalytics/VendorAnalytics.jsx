import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownToLine, Building2, CheckCircle2, CircleAlert,
  Clock3, Globe2, Mail, RefreshCw, Search, ShieldAlert, TrendingUp,
  Users, XCircle, Flag, Timer, BriefcaseBusiness, ChartNoAxesCombined,
  PlayCircle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  getVendorList,
  getAnalyticsVendorDetails,
} from "../../../api/analyticsApi";
import "./VendorAnalytics.css";

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
const normalizeStatus = (value) =>
  String(value || "").toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");

function Panel({ title, subtitle, action, className = "", children }) {
  return (
    <section className={`va-panel ${className}`}>
      <div className="va-panel-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="va-panel-action">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className={`va-kpi-card va-kpi-${tone}`}>
      <div className="va-kpi-top">
        <div className="va-kpi-icon"><Icon size={20} /></div>
        <span>{label}</span>
      </div>
      <strong className="va-kpi-value">
        {typeof value === "number" ? formatNumber(value) : value}
      </strong>
      <div className="va-kpi-note">{note}</div>
    </article>
  );
}

function EmptyChart({ children = "No data available for this view." }) {
  return (
    <div className="va-empty-chart">
      <ChartNoAxesCombined size={27} />
      <span>{children}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="va-tooltip">
      <span className="va-tooltip-label">{label}</span>
      {payload.map((item) => (
        <div className="va-tooltip-row" key={item.dataKey}>
          <span><i style={{ background: item.color || item.fill }} />{item.name || item.dataKey}</span>
          <strong>{formatNumber(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function exportVendorCsv(vendor, summary, trend, statusBreakdown, projectSplit) {
  const rows = [
    ["VENDOR ANALYTICS REPORT"],
    ["Vendor", vendor?.name || ""],
    ["Email", vendor?.email || ""],
    ["Status", vendor?.status || ""],
    [],
    ["METRIC", "VALUE"],
    ["Total hits", summary?.hits ?? 0],
    ["Started", summary?.started ?? 0],
    ["Completes", summary?.complete ?? 0],
    ["Terminations", summary?.terminate ?? 0],
    ["Quota full", summary?.quota_full ?? 0],
    ["Security", summary?.security ?? 0],
    ["Incidence rate", `${summary?.ir ?? 0}%`],
    [],
    ["DAILY TREND", "DATE", "HITS"],
    ...trend.map((item) => [item.day, item.date, item.hits]),
    [],
    ["OUTCOME", "RESPONDENTS"],
    ...statusBreakdown.map((item) => [item.name, item.value]),
    [],
    ["PROJECT", "HITS"],
    ...projectSplit.map((item) => [item.project_name, item.hits]),
  ];
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(vendor?.name || "vendor").replace(/[^a-z0-9-_]+/gi, "_")}_analytics.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function VendorAnalytics() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendorData, setVendorData] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getVendorList();
      const list = Array.isArray(response) ? response : response?.results || [];
      setVendors(list);
      setSelectedVendor((current) => {
        if (current && list.some((item) => String(item.id) === String(current))) return current;
        return list.length ? String(list[0].id) : "";
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVendor = useCallback(async (id) => {
    if (!id) {
      setVendorData(null);
      return;
    }
    setDetailLoading(true);
    setError("");
    try {
      const data = await getAnalyticsVendorDetails(id);
      setVendorData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setVendorData(null);
      setError(err?.response?.data?.detail || "Unable to load analytics for this vendor.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => { loadVendors(); }, [loadVendors]);
  useEffect(() => {
    if (selectedVendor) loadVendor(selectedVendor);
    else setVendorData(null);
  }, [selectedVendor, loadVendor]);

  const summary = vendorData?.summary || {};
  const vendor = vendorData?.vendor || {};
  const trend = vendorData?.trend || [];
  const statusBreakdown = vendorData?.status_breakdown || [];
  const projectSplit = useMemo(
    () => [...(vendorData?.project_split || [])].sort((a, b) => (Number(b.hits) || 0) - (Number(a.hits) || 0)),
    [vendorData]
  );

  const filteredVendors = useMemo(() => {
    const query = vendorSearch.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((item) =>
      `${item.name || ""} ${item.email || ""} ${item.status || ""}`.toLowerCase().includes(query)
    );
  }, [vendors, vendorSearch]);

  const chartStatus = useMemo(() => statusBreakdown.map((item) => ({
    ...item,
    fill: item.color || STATUS_COLORS[normalizeStatus(item.status)] || "#94a3b8",
  })), [statusBreakdown]);

  const totalHits = Number(summary.hits) || 0;
  const completes = Number(summary.complete) || 0;
  const refresh = () => selectedVendor && loadVendor(selectedVendor);

  if (loading) {
    return <main className="vendor-analytics"><div className="va-loading"><RefreshCw className="va-spin" size={21} />Loading vendor analytics...</div></main>;
  }

  return (
    <main className="vendor-analytics">
      <header className="va-header">
        <div>
          <div className="va-eyebrow"><span /> BUSINESS INTELLIGENCE</div>
          <h1>Vendor Analytics</h1>
          <p>Monitor vendor delivery, respondent outcomes and project contribution.</p>
        </div>
        <div className="va-header-actions">
          <button className="va-button va-button-light" onClick={refresh} disabled={!selectedVendor || detailLoading}>
            <RefreshCw size={16} className={detailLoading ? "va-spin" : ""} /> Refresh
          </button>
          <button
            className="va-button va-button-primary"
            onClick={() => exportVendorCsv(vendor, summary, trend, statusBreakdown, projectSplit)}
            disabled={!vendorData || detailLoading}
          >
            <ArrowDownToLine size={16} /> Export report
          </button>
        </div>
      </header>

      <section className="va-filterbar">
        <div className="va-filter-title">
          <div className="va-filter-icon"><Users size={19} /></div>
          <div><strong>Vendor scope</strong><span>Select a vendor to inspect</span></div>
        </div>
        <div className="va-filter-controls">
          <div className="va-search">
            <Search size={16} />
            <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} placeholder="Search vendor..." aria-label="Search vendors" />
          </div>
          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} aria-label="Select vendor">
            {filteredVendors.length === 0 && <option value="">No matching vendors</option>}
            {filteredVendors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="va-updated"><i />{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for data"}</div>
      </section>

      {error && <div className="va-alert"><CircleAlert size={18} /><span>{error}</span><button onClick={refresh}>Retry</button></div>}

      {!error && vendors.length === 0 && (
        <div className="va-empty-state"><Building2 size={32} /><h2>No vendors found</h2><p>Vendors will appear here when they are available for analytics.</p></div>
      )}

      {vendors.length > 0 && filteredVendors.length === 0 && (
        <div className="va-empty-state"><Search size={28} /><h2>No matching vendors</h2><p>Try another vendor name or email address.</p></div>
      )}

      {vendorData && (
        <div className={`va-content ${detailLoading ? "is-loading" : ""}`}>
          <section className="va-vendor-banner">
            <div className="va-vendor-main">
              <div className="va-vendor-mark"><BriefcaseBusiness size={23} /></div>
              <div className="va-vendor-copy">
                <span className="va-overline">SELECTED DELIVERY PARTNER</span>
                <h2>{vendor.name || "Vendor"}</h2>
                <div className="va-vendor-meta">
                  <span><Building2 size={14} /> Vendor account</span>
                  {vendor.email && <span><Mail size={14} /> {vendor.email}</span>}
                </div>
              </div>
            </div>
            <div className="va-vendor-status">
              <span className={`va-status-pill ${String(vendor.status || "").toLowerCase()}`}>
                <PlayCircle size={13} /> {vendor.status || "Unknown"}
              </span>
              <span className="va-vendor-id">VENDOR ID · {vendor.id}</span>
            </div>
          </section>

          <div className="va-section-heading">
            <div><span>PERFORMANCE OVERVIEW</span><h2>Key performance indicators</h2></div>
            <small>Current vendor performance</small>
          </div>

          <section className="va-kpi-grid">
            <MetricCard label="Total hits" value={totalHits} note="Respondent entries" icon={Activity} tone="blue" />
            <MetricCard label="Completes" value={completes} note="Successfully completed" icon={CheckCircle2} tone="green" />
            <MetricCard label="Incidence rate" value={formatPercent(summary.ir)} note="Completes ÷ total hits" icon={TrendingUp} tone="violet" />
            <MetricCard label="Terminations" value={Number(summary.terminate) || 0} note="Respondents terminated" icon={XCircle} tone="red" />
            <MetricCard label="Quota full" value={Number(summary.quota_full) || 0} note="Quota limit reached" icon={Flag} tone="amber" />
            <MetricCard label="Security flags" value={Number(summary.security) || 0} note="Security terminations" icon={ShieldAlert} tone="slate" />
          </section>

          <section className="va-started-strip">
            <div className="va-started-icon"><Clock3 size={19} /></div>
            <div><span>Currently recorded as started</span><strong>{formatNumber(summary.started)}</strong></div>
            <small>Included in the vendor's respondent status breakdown</small>
          </section>

          <div className="va-section-heading">
            <div><span>RESPONDENT ANALYSIS</span><h2>Activity and outcomes</h2></div>
            <small>Daily volume and respondent status distribution</small>
          </div>

          <section className="va-chart-grid">
            <Panel title="Respondent activity" subtitle="Daily respondent hits over the last 7 days" action={<span className="va-chart-tag"><Activity size={13} /> 7 day trend</span>}>
              {trend.length ? (
                <div className="va-chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="vaHitsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.015} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e9eef5" strokeDasharray="4 5" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} dy={8} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} width={35} />
                      <Tooltip content={<ChartTooltip />} labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""} />
                      <Area type="monotone" dataKey="hits" name="Respondent hits" stroke="#8b5cf6" strokeWidth={3} fill="url(#vaHitsGradient)" activeDot={{ r: 6, stroke: "#fff", strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyChart>No respondent activity available for this period.</EmptyChart>}
            </Panel>

            <Panel title="Outcome distribution" subtitle="Share of recorded respondent outcomes" action={<span className="va-chart-tag"><Users size={13} /> {formatNumber(totalHits)} hits</span>}>
              {chartStatus.length ? (
                <div className="va-donut-layout">
                  <div className="va-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartStatus} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="90%" paddingAngle={3} stroke="none">
                          {chartStatus.map((item) => <Cell key={item.status} fill={item.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value) => [formatNumber(value), "Respondents"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="va-donut-center"><strong>{formatNumber(totalHits)}</strong><span>Total hits</span></div>
                  </div>
                  <div className="va-legend">
                    {chartStatus.map((item) => {
                      const percent = totalHits ? (Number(item.value) / totalHits) * 100 : 0;
                      return (
                        <div className="va-legend-item" key={item.status}>
                          <div className="va-legend-head">
                            <span><i style={{ background: item.fill }} />{item.name}</span>
                            <strong>{formatNumber(item.value)}</strong>
                          </div>
                          <div className="va-legend-track"><div style={{ width: `${Math.min(percent, 100)}%`, background: item.fill }} /></div>
                          <small>{formatPercent(percent)}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : <EmptyChart>No outcome breakdown available.</EmptyChart>}
            </Panel>
          </section>

          <div className="va-section-heading">
            <div><span>PROJECT CONTRIBUTION</span><h2>Where this vendor is delivering</h2></div>
            <small>Projects ranked by respondent hits</small>
          </div>

          <Panel title="Project split" subtitle="Respondent hits attributed to this vendor across projects" action={<span className="va-count-pill">{projectSplit.length} projects shown</span>}>
            {projectSplit.length ? (
              <div className="va-project-chart">
                <ResponsiveContainer width="100%" height={Math.max(230, projectSplit.length * 49)}>
                  <BarChart data={projectSplit} layout="vertical" margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                    <CartesianGrid stroke="#e9eef5" strokeDasharray="4 5" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} />
                    <YAxis type="category" dataKey="project_name" width={145} tickLine={false} axisLine={false} tick={{ fill: "#52627a", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="hits" name="Respondent hits" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={21} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyChart>This vendor has no project attribution yet.</EmptyChart>}
          </Panel>

          <div className="va-section-heading">
            <div><span>DETAILED BREAKDOWN</span><h2>Vendor delivery details</h2></div>
            <small>Figures returned by the analytics service</small>
          </div>

          <section className="va-detail-grid">
            <Panel title="Respondent outcomes" subtitle="Counts and share of vendor hits">
              {chartStatus.length ? (
                <div className="va-table-wrap">
                  <table className="va-table">
                    <thead><tr><th>Outcome</th><th>Respondents</th><th>Share of hits</th></tr></thead>
                    <tbody>
                      {chartStatus.map((item) => (
                        <tr key={item.status}>
                          <td><span className="va-table-label"><i style={{ background: item.fill }} />{item.name}</span></td>
                          <td>{formatNumber(item.value)}</td>
                          <td>{totalHits ? formatPercent((Number(item.value) / totalHits) * 100) : "0.0%"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyChart>No respondent outcome records available.</EmptyChart>}
            </Panel>

            <Panel title="Project contribution details" subtitle="Top projects by respondent volume">
              {projectSplit.length ? (
                <div className="va-table-wrap">
                  <table className="va-table">
                    <thead><tr><th>Project</th><th>Hits</th><th>Share</th></tr></thead>
                    <tbody>
                      {projectSplit.map((item) => (
                        <tr key={item.project_id}>
                          <td>{item.project_name || "Unknown"}</td>
                          <td>{formatNumber(item.hits)}</td>
                          <td>{totalHits ? formatPercent((Number(item.hits) / totalHits) * 100) : "0.0%"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyChart>No project contribution data available.</EmptyChart>}
            </Panel>
          </section>

          <footer className="va-footnote"><Timer size={14} /><span>Metrics reflect the data currently returned by the PanelSphere analytics API. Trend covers the latest 7 days; project split shows up to 8 projects.</span></footer>
        </div>
      )}

      {detailLoading && <div className="va-loading-overlay"><RefreshCw size={17} className="va-spin" />Updating vendor analytics...</div>}
    </main>
  );
}
