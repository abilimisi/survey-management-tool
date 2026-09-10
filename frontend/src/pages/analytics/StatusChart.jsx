import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { STATUS_COLORS, PALETTE } from "./chartTheme";

// Reusable status donut used by:
//   - Dashboard              (AnalyticsDashboard.jsx)
//   - Project Analytics      (ProjectAnalytics.jsx -> ProjectStatusChart wrapper)
//   - Vendor Analytics       (VendorAnalytics.jsx  -> VendorStatusChart wrapper)
//
// Props:
//   data        -> [{ name, status, value }]
//   centerValue -> big number shown in the middle of the donut (e.g. total hits)
//   centerLabel -> small caption under the center value (e.g. "Total Hits")
//   height      -> chart height (default 300)
export default function StatusPieChart({
    data,
    centerValue,
    centerLabel = "Total",
    height = 300,
}) {

    if (!data || data.length === 0) {
        return <div className="analytics-empty">No status data</div>;
    }

    const total =
        centerValue !== undefined
            ? centerValue
            : data.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <div className="donut-wrapper">

            <ResponsiveContainer width="100%" height={height}>

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={height * 0.28}
                        outerRadius={height * 0.42}
                        paddingAngle={2}
                    >

                        {data.map((entry, index) => (
                            <Cell
                                key={entry.status || index}
                                fill={
                                    STATUS_COLORS[entry.status] ||
                                    entry.color ||
                                    PALETTE[index % PALETTE.length]
                                }
                            />
                        ))}

                    </Pie>

                    <Tooltip formatter={(value) => value.toLocaleString()} />

                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12.5 }}
                    />

                </PieChart>

            </ResponsiveContainer>

            <div className="donut-center-label">
                <h2>{total.toLocaleString()}</h2>
                <span>{centerLabel}</span>
            </div>

        </div>
    );
}
