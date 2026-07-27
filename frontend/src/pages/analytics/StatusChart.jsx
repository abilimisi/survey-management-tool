import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS=[
    "#22c55e",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
];

export default function StatusPieChart({data}){

    if(!data) return null;

    return(

        <div className="chart-card">

            <h3>Status Distribution</h3>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="status"
                        outerRadius={110}
                        label
                    >

                        {
                            data.map((entry,index)=>(
                                <Cell
                                    key={index}
                                    fill={COLORS[index%COLORS.length]}
                                />
                            ))
                        }

                    </Pie>

                    <Tooltip/>

                    <Legend/>

                </PieChart>

            </ResponsiveContainer>

        </div>

    )

}