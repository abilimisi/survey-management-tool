import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function HitsChart({ data }) {

    if (!data) return null;

    return (

        <div className="chart-card">

            <h3>Daily Survey Hits</h3>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <LineChart data={data}>

                    <CartesianGrid strokeDasharray="3 3"/>

                    <XAxis dataKey="date"/>

                    <YAxis/>

                    <Tooltip/>

                    <Line
                        dataKey="hits"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}