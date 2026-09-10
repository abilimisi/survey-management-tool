import "./ChartCard.css";

// Reusable wrapper so every chart across Dashboard / Project Analytics /
// Vendor Analytics shares the same card shell, title style, and optional
// right-side badge (e.g. a total, a filter, an icon).
export default function ChartCard({ title, subtitle, right, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {right && <div className="chart-card-right">{right}</div>}
      </div>

      {children}
    </div>
  );
}
