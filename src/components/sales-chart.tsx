"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#222" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#666" tick={{ fill: "#888", fontSize: 11 }} />
          <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#000", border: "1px solid #0a0a0a" }}
            labelStyle={{ color: "#0a0a0a" }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0a0a0a"
            strokeWidth={2}
            dot={{ fill: "#0a0a0a", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
