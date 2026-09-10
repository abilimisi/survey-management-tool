import "./FunnelChart.css";

// Real, data-driven funnel — replaces the hardcoded
// "Started ↓ Complete ↓ Terminate ↓ Quota Full ↓ Security" text block
// that used to live directly inside AnalyticsDashboard.jsx.
//
// Props:
//   stages -> [{ stage, value, percent, color }]  (from /analytics/funnel/)
export default function FunnelChart({ stages }) {

    if (!stages || stages.length === 0) {
        return <div className="analytics-empty">No funnel data</div>;
    }

    const maxValue = Math.max(...stages.map((s) => s.value), 1);

    return (
        <div className="funnel-chart">
            {stages.map((s) => {
                const widthPct = Math.max((s.value / maxValue) * 100, 4);

                return (
                    <div className="funnel-row" key={s.stage}>
                        <div className="funnel-label">{s.stage}</div>

                        <div className="funnel-track">
                            <div
                                className="funnel-bar"
                                style={{
                                    width: `${widthPct}%`,
                                    background: s.color || "#2563eb",
                                }}
                            >
                                <span>{s.value.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="funnel-percent">{s.percent}%</div>
                    </div>
                );
            })}
        </div>
    );
}
