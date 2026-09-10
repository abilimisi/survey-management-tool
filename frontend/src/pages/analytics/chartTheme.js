// Central theme for every Analytics chart (Dashboard, Project Analytics,
// Vendor Analytics). Import this instead of hardcoding hex codes in each
// chart file, so all three modules stay visually consistent.

export const STATUS_COLORS = {
  started: "#3b82f6",
  complete: "#22c55e",
  terminate: "#ef4444",
  quota_full: "#f59e0b",
  security_terminate: "#8b5cf6",
};

// Ordered palette for generic multi-series bar/line charts
// (vendor split, project split, comparisons, etc.)
export const PALETTE = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export const AXIS_STYLE = {
  fontSize: 12,
  fill: "#64748b",
};

export const GRID_STROKE = "#e5e7eb";
