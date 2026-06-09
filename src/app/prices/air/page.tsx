"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PriceTable, type Column } from "@/components/prices/price-table";
import { PriceForm, type FieldConfig } from "@/components/prices/price-form";
import { PriceCompare, type CompareGroup } from "@/components/prices/price-compare";
import { PriceTrendChart } from "@/components/prices/price-trend-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Mock data
const MOCK_AIR_PRICES = [
  { id: 1, providerId: 1, providerName: "顺丰航空", originCountry: "中国", originAirport: "SZX", destCountry: "美国", destAirport: "LAX", unitPrice: 28.0, dimDivisor: 6000, minCharge: 150, effectiveDate: "2025-01-01", notes: "" },
  { id: 2, providerId: 2, providerName: "DHL航空", originCountry: "中国", originAirport: "SZX", destCountry: "美国", destAirport: "LAX", unitPrice: 32.0, dimDivisor: 6000, minCharge: 180, effectiveDate: "2025-01-01", notes: "" },
  { id: 3, providerId: 3, providerName: "FedEx航空", originCountry: "中国", originAirport: "SZX", destCountry: "美国", destAirport: "LAX", unitPrice: 30.0, dimDivisor: 5000, minCharge: 160, effectiveDate: "2025-01-15", notes: "" },
  { id: 4, providerId: 1, providerName: "顺丰航空", originCountry: "中国", originAirport: "PVG", destCountry: "英国", destAirport: "LHR", unitPrice: 35.0, dimDivisor: 6000, minCharge: 200, effectiveDate: "2025-01-01", notes: "" },
  { id: 5, providerId: 2, providerName: "DHL航空", originCountry: "中国", originAirport: "PVG", destCountry: "英国", destAirport: "LHR", unitPrice: 38.0, dimDivisor: 6000, minCharge: 220, effectiveDate: "2025-01-01", notes: "" },
  { id: 6, providerId: 3, providerName: "FedEx航空", originCountry: "中国", originAirport: "PVG", destCountry: "英国", destAirport: "LHR", unitPrice: 36.0, dimDivisor: 5000, minCharge: 210, effectiveDate: "2025-02-01", notes: "" },
  { id: 7, providerId: 1, providerName: "顺丰航空", originCountry: "中国", originAirport: "CAN", destCountry: "德国", destAirport: "FRA", unitPrice: 33.0, dimDivisor: 6000, minCharge: 190, effectiveDate: "2025-01-01", notes: "" },
  { id: 8, providerId: 2, providerName: "DHL航空", originCountry: "中国", originAirport: "CAN", destCountry: "德国", destAirport: "FRA", unitPrice: 36.0, dimDivisor: 6000, minCharge: 210, effectiveDate: "2025-02-01", notes: "" },
];

const MOCK_TREND = [
  { date: "2025-01", price: 28.0, label: "顺丰航空" },
  { date: "2025-01", price: 32.0, label: "DHL航空" },
  { date: "2025-01", price: 30.0, label: "FedEx航空" },
  { date: "2025-02", price: 29.0, label: "顺丰航空" },
  { date: "2025-02", price: 31.5, label: "DHL航空" },
  { date: "2025-02", price: 30.5, label: "FedEx航空" },
  { date: "2025-03", price: 28.5, label: "顺丰航空" },
  { date: "2025-03", price: 32.0, label: "DHL航空" },
  { date: "2025-03", price: 29.0, label: "FedEx航空" },
  { date: "2025-04", price: 27.5, label: "顺丰航空" },
  { date: "2025-04", price: 31.0, label: "DHL航空" },
  { date: "2025-04", price: 28.5, label: "FedEx航空" },
];

const columns: Column[] = [
  { key: "providerName", label: "服务商" },
  { key: "originAirport", label: "始发机场", render: (_v, row) => `${row.originCountry} ${row.originAirport}` },
  { key: "destAirport", label: "目的机场", render: (_v, row) => `${row.destCountry} ${row.destAirport}` },
  { key: "unitPrice", label: "单价 (¥/kg)", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "dimDivisor", label: "体积除数" },
  { key: "minCharge", label: "最低收费", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "effectiveDate", label: "生效日期" },
];

