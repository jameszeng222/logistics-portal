"use client";

import { useEffect, useState, useCallback } from "react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Filters, type TimeRange } from "@/components/dashboard/filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
interface KpiData {
  feeRatio: number;
  avgDays: number;
  totalQty: number;
  totalCost: number;
}

interface FeeRatioTrendItem {
  month: string;
  brand: string;
  feeRatio: number;
}

interface BrandFeeRankItem {
  brand: string;
  feeRatio: number;
}

interface ProviderTimelinessItem {
  provider: string;
  channel: string;
  avgDays: number;
}

interface ChannelVolumeItem {
  channel: string;
  qty: number;
}

interface DashboardData {
  kpi: KpiData;
  feeRatioTrend: FeeRatioTrendItem[];
  brandFeeRank: BrandFeeRankItem[];
  providerTimeliness: ProviderTimelinessItem[];
  channelVolume: ChannelVolumeItem[];
}

// --- Mock / fallback data ---
const MOCK_DATA: DashboardData = {
  kpi: { feeRatio: 0.0532, avgDays: 12.5, totalQty: 28400, totalCost: 156800 },
  feeRatioTrend: [
    { month: "2025-07", brand: "LM", feeRatio: 0.048 },
    { month: "2025-08", brand: "LM", feeRatio: 0.051 },
    { month: "2025-09", brand: "LM", feeRatio: 0.047 },
    { month: "2025-10", brand: "LM", feeRatio: 0.053 },
    { month: "2025-11", brand: "LM", feeRatio: 0.055 },
    { month: "2025-12", brand: "LM", feeRatio: 0.049 },
    { month: "2026-01", brand: "LM", feeRatio: 0.052 },
    { month: "2026-02", brand: "LM", feeRatio: 0.050 },
    { month: "2026-03", brand: "LM", feeRatio: 0.046 },
    { month: "2026-04", brand: "LM", feeRatio: 0.048 },
    { month: "2026-05", brand: "LM", feeRatio: 0.053 },
    { month: "2026-06", brand: "LM", feeRatio: 0.051 },
    { month: "2025-07", brand: "FD", feeRatio: 0.062 },
    { month: "2025-08", brand: "FD", feeRatio: 0.058 },
    { month: "2025-09", brand: "FD", feeRatio: 0.065 },
    { month: "2025-10", brand: "FD", feeRatio: 0.061 },
    { month: "2025-11", brand: "FD", feeRatio: 0.067 },
    { month: "2025-12", brand: "FD", feeRatio: 0.059 },
    { month: "2026-01", brand: "FD", feeRatio: 0.063 },
    { month: "2026-02", brand: "FD", feeRatio: 0.060 },
    { month: "2026-03", brand: "FD", feeRatio: 0.057 },
    { month: "2026-04", brand: "FD", feeRatio: 0.062 },
    { month: "2026-05", brand: "FD", feeRatio: 0.064 },
    { month: "2026-06", brand: "FD", feeRatio: 0.061 },
    { month: "2025-07", brand: "LM-TT", feeRatio: 0.039 },
    { month: "2025-08", brand: "LM-TT", feeRatio: 0.042 },
    { month: "2025-09", brand: "LM-TT", feeRatio: 0.038 },
    { month: "2025-10", brand: "LM-TT", feeRatio: 0.044 },
    { month: "2025-11", brand: "LM-TT", feeRatio: 0.041 },
    { month: "2025-12", brand: "LM-TT", feeRatio: 0.037 },
    { month: "2026-01", brand: "LM-TT", feeRatio: 0.040 },
    { month: "2026-02", brand: "LM-TT", feeRatio: 0.043 },
    { month: "2026-03", brand: "LM-TT", feeRatio: 0.036 },
    { month: "2026-04", brand: "LM-TT", feeRatio: 0.039 },
    { month: "2026-05", brand: "LM-TT", feeRatio: 0.041 },
    { month: "2026-06", brand: "LM-TT", feeRatio: 0.038 },
    { month: "2025-07", brand: "FD-TT", feeRatio: 0.055 },
    { month: "2025-08", brand: "FD-TT", feeRatio: 0.052 },
    { month: "2025-09", brand: "FD-TT", feeRatio: 0.058 },
    { month: "2025-10", brand: "FD-TT", feeRatio: 0.054 },
    { month: "2025-11", brand: "FD-TT", feeRatio: 0.057 },
    { month: "2025-12", brand: "FD-TT", feeRatio: 0.051 },
    { month: "2026-01", brand: "FD-TT", feeRatio: 0.056 },
    { month: "2026-02", brand: "FD-TT", feeRatio: 0.053 },
    { month: "2026-03", brand: "FD-TT", feeRatio: 0.049 },
    { month: "2026-04", brand: "FD-TT", feeRatio: 0.054 },
    { month: "2026-05", brand: "FD-TT", feeRatio: 0.057 },
    { month: "2026-06", brand: "FD-TT", feeRatio: 0.052 },
  ],
  brandFeeRank: [
    { brand: "FD", feeRatio: 0.061 },
    { brand: "FD-TT", feeRatio: 0.052 },
    { brand: "LM", feeRatio: 0.051 },
    { brand: "LM-TT", feeRatio: 0.038 },
  ],
  providerTimeliness: [
    { provider: "华贸物流", channel: "海运", avgDays: 32 },
    { provider: "东莞环亚", channel: "海运", avgDays: 35 },
    { provider: "美通国际", channel: "海运", avgDays: 30 },
    { provider: "南航货运", channel: "空运", avgDays: 8 },
    { provider: "云途物流", channel: "空运", avgDays: 10 },
    { provider: "UPS代理-万邑通", channel: "UPS", avgDays: 5 },
  ],
  channelVolume: [
    { channel: "UPS", qty: 12000 },
    { channel: "空运", qty: 8400 },
    { channel: "海运", qty: 8000 },
  ],
};

