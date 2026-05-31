"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface RevenueBarChartProps {
  data: { month: string; revenue: number }[];
  year: number;
}

export default function RevenueBarChart({ data, year }: RevenueBarChartProps) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--color-neutral-900)" }}>
            Monthly Revenue
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-neutral-400)" }}>
            Platform payments for {year}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(0, 3)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₨${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip
            cursor={{ fill: "#eff6ff" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="card-base py-2 px-3 text-sm">
                  <p className="font-semibold" style={{ color: "var(--color-neutral-900)" }}>
                    {payload[0].payload.month}
                  </p>
                  <p className="font-bold" style={{ color: "var(--color-primary-600)" }}>
                    {formatCurrency(payload[0].value as number)}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
