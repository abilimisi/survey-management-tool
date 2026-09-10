import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
} from "recharts";

import { PALETTE, AXIS_STYLE, GRID_STROKE } from "./chartTheme";

// Generic horizontal bar chart used for:
//   - Project Analytics -> "who is delivering this project" (vendor split)
//   - Vendor Analytics  -> "which projects this vendor works on" (project split)
//
// Props:
//   data     -> [{ name, value }]
//   height   -> chart height (default: 46px per row, min 220)
//   valueKey -> field to plot (default "value")
//   nameKey  -> label field (default "name")
export default function SplitBarChart({
    data,
    valueKey = "value",
    nameKey = "name",
    height,
}) {

    if (!data || data.length === 0) {
        return <div className="analytics-empty">No data to compare</div>;
    }

    const chartHeight = height || Math.max(data.length * 46, 220);

    return (
        <ResponsiveContainer width="100%" height={chartHeight}>

            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
            >

                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />

                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />

                <YAxis
                    type="category"
                    dataKey={nameKey}
                    tick={AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                />

                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb" }} />

                <Bar dataKey={valueKey} radius={[0, 8, 8, 0]} barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={entry[nameKey] || index} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                </Bar>

            </BarChart>

        </ResponsiveContainer>
    );
}
