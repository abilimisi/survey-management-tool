
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Globe2,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  Timer,
  TrendingUp,
  Users,
  XCircle,
  Flag,
  BriefcaseBusiness,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  getProjectList,
  getAnalyticsProjectDetails,
} from "../../../api/analyticsApi";

import "./ProjectAnalytics.css";

/* -------------------------------------------------------
   DESIGN TOKENS
------------------------------------------------------- */

const STATUS_COLORS = {
  complete: "#16a36a",
  terminate: "#e05a67",
  quota_full: "#e9a23b",
  security_terminate: "#8b6de9",
  started: "#4387e8",
};

const numberFormat = new Intl.NumberFormat("en-IN");

const formatNumber = (value) =>
  numberFormat.format(Number(value) || 0);

const formatPercent = (value) =>
  `${(Number(value) || 0).toFixed(1)}%`;

const normalizeStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

const getStatusColor = (status) =>
  STATUS_COLORS[normalizeStatus(status)] || "#94a3b8";

/* -------------------------------------------------------
   CSV EXPORT
------------------------------------------------------- */

function downloadCsv(project, summary, trend, statusBreakdown, vendorSplit) {
  const rows = [
    ["PROJECT ANALYTICS REPORT"],
    ["Project", project?.name || ""],
    ["Project ID", project?.id || ""],
    ["Client", project?.client || ""],
    ["Country", project?.country || ""],
    ["Project status", project?.status || ""],
    [],
    ["PERFORMANCE SUMMARY"],
    ["Metric", "Value"],
    ["Total hits", summary?.hits ?? 0],
    ["Completes", summary?.complete ?? 0],
    ["Incidence rate", `${summary?.ir ?? 0}%`],
    ["Terminations", summary?.terminate ?? 0],
    ["Quota full", summary?.quota_full ?? 0],
    ["Security flags", summary?.security ?? 0],
    ["Project target", project?.target ?? 0],
    [],
    ["DAILY RESPONDENT ACTIVITY"],
    ["Day", "Date", "Hits"],
    ...trend.map((item) => [
      item.day,
      item.date,
      item.hits,
    ]),
    [],
    ["RESPONDENT OUTCOMES"],
    ["Status", "Respondents"],
    ...statusBreakdown.map((item) => [
      item.name,
      item.value,
    ]),
    [],
    ["VENDOR CONTRIBUTION"],
    ["Vendor", "Hits"],
    ...vendorSplit.map((item) => [
      item.vendor_name,
      item.hits,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${String(cell ?? "").replaceAll('"', '""')}"`
        )
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${(
    project?.name || "project"
  ).replace(/[^a-z0-9-_]+/gi, "_")}_analytics.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------
   REUSABLE COMPONENTS
------------------------------------------------------- */

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "blue",
  suffix = "",
}) {
  return (
    <article className={`pa-kpi-card pa-kpi-${tone}`}>
      <div className="pa-kpi-top">
        <div className="pa-kpi-icon">
          <Icon size={20} strokeWidth={2.1} />
        </div>

        <span className="pa-kpi-label">{label}</span>
      </div>

      <div className="pa-kpi-value">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
        {suffix}
      </div>

      <div className="pa-kpi-bottom">
        <span>{note}</span>
        <span className="pa-kpi-indicator" />
      </div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  action,
  className = "",
  children,
}) {
  return (
    <section className={`pa-panel ${className}`}>
      <div className="pa-panel-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {action && (
          <div className="pa-panel-action">
            {action}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}

function EmptyChart({ children = "No data available for this view." }) {
  return (
    <div className="pa-empty-chart">
      <ChartNoAxesCombined size={28} />
      <span>{children}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="pa-chart-tooltip">
      <span className="pa-tooltip-label">{label}</span>

      {payload.map((item) => (
        <div className="pa-tooltip-row" key={item.dataKey}>
          <span>
            <i style={{ background: item.color || item.fill }} />
            {item.name || item.dataKey}
          </span>
          <strong>{formatNumber(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function ProjectAnalytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectData, setProjectData] = useState(null);

  const [projectSearch, setProjectSearch] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ---------------- PROJECT LIST ---------------- */

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError("");

    try {
      const data = await getProjectList();

      const list = Array.isArray(data)
        ? data
        : data?.results || [];

      setProjects(list);

      setSelectedProject((current) => {
        if (
          current &&
          list.some(
            (item) => String(item.id) === String(current)
          )
        ) {
          return current;
        }

        return list.length ? String(list[0].id) : "";
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  /* ---------------- PROJECT DETAILS ---------------- */

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

      setError(
        err?.response?.data?.detail ||
          "Unable to load analytics for this project."
      );
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject);
    } else {
      setProjectData(null);
    }
  }, [selectedProject, loadProjectDetails]);

  /* ---------------- DATA ---------------- */

  const summary = projectData?.summary || {};
  const project = projectData?.project || {};

  const trend = projectData?.trend || [];
  const statusBreakdown = projectData?.status_breakdown || [];
  const vendorSplit = projectData?.vendor_split || [];

  const target = Number(project.target) || 0;
  const completes = Number(summary.complete) || 0;
  const totalHits = Number(summary.hits) || 0;

  const targetProgress =
    target > 0
      ? Math.min((completes / target) * 100, 100)
      : 0;

  const remaining = Math.max(target - completes, 0);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.toLowerCase().trim();

    if (!query) return projects;

    return projects.filter((item) =>
      `${item.name || ""} ${item.client || ""} ${item.country || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [projects, projectSearch]);

  const chartStatus = useMemo(
    () =>
      statusBreakdown.map((item) => ({
        ...item,
        fill: getStatusColor(item.status),
      })),
    [statusBreakdown]
  );

  const sortedVendors = useMemo(
    () =>
      [...vendorSplit].sort(
        (a, b) =>
          (Number(b.hits) || 0) - (Number(a.hits) || 0)
      ),
    [vendorSplit]
  );

  const refreshAll = async () => {
    if (selectedProject) {
      await loadProjectDetails(selectedProject);
    }
  };

  const handleExport = () => {
    downloadCsv(
      project,
      summary,
      trend,
      statusBreakdown,
      sortedVendors
    );
  };

  /* ---------------- LOADING ---------------- */

  if (loadingProjects) {
    return (
      <main className="pa-page">
        <div className="pa-loading">
          <RefreshCw className="pa-spin" size={22} />
          Loading project analytics...
        </div>
      </main>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="pa-page">
      {/* PAGE HEADER */}

      <header className="pa-header">
        <div className="pa-header-copy">
          <div className="pa-eyebrow">
            <span className="pa-eyebrow-dot" />
            BUSINESS INTELLIGENCE
          </div>

          <h1>Project Analytics</h1>

          <p>
            Monitor project delivery, respondent activity
            and vendor performance in one place.
          </p>
        </div>

        <div className="pa-header-actions">
          <button
            type="button"
            className="pa-button pa-button-light"
            onClick={refreshAll}
            disabled={!selectedProject || loadingDetails}
          >
            <RefreshCw
              size={16}
              className={loadingDetails ? "pa-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="pa-button pa-button-primary"
            onClick={handleExport}
            disabled={!projectData || loadingDetails}
          >
            <ArrowDownToLine size={16} />
            Export report
          </button>
        </div>
      </header>

      {/* FILTER BAR */}

      <section className="pa-filterbar">
        <div className="pa-filter-heading">
          <div className="pa-filter-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <strong>Analysis scope</strong>
            <span>Select a project to explore</span>
          </div>
        </div>

        <div className="pa-filter-controls">
          <div className="pa-search-box">
            <Search size={17} />

            <input
              type="text"
              aria-label="Search projects"
              placeholder="Search project, client or country..."
              value={projectSearch}
              onChange={(event) =>
                setProjectSearch(event.target.value)
              }
            />
          </div>

          <select
            aria-label="Select project"
            value={selectedProject}
            onChange={(event) =>
              setSelectedProject(event.target.value)
            }
          >
            {filteredProjects.length === 0 && (
              <option value="">No matching projects</option>
            )}

            {filteredProjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.client || "No client"}
              </option>
            ))}
          </select>
        </div>

        <div className="pa-updated">
          <span className="pa-live-dot" />
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Waiting for data"}
        </div>
      </section>

      {/* ERROR / EMPTY STATES */}

      {error && (
        <div className="pa-alert">
          <CircleAlert size={18} />
          <span>{error}</span>

          <button type="button" onClick={refreshAll}>
            Retry
          </button>
        </div>
      )}

      {!error && projects.length === 0 && (
        <div className="pa-empty-state">
          <Building2 size={34} />
          <h2>No projects found</h2>
          <p>
            Projects will appear here when they are available
            for analytics.
          </p>
        </div>
      )}

      {projects.length > 0 &&
        filteredProjects.length === 0 && (
          <div className="pa-empty-state">
            <Search size={30} />
            <h2>No matching projects</h2>
            <p>
              Try a different project, client or country name.
            </p>
          </div>
        )}

      {/* ANALYTICS CONTENT */}

      {projectData && (
        <div
          className={`pa-content ${
            loadingDetails ? "is-loading" : ""
          }`}
        >
          {/* PROJECT OVERVIEW */}

          <section className="pa-project-banner">
            <div className="pa-project-main">
              <div className="pa-project-mark">
                <BriefcaseBusiness size={23} />
              </div>

              <div className="pa-project-copy">
                <span className="pa-overline">
                  SELECTED PROJECT
                </span>

                <h2>{project.name || "Project"}</h2>

                <div className="pa-project-meta">
                  <span>
                    <Building2 size={14} />
                    {project.client || "No client"}
                  </span>

                  <span>
                    <Globe2 size={14} />
                    {project.country || "Country not set"}
                  </span>

                  <span>
                    <Clock3 size={14} />
                    LOI {project.loi ?? 0} min
                  </span>

                  <span>
                    <Target size={14} />
                    Target {formatNumber(target)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pa-project-status">
              <span
                className={`pa-status-pill ${normalizeStatus(
                  project.status
                )}`}
              >
                {String(project.status || "Unknown").replaceAll(
                  "_",
                  " "
                )}
              </span>

              <span className="pa-project-id">
                PROJECT ID · {project.id}
              </span>
            </div>
          </section>

          {/* KPI CARDS */}

          <div className="pa-section-heading">
            <div>
              <span className="pa-section-kicker">
                PERFORMANCE OVERVIEW
              </span>
              <h2>Key performance indicators</h2>
            </div>

            <span className="pa-section-caption">
              Current project performance
            </span>
          </div>

          <section className="pa-kpi-grid">
            <MetricCard
              label="Total hits"
              value={totalHits}
              note="Total respondent entries"
              icon={Activity}
              tone="blue"
            />

            <MetricCard
              label="Completes"
              value={completes}
              note="Successfully completed"
              icon={CheckCircle2}
              tone="green"
            />

            <MetricCard
              label="Incidence rate"
              value={formatPercent(summary.ir)}
              note="Completes ÷ total hits"
              icon={TrendingUp}
              tone="violet"
            />

            <MetricCard
              label="Terminations"
              value={Number(summary.terminate) || 0}
              note="Respondents terminated"
              icon={XCircle}
              tone="red"
            />

            <MetricCard
              label="Quota full"
              value={Number(summary.quota_full) || 0}
              note="Quota limit reached"
              icon={Flag}
              tone="amber"
            />

            <MetricCard
              label="Security flags"
              value={Number(summary.security) || 0}
              note="Security terminations"
              icon={ShieldAlert}
              tone="slate"
            />
          </section>

          {/* TARGET DELIVERY */}

          <section className="pa-progress-panel">
            <div className="pa-progress-main">
              <div className="pa-progress-icon">
                <Target size={21} />
              </div>

              <div className="pa-progress-copy">
                <span className="pa-overline">
                  TARGET DELIVERY
                </span>

                <h3>Project completion progress</h3>

                <p>
                  {formatNumber(completes)} completes out of{" "}
                  {formatNumber(target)} target
                </p>
              </div>
            </div>

            <div className="pa-progress-value">
              {target > 0
                ? formatPercent(targetProgress)
                : "—"}
            </div>

            <div className="pa-progress-track">
              <div
                style={{ width: `${targetProgress}%` }}
              />
            </div>

            <div className="pa-progress-foot">
              <span>
                {target > 0
                  ? `${formatNumber(remaining)} completes remaining`
                  : "No target configured for this project"}
              </span>

              <span>
                {target > 0
                  ? `${formatNumber(target)} target`
                  : "Target unavailable"}
              </span>
            </div>
          </section>

          {/* RESPONDENT ANALYSIS */}

          <div className="pa-section-heading">
            <div>
              <span className="pa-section-kicker">
                RESPONDENT ANALYSIS
              </span>
              <h2>Activity and outcomes</h2>
            </div>

            <span className="pa-section-caption">
              Respondent volume and status distribution
            </span>
          </div>

          <section className="pa-chart-grid">
            {/* ACTIVITY CHART */}

            <Panel
              title="Respondent activity"
              subtitle="Daily respondent hits over the last 7 days"
              className="pa-trend-panel"
              action={
                <span className="pa-chart-tag">
                  <Activity size={13} />
                  7 day trend
                </span>
              }
            >
              {trend.length ? (
                <div className="pa-chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trend}
                      margin={{
                        top: 12,
                        right: 12,
                        left: -18,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="paHitsGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3478f6"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3478f6"
                            stopOpacity={0.015}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#e9eef5"
                        strokeDasharray="4 5"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#8290a4",
                          fontSize: 11,
                        }}
                        dy={8}
                      />

                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#8290a4",
                          fontSize: 11,
                        }}
                        width={35}
                      />

                      <Tooltip
                        content={<CustomTooltip />}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.date || ""
                        }
                      />

                      <Area
                        type="monotone"
                        dataKey="hits"
                        name="Respondent hits"
                        stroke="#3478f6"
                        strokeWidth={3}
                        fill="url(#paHitsGradient)"
                        activeDot={{
                          r: 6,
                          stroke: "#ffffff",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart>
                  No respondent activity available for this period.
                </EmptyChart>
              )}
            </Panel>

            {/* OUTCOME CHART */}

            <Panel
              title="Outcome distribution"
              subtitle="Breakdown of recorded respondent outcomes"
              className="pa-outcome-panel"
              action={
                <span className="pa-chart-tag">
                  <Users size={13} />
                  {formatNumber(totalHits)} hits
                </span>
              }
            >
              {chartStatus.length ? (
                <div className="pa-donut-layout">
                  <div className="pa-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartStatus}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="67%"
                          outerRadius="91%"
                          paddingAngle={3}
                          stroke="none"
                        >
                          {chartStatus.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={entry.fill}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) => [
                            formatNumber(value),
                            "Respondents",
                          ]}
                          contentStyle={{
                            border: "1px solid #e6ebf2",
                            borderRadius: 12,
                            boxShadow:
                              "0 12px 30px rgba(20,35,60,.12)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pa-donut-center">
                      <strong>{formatNumber(totalHits)}</strong>
                      <span>Total hits</span>
                    </div>
                  </div>

                  <div className="pa-legend-list">
                    {chartStatus.map((item) => {
                      const percentage = totalHits
                        ? (Number(item.value) / totalHits) * 100
                        : 0;

                      return (
                        <div
                          className="pa-legend-item"
                          key={item.status}
                        >
                          <div className="pa-legend-top">
                            <span>
                              <i
                                style={{
                                  background: item.fill,
                                }}
                              />
                              {item.name}
                            </span>

                            <strong>
                              {formatNumber(item.value)}
                            </strong>
                          </div>

                          <div className="pa-legend-track">
                            <div
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                                background: item.fill,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyChart>
                  No outcome breakdown available.
                </EmptyChart>
              )}
            </Panel>
          </section>

          {/* VENDOR CONTRIBUTION */}

          <div className="pa-section-heading">
            <div>
              <span className="pa-section-kicker">
                VENDOR CONTRIBUTION
              </span>
              <h2>Delivery partner performance</h2>
            </div>

            <span className="pa-section-caption">
              Respondent volume by vendor
            </span>
          </div>

          <Panel
            title="Vendor delivery mix"
            subtitle="Respondent hits attributed to each vendor"
            action={
              <span className="pa-panel-count">
                {sortedVendors.length} vendors
              </span>
            }
          >
            {sortedVendors.length ? (
              <div className="pa-vendor-chart">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(
                    230,
                    sortedVendors.length * 48
                  )}
                >
                  <BarChart
                    data={sortedVendors}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 12,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e9eef5"
                      strokeDasharray="4 5"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#8290a4",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      type="category"
                      dataKey="vendor_name"
                      width={125}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#52627a",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                    />

                    <Bar
                      dataKey="hits"
                      name="Respondent hits"
                      fill="#477ff0"
                      radius={[0, 8, 8, 0]}
                      barSize={21}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart>
                Vendor attribution is not available for this project yet.
              </EmptyChart>
            )}
          </Panel>

          {/* DETAILED BREAKDOWN */}

          <div className="pa-section-heading">
            <div>
              <span className="pa-section-kicker">
                DETAILED BREAKDOWN
              </span>
              <h2>Project data and configuration</h2>
            </div>

            <span className="pa-section-caption">
              Detailed figures returned by the analytics service
            </span>
          </div>

          <section className="pa-detail-grid">
            <Panel
              title="Respondent outcomes"
              subtitle="Counts and share of total hits"
            >
              {chartStatus.length ? (
                <div className="pa-data-table-wrap">
                  <table className="pa-data-table">
                    <thead>
                      <tr>
                        <th>Outcome</th>
                        <th>Respondents</th>
                        <th>Share of hits</th>
                      </tr>
                    </thead>

                    <tbody>
                      {chartStatus.map((item) => (
                        <tr key={item.status}>
                          <td>
                            <span className="pa-table-label">
                              <i
                                style={{
                                  background: item.fill,
                                }}
                              />
                              {item.name}
                            </span>
                          </td>

                          <td>
                            {formatNumber(item.value)}
                          </td>

                          <td>
                            {totalHits
                              ? formatPercent(
                                  (Number(item.value) /
                                    totalHits) *
                                    100
                                )
                              : "0.0%"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyChart>
                  No respondent outcome records available.
                </EmptyChart>
              )}
            </Panel>

            <Panel
              title="Project information"
              subtitle="Project configuration and delivery context"
            >
              <div className="pa-info-list">
                <div>
                  <span>Project status</span>
                  <strong>
                    {String(project.status || "—").replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>Study type</span>
                  <strong>
                    {project.study_type || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Client</span>
                  <strong>
                    {project.client || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Country</span>
                  <strong>
                    {project.country || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Length of interview</span>
                  <strong>{project.loi ?? 0} minutes</strong>
                </div>

                <div>
                  <span>Project target</span>
                  <strong>{formatNumber(target)}</strong>
                </div>

                <div>
                  <span>Completes remaining</span>
                  <strong>
                    {target ? formatNumber(remaining) : "—"}
                  </strong>
                </div>
              </div>
            </Panel>
          </section>

          {/* FOOTNOTE */}

          <footer className="pa-footnote">
            <Timer size={14} />

            <span>
              Metrics reflect the data currently returned by
              the PanelSphere analytics API. Respondent activity
              trend is limited to the latest 7 days.
            </span>
          </footer>
        </div>
      )}

      {loadingDetails && (
        <div className="pa-loading-overlay">
          <RefreshCw size={18} className="pa-spin" />
          Updating project analytics...
        </div>
      )}
    </main>
  );
}
