"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendDataPoint {
  month: string;
  providerName: string;
  [key: string]: string | number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  valueKey: string;
  valueLabel: string;
  title: string;
}

export function TrendChart({ data, valueKey, valueLabel, title }: TrendChartProps) {
  // 将数据透视：每行一个月份，每个服务商一列
  const monthMap = new Map<string, Record<string, string | number>>();
  data.forEach((point) => {
    if (!monthMap.has(point.month)) {
      monthMap.set(point.month, { month: point.month });
    }
    const entry = monthMap.get(point.month)!;
    entry[point.providerName] = Number(point[valueKey]);
  });

  const chartData = Array.from(monthMap.values()).sort((a, b) =>
    String(a.month).localeCompare(String(b.month))
  );

  const providers = [...new Set(data.map((d) => d.providerName))];

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            暂无趋势数据
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]}
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              {providers.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
