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
  { providerName: "顺丰国际", inspectionRate: 15.2, totalRecords: 156, inspectedCount: 24 },
  { providerName: "DHL", inspectionRate: 8.5, totalRecords: 203, inspectedCount: 17 },
  { providerName: "中远海运", inspectionRate: 22.3, totalRecords: 89, inspectedCount: 20 },
  { providerName: "UPS", inspectionRate: 5.6, totalRecords: 178, inspectedCount: 10 },
];

const mockTrend = [
  { month: "2025-07", providerName: "顺丰国际", inspectionRate: 18.5 },
  { month: "2025-07", providerName: "DHL", inspectionRate: 10.2 },
  { month: "2025-07", providerName: "中远海运", inspectionRate: 25.3 },
  { month: "2025-07", providerName: "UPS", inspectionRate: 7.1 },
  { month: "2025-08", providerName: "顺丰国际", inspectionRate: 16.8 },
  { month: "2025-08", providerName: "DHL", inspectionRate: 9.5 },
  { month: "2025-08", providerName: "中远海运", inspectionRate: 23.1 },
  { month: "2025-08", providerName: "UPS", inspectionRate: 6.3 },
  { month: "2025-09", providerName: "顺丰国际", inspectionRate: 15.9 },
  { month: "2025-09", providerName: "DHL", inspectionRate: 8.8 },
  { month: "2025-09", providerName: "中远海运", inspectionRate: 22.8 },
  { month: "2025-09", providerName: "UPS", inspectionRate: 5.9 },
  { month: "2025-10", providerName: "顺丰国际", inspectionRate: 15.2 },
  { month: "2025-10", providerName: "DHL", inspectionRate: 8.5 },
  { month: "2025-10", providerName: "中远海运", inspectionRate: 22.3 },
  { month: "2025-10", providerName: "UPS", inspectionRate: 5.6 },
];

const mockByChannel = [
  { channelName: "UPS", inspectionRate: 8.2 },
  { channelName: "空运", inspectionRate: 12.5 },
  { channelName: "海运", inspectionRate: 22.3 },
];

const mockDetails = [
  { providerName: "顺丰国际", channelName: "UPS", month: "2025-10", inspected: 24, total: 156 },
  { providerName: "DHL", channelName: "空运", month: "2025-10", inspected: 17, total: 203 },
  { providerName: "中远海运", channelName: "海运", month: "2025-10", inspected: 20, total: 89 },
  { providerName: "UPS", channelName: "UPS", month: "2025-10", inspected: 10, total: 178 },
  { providerName: "顺丰国际", channelName: "UPS", month: "2025-09", inspected: 22, total: 148 },
  { providerName: "DHL", channelName: "空运", month: "2025-09", inspected: 19, total: 195 },
];

const channelOptions = [
  { value: "", label: "全部渠道" },
  { value: "1", label: "UPS" },
  { value: "2", label: "空运" },
  { value: "3", label: "海运" },
];

interface InspectionData {
  byProvider: typeof mockByProvider;
  trend: typeof mockTrend;
  byChannel: typeof mockByChannel;
  details: typeof mockDetails;
}

export default function InspectionPage() {
  const [period, setPeriod] = useState("month");
  const [channelId, setChannelId] = useState("");
  const [data, setData] = useState<InspectionData>({
    byProvider: mockByProvider,
    trend: mockTrend,
    byChannel: mockByChannel,
    details: mockDetails,
  });

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ period });
      if (channelId) params.set("channelId", channelId);
      const res = await fetch(`/api/assessment/inspection?${params}`);
      const json = (await res.json()) as InspectionData;
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
          data.byProvider.reduce((sum, p) => sum + p.inspectionRate, 0) /
            data.byProvider.length *
            10
        ) / 10
      : 0;

  const highestProvider = [...data.byProvider].sort(
    (a, b) => b.inspectionRate - a.inspectionRate
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">验货考核</h1>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              整体验货率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{overallRate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              验货率最高服务商
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestProvider?.providerName ?? "-"}</div>
            <p className="text-xs text-muted-foreground">
              验货率 {highestProvider?.inspectionRate ?? 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 按服务商汇总表 */}
      <Card>
        <CardHeader>
          <CardTitle>服务商验货率</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务商</TableHead>
                <TableHead className="text-right">验货率</TableHead>
                <TableHead className="text-right">验货数</TableHead>
                <TableHead className="text-right">总记录数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byProvider.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.byProvider.map((row) => (
                  <TableRow key={row.providerName}>
                    <TableCell className="font-medium">{row.providerName}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          row.inspectionRate <= 10
                            ? "text-green-600 dark:text-green-400"
                            : row.inspectionRate <= 20
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }
                      >
                        {row.inspectionRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.inspectedCount}</TableCell>
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
        valueKey="inspectionRate"
        valueLabel="验货率"
        title="验货率趋势"
      />

      {/* 渠道汇总 */}
      <Card>
        <CardHeader>
          <CardTitle>渠道验货率</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>渠道</TableHead>
                <TableHead className="text-right">验货率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byChannel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.byChannel.map((row) => (
                  <TableRow key={row.channelName}>
                    <TableCell className="font-medium">{row.channelName}</TableCell>
                    <TableCell className="text-right">{row.inspectionRate}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 明细表 */}
      <Card>
        <CardHeader>
          <CardTitle>验货明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务商</TableHead>
                <TableHead>渠道</TableHead>
                <TableHead>月份</TableHead>
                <TableHead className="text-right">验货数</TableHead>
                <TableHead className="text-right">总记录数</TableHead>
                <TableHead className="text-right">验货率</TableHead>
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
                    <TableCell className="text-right">{row.inspected}</TableCell>
                    <TableCell className="text-right">{row.total}</TableCell>
                    <TableCell className="text-right">
                      {row.total > 0
                        ? (Math.round((row.inspected / row.total) * 1000) / 10)
                        : 0}%
                    </TableCell>
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
