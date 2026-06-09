"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendChart } from "@/components/assessment/trend-chart";

// Mock 数据
const mockByProvider = [
  { providerName: "顺丰国际", channelId: 1, avgActualDays: 5.2, avgPromisedDays: 5, achievementRate: 92.3, totalRecords: 156 },
  { providerName: "DHL", channelId: 2, avgActualDays: 3.8, avgPromisedDays: 4, achievementRate: 88.5, totalRecords: 203 },
  { providerName: "中远海运", channelId: 3, avgActualDays: 28.5, avgPromisedDays: 25, achievementRate: 72.1, totalRecords: 89 },
  { providerName: "UPS", channelId: 1, avgActualDays: 4.1, avgPromisedDays: 4, achievementRate: 95.2, totalRecords: 178 },
];

const mockTrend = [
  { month: "2025-07", providerName: "顺丰国际", achievementRate: 88.5 },
  { month: "2025-07", providerName: "DHL", achievementRate: 85.2 },
  { month: "2025-07", providerName: "中远海运", achievementRate: 68.3 },
  { month: "2025-07", providerName: "UPS", achievementRate: 93.1 },
  { month: "2025-08", providerName: "顺丰国际", achievementRate: 90.1 },
  { month: "2025-08", providerName: "DHL", achievementRate: 87.8 },
  { month: "2025-08", providerName: "中远海运", achievementRate: 70.5 },
  { month: "2025-08", providerName: "UPS", achievementRate: 94.5 },
  { month: "2025-09", providerName: "顺丰国际", achievementRate: 91.2 },
  { month: "2025-09", providerName: "DHL", achievementRate: 86.3 },
  { month: "2025-09", providerName: "中远海运", achievementRate: 71.8 },
  { month: "2025-09", providerName: "UPS", achievementRate: 95.0 },
  { month: "2025-10", providerName: "顺丰国际", achievementRate: 92.3 },
  { month: "2025-10", providerName: "DHL", achievementRate: 88.5 },
  { month: "2025-10", providerName: "中远海运", achievementRate: 72.1 },
  { month: "2025-10", providerName: "UPS", achievementRate: 95.2 },
];

const mockByChannel = [
  { channelName: "UPS", providerName: "顺丰国际", achievementRate: 93.5 },
  { channelName: "UPS", providerName: "UPS", achievementRate: 95.2 },
  { channelName: "空运", providerName: "DHL", achievementRate: 88.5 },
  { channelName: "海运", providerName: "中远海运", achievementRate: 72.1 },
];

const mockDetails = [
  { providerName: "顺丰国际", channelName: "UPS", month: "2025-10", promisedDays: 5, actualDays: 5.2, onTime: 92.3 },
  { providerName: "DHL", channelName: "空运", month: "2025-10", promisedDays: 4, actualDays: 3.8, onTime: 88.5 },
  { providerName: "中远海运", channelName: "海运", month: "2025-10", promisedDays: 25, actualDays: 28.5, onTime: 72.1 },
  { providerName: "UPS", channelName: "UPS", month: "2025-10", promisedDays: 4, actualDays: 4.1, onTime: 95.2 },
  { providerName: "顺丰国际", channelName: "UPS", month: "2025-09", promisedDays: 5, actualDays: 5.5, onTime: 91.2 },
  { providerName: "DHL", channelName: "空运", month: "2025-09", promisedDays: 4, actualDays: 4.0, onTime: 86.3 },
];

const channelOptions = [
  { value: "", label: "全部渠道" },
  { value: "1", label: "UPS" },
  { value: "2", label: "空运" },
  { value: "3", label: "海运" },
];

interface TimelinessData {
  byProvider: typeof mockByProvider;
  trend: typeof mockTrend;
  byChannel: typeof mockByChannel;
  details: typeof mockDetails;
}

export default function TimelinessPage() {
  const [period, setPeriod] = useState("month");
  const [channelId, setChannelId] = useState("");
  const [data, setData] = useState<TimelinessData>({
    byProvider: mockByProvider,
    trend: mockTrend,
    byChannel: mockByChannel,
    details: mockDetails,
  });

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ period });
      if (channelId) params.set("channelId", channelId);
      const res = await fetch(`/api/assessment/timeliness?${params}`);
      const json: TimelinessData = await res.json();
      if (json.byProvider && json.byProvider.length > 0) {
        setData(json);
      }
    } catch {
      // 使用 mock 数据
    }
  }, [period, channelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const overallRate =
    data.byProvider.length > 0
      ? Math.round(
          data.byProvider.reduce((sum, p) => sum + p.achievementRate, 0) /
            data.byProvider.length *
            10
        ) / 10
      : 0;

  const bestProvider = [...data.byProvider].sort(
    (a, b) => b.achievementRate - a.achievementRate
  )[0];
  const worstProvider = [...data.byProvider].sort(
    (a, b) => a.achievementRate - b.achievementRate
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">时效考核</h1>
        <div className="flex flex-wrap gap-3">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelId} onValueChange={(v) => setChannelId(v ?? "")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              整体时效达成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{overallRate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最优服务商
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestProvider?.providerName ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              达成率 {bestProvider?.achievementRate ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最差服务商
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{worstProvider?.providerName ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              达成率 {worstProvider?.achievementRate ?? 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 按服务商汇总表 */}
      <Card>
        <CardHeader>
          <CardTitle>服务商时效达成率</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务商</TableHead>
                <TableHead className="text-right">承诺天数</TableHead>
                <TableHead className="text-right">实际天数</TableHead>
                <TableHead className="text-right">达成率</TableHead>
                <TableHead className="text-right">记录数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byProvider.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.byProvider.map((row) => (
                  <TableRow key={`${row.providerName}-${row.channelId}`}>
                    <TableCell className="font-medium">{row.providerName}</TableCell>
                    <TableCell className="text-right">{row.avgPromisedDays}</TableCell>
                    <TableCell className="text-right">{row.avgActualDays}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          row.achievementRate >= 90
                            ? "text-green-600 dark:text-green-400"
                            : row.achievementRate >= 75
                              ? "text-blue-600 dark:text-blue-400"
                              : row.achievementRate >= 60
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                        }
                      >
                        {row.achievementRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.totalRecords}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 趋势图 */}
      <TrendChart
        data={data.trend}
        valueKey="achievementRate"
        valueLabel="达成率"
        title="时效达成率趋势"
      />

      {/* 渠道×服务商明细 */}
      <Card>
        <CardHeader>
          <CardTitle>渠道×服务商达成率</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务商</TableHead>
                <TableHead>渠道</TableHead>
                <TableHead>月份</TableHead>
                <TableHead className="text-right">承诺天数</TableHead>
                <TableHead className="text-right">实际天数</TableHead>
                <TableHead className="text-right">达成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.details.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.details.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.providerName}</TableCell>
                    <TableCell>{row.channelName}</TableCell>
                    <TableCell>{row.month}</TableCell>
                    <TableCell className="text-right">{row.promisedDays}</TableCell>
                    <TableCell className="text-right">{row.actualDays}</TableCell>
                    <TableCell className="text-right">{row.onTime}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
