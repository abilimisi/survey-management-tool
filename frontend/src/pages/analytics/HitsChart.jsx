import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import { AXIS_STYLE, GRID_STROKE } from "./chartTheme";

// Reusable gradient trend chart used by:
//   - Dashboard          (global 7-day hits)
//   - Project Analytics  (per-project 7-day hits)
//   - Vendor Analytics   (per-vendor 7-day hits)
//
// Props:
//   data      -> [{ day, date, hits }]
//   dataKey   -> field to plot (default "hits")
//   xKey      -> x-axis field (default "day")
//   color     -> line/fill color (default brand blue)
//   height    -> chart height (default 320)
export default function HitsChart({
    data,
    dataKey = "hits",
    xKey = "day",
    color = "#2563eb",
    height = 320,
}) {

    if (!data || data.length === 0) {
        return <div className="analytics-empty">No trend data</div>;
    }

    const gradientId = `hitsGradient-${dataKey}`;

    return (
        <ResponsiveContainer width="100%" height={height}>

            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>

                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />

                <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />

                <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb" }}
                />

                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    dot={{ r: 3, strokeWidth: 0, fill: color }}
                    activeDot={{ r: 5 }}
                />

            </AreaChart>

        </ResponsiveContainer>
    );
}