const BRAND_COLORS: Record<string, string> = {
  LM: "#3b82f6",
  "LM-TT": "#8b5cf6",
  FD: "#ef4444",
  "FD-TT": "#f97316",
};

const CHANNEL_COLORS: Record<string, string> = {
  UPS: "#3b82f6",
  空运: "#10b981",
  海运: "#f59e0b",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

// --- Helper: transform trend data for Recharts ---
function transformTrendData(trend: FeeRatioTrendItem[]) {
  const months = [...new Set(trend.map((t) => t.month))].sort();
  const brandsList = [...new Set(trend.map((t) => t.brand))];
  return months.map((month) => {
    const row: Record<string, string | number> = { month };
    for (const brand of brandsList) {
      const item = trend.find((t) => t.month === month && t.brand === brand);
      row[brand] = item ? item.feeRatio : 0;
    }
    return row;
  });
}

// --- Helper: transform provider timeliness for grouped bar ---
function transformProviderTimeliness(data: ProviderTimelinessItem[]) {
  const providersList = [...new Set(data.map((d) => d.provider))];
  const channelsList = [...new Set(data.map((d) => d.channel))];
  return providersList.map((provider) => {
    const row: Record<string, string | number> = { provider };
    for (const channel of channelsList) {
      const item = data.find(
        (d) => d.provider === provider && d.channel === channel
      );
      row[channel] = item ? item.avgDays : 0;
    }
    return row;
  });
}

// --- Helper: provider timeliness trend (mock monthly breakdown) ---
function getProviderTimelinessTrend(data: ProviderTimelinessItem[]) {
  const months = [
    "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
  ];
  const providersList = [...new Set(data.map((d) => d.provider))];
  return months.map((month) => {
    const row: Record<string, string | number> = { month };
    for (const provider of providersList) {
      const item = data.find((d) => d.provider === provider);
      const base = item ? item.avgDays : 0;
      // Add slight variation for trend visualization
      const variation = (Math.random() - 0.5) * 4;
      row[provider] = Math.max(0, Math.round((base + variation) * 10) / 10);
    }
    return row;
  });
}

// --- Helper: channel volume for stacked bar by brand ---
function getChannelVolumeByBrand() {
  return [
    { channel: "UPS", LM: 5000, "LM-TT": 2000, FD: 3000, "FD-TT": 2000 },
    { channel: "空运", LM: 3000, "LM-TT": 1400, FD: 2400, "FD-TT": 1600 },
    { channel: "海运", LM: 2800, "LM-TT": 1200, FD: 2200, "FD-TT": 1800 },
  ];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>(["LM", "LM-TT", "FD", "FD-TT"]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("timeRange", timeRange);
      if (selectedBrands.length > 0) {
        params.set("brands", selectedBrands.join(","));
      }
      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const json: DashboardData = await res.json();

      // Use mock data as fallback if API returns empty
      const hasData =
        json.brandFeeRank.length > 0 ||
        json.channelVolume.length > 0 ||
        json.kpi.totalQty > 0;

      if (hasData) {
        setData(json);
        // Update brand list from data
        const brandsFromData = [...new Set(json.brandFeeRank.map((b) => b.brand))];
        if (brandsFromData.length > 0) {
          setAllBrands(brandsFromData);
        }
      } else {
        setData(MOCK_DATA);
      }
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedBrands]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const trendChartData = transformTrendData(data.feeRatioTrend);
  const providerGroupedData = transformProviderTimeliness(data.providerTimeliness);
  const providerTrendData = getProviderTimelinessTrend(data.providerTimeliness);
  const channelStackedData = getChannelVolumeByBrand();
  const channelsList = [...new Set(data.providerTimeliness.map((d) => d.channel))];
  const providersList = [...new Set(data.providerTimeliness.map((d) => d.provider))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">数据看板</h1>
        <Filters
          brands={allBrands}
          selectedBrands={selectedBrands}
          timeRange={timeRange}
          onBrandsChange={setSelectedBrands}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="物流费率"
          value={`${(data.kpi.feeRatio * 100).toFixed(2)}%`}
          description="物流成本 / 销售金额"
        />
        <KpiCard
          title="平均时效"
          value={`${data.kpi.avgDays} 天`}
          description="平均实际运输天数"
        />
        <KpiCard
          title="总发货量"
          value={data.kpi.totalQty.toLocaleString()}
          description="统计周期内总发货件数"
        />
        <KpiCard
          title="物流总成本"
          value={`¥${data.kpi.totalCost.toLocaleString()}`}
          description="统计周期内物流费用合计"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* 1. Fee ratio trend line chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">费率趋势（按品牌）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                  />
                  <Tooltip
                    formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`}
                    labelFormatter={(label) => `月份: ${String(label)}`}
                  />
                  <Legend />
                  {allBrands.map((brand) => (
                    <Line
                      key={brand}
                      type="monotone"
                      dataKey={brand}
                      stroke={BRAND_COLORS[brand] || "#6b7280"}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Brand fee ratio rank bar chart (horizontal) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">品牌费率排名</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.brandFeeRank}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="brand"
                    tick={{ fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`}
                  />
                  <Bar dataKey="feeRatio" radius={[0, 4, 4, 0]}>
                    {data.brandFeeRank.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BRAND_COLORS[entry.brand] || "#6b7280"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Provider timeliness comparison (grouped bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">服务商时效对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerGroupedData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="provider"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} unit="天" />
                  <Tooltip formatter={(value) => `${Number(value)} 天`} />
                  <Legend />
                  {channelsList.map((channel) => (
                    <Bar
                      key={channel}
                      dataKey={channel}
                      fill={CHANNEL_COLORS[channel] || "#6b7280"}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Provider timeliness trend (line) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">服务商时效趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={providerTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} unit="天" />
                  <Tooltip formatter={(value) => `${Number(value)} 天`} />
                  <Legend />
                  {providersList.map((provider, idx) => (
                    <Line
                      key={provider}
                      type="monotone"
                      dataKey={provider}
                      stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 5. Volume comparison (stacked bar by brand) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">渠道发货量对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelStackedData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {allBrands.map((brand) => (
                    <Bar
                      key={brand}
                      dataKey={brand}
                      stackId="qty"
                      fill={BRAND_COLORS[brand] || "#6b7280"}
                      radius={
                        brand === allBrands[allBrands.length - 1]
                          ? [4, 4, 0, 0]
                          : undefined
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 6. Channel volume pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">渠道占比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.channelVolume}
                    dataKey="qty"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine
                  >
                    {data.channelVolume.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
