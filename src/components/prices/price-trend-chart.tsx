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
  date: string;
  price: number;
  label: string;
}

interface PriceTrendChartProps {
  data: TrendDataPoint[];
  title: string;
}

export function PriceTrendChart({ data, title }: PriceTrendChartProps) {
  const seriesMap = new Map<string, { date: string; [key: string]: string | number }>();

  data.forEach((point) => {
    if (!seriesMap.has(point.date)) {
      seriesMap.set(point.date, { date: point.date });
    }
    const entry = seriesMap.get(point.date)!;
    entry[point.label] = point.price;
  });

  const chartData = Array.from(seriesMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const labels = [...new Set(data.map((d) => d.label))];

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
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(v: number) => `¥${v}`}
              />
              <Tooltip
                formatter={(value) => [`¥${Number(value).toFixed(2)}`, ""]}
                contentStyle={{
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              {labels.map((label, idx) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
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