const formFields: FieldConfig[] = [
  { key: "providerId", label: "服务商 ID", type: "number", required: true, placeholder: "输入服务商编号" },
  { key: "originCountry", label: "始发国家", type: "text", required: true, placeholder: "如：中国" },
  { key: "originAirport", label: "始发机场代码", type: "text", required: true, placeholder: "如：SZX" },
  { key: "destCountry", label: "目的国家", type: "text", required: true, placeholder: "如：美国" },
  { key: "destAirport", label: "目的机场代码", type: "text", required: true, placeholder: "如：LAX" },
  { key: "unitPrice", label: "单价 (¥/kg)", type: "number", required: true },
  { key: "dimDivisor", label: "体积除数", type: "number", defaultValue: 6000 },
  { key: "minCharge", label: "最低收费", type: "number", defaultValue: 0 },
  { key: "effectiveDate", label: "生效日期", type: "date", required: true },
  { key: "notes", label: "备注", type: "textarea" },
];

export default function AirPricePage() {
  const [prices, setPrices] = useState(MOCK_AIR_PRICES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [compareRoute, setCompareRoute] = useState("SZX→LAX");
  const [trendRoute, setTrendRoute] = useState("SZX→LAX");

  useEffect(() => {
    fetch("/api/prices/air")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as typeof MOCK_AIR_PRICES | undefined;
        if (data && data.length > 0) setPrices(data);
      })
      .catch(() => {});
  }, []);

  const routes = useMemo(() => {
    const routeSet = new Set<string>();
    prices.forEach((p) => {
      routeSet.add(`${p.originAirport}→${p.destAirport}`);
    });
    return [...routeSet];
  }, [prices]);

  const compareData: CompareGroup[] = useMemo(() => {
    const [origin, dest] = compareRoute.split("→");
    const filtered = prices.filter(
      (p) => p.originAirport === origin && p.destAirport === dest
    );
    if (filtered.length === 0) return [];
    return [
      {
        groupKey: compareRoute,
        groupLabel: `${origin} → ${dest}`,
        items: filtered.map((p) => ({
          label: p.providerName || `服务商${p.providerId}`,
          price: p.unitPrice,
        })),
      },
    ];
  }, [prices, compareRoute]);

  const trendData = useMemo(() => {
    return MOCK_TREND;
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/prices/air", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json() as Record<string, unknown>;
        setPrices((prev) => [...prev, result.data as typeof MOCK_AIR_PRICES[0]]);
        setDialogOpen(false);
      }
    } catch {
      setPrices((prev) => [
        ...prev,
        { ...data, id: Date.now(), providerName: `服务商${data.providerId}` } as typeof MOCK_AIR_PRICES[0],
      ]);
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">空运价格管理</h1>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">价格列表</TabsTrigger>
          <TabsTrigger value="compare">价格对比</TabsTrigger>
          <TabsTrigger value="trend">历史趋势</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 size-4" />
              新增价格
            </Button>
          </div>
          <PriceTable columns={columns} data={prices} />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>新增空运价格</DialogTitle>
                <DialogDescription>填写以下信息添加新的空运价格记录</DialogDescription>
              </DialogHeader>
              <PriceForm fields={formFields} onSubmit={handleAdd} submitLabel="添加" />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="compare" className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label>航线</Label>
            <Select value={compareRoute} onValueChange={(v) => v && setCompareRoute(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PriceCompare data={compareData} highlightLowest />
        </TabsContent>

        <TabsContent value="trend" className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label>航线</Label>
            <Select value={trendRoute} onValueChange={(v) => v && setTrendRoute(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PriceTrendChart
            data={trendData}
            title={`${trendRoute} 价格趋势`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
