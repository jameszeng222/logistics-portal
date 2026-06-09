"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
const MOCK_UPS_PRICES = [
  { id: 1, priceType: "agent", agentName: "华运达", destinationRegion: "北美", zone: 1, unitPrice: 45.0, peakSurcharge: 5.0, fuelSurcharge: 3.5, effectiveDate: "2025-01-01", notes: "" },
  { id: 2, priceType: "agent", agentName: "中远达", destinationRegion: "北美", zone: 1, unitPrice: 42.0, peakSurcharge: 4.5, fuelSurcharge: 3.0, effectiveDate: "2025-01-01", notes: "" },
  { id: 3, priceType: "own_account", agentName: "", destinationRegion: "北美", zone: 1, unitPrice: 38.0, peakSurcharge: 0, fuelSurcharge: 3.5, effectiveDate: "2025-02-01", notes: "自有账号" },
  { id: 4, priceType: "agent", agentName: "华运达", destinationRegion: "欧洲", zone: 2, unitPrice: 55.0, peakSurcharge: 6.0, fuelSurcharge: 4.0, effectiveDate: "2025-01-01", notes: "" },
  { id: 5, priceType: "agent", agentName: "中远达", destinationRegion: "欧洲", zone: 2, unitPrice: 52.0, peakSurcharge: 5.5, fuelSurcharge: 3.8, effectiveDate: "2025-01-15", notes: "" },
  { id: 6, priceType: "own_account", agentName: "", destinationRegion: "欧洲", zone: 2, unitPrice: 48.0, peakSurcharge: 0, fuelSurcharge: 4.0, effectiveDate: "2025-02-01", notes: "" },
  { id: 7, priceType: "agent", agentName: "华运达", destinationRegion: "北美", zone: 2, unitPrice: 50.0, peakSurcharge: 5.0, fuelSurcharge: 3.5, effectiveDate: "2025-03-01", notes: "" },
  { id: 8, priceType: "agent", agentName: "中远达", destinationRegion: "北美", zone: 2, unitPrice: 47.0, peakSurcharge: 4.5, fuelSurcharge: 3.0, effectiveDate: "2025-03-01", notes: "" },
];

const MOCK_TREND = [
  { date: "2025-01", price: 45.0, label: "华运达" },
  { date: "2025-01", price: 42.0, label: "中远达" },
  { date: "2025-01", price: 38.0, label: "自有账号" },
  { date: "2025-02", price: 46.0, label: "华运达" },
  { date: "2025-02", price: 43.5, label: "中远达" },
  { date: "2025-02", price: 39.0, label: "自有账号" },
  { date: "2025-03", price: 45.0, label: "华运达" },
  { date: "2025-03", price: 42.0, label: "中远达" },
  { date: "2025-03", price: 38.5, label: "自有账号" },
  { date: "2025-04", price: 44.0, label: "华运达" },
  { date: "2025-04", price: 41.0, label: "中远达" },
  { date: "2025-04", price: 37.5, label: "自有账号" },
];

const columns: Column[] = [
  { key: "priceType", label: "价格类型", render: (v) => (
    <Badge variant={v === "agent" ? "default" : "secondary"} className="rounded-md text-xs font-normal">
      {v === "agent" ? "代理" : "自有账号"}
    </Badge>
  )},
  { key: "agentName", label: "代理名称", render: (v) => (v as string) || "-" },
  { key: "destinationRegion", label: "目的地区" },
  { key: "zone", label: "区域" },
  { key: "unitPrice", label: "单价 (¥/kg)", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "peakSurcharge", label: "旺季附加费", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "fuelSurcharge", label: "燃油附加费", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "effectiveDate", label: "生效日期" },
];

const formFields: FieldConfig[] = [
  { key: "priceType", label: "价格类型", type: "select", required: true, options: [
    { value: "agent", label: "代理" },
    { value: "own_account", label: "自有账号" },
  ]},
  { key: "agentName", label: "代理名称", type: "text", placeholder: "代理账号时填写" },
  { key: "destinationRegion", label: "目的地区", type: "text", required: true, placeholder: "如：北美、欧洲" },
  { key: "zone", label: "区域", type: "number", placeholder: "区域编号" },
  { key: "unitPrice", label: "单价 (¥/kg)", type: "number", required: true },
  { key: "peakSurcharge", label: "旺季附加费", type: "number", defaultValue: 0 },
  { key: "fuelSurcharge", label: "燃油附加费", type: "number", defaultValue: 0 },
  { key: "effectiveDate", label: "生效日期", type: "date", required: true },
  { key: "notes", label: "备注", type: "textarea" },
];

export default function UpsPricePage() {
  const [prices, setPrices] = useState(MOCK_UPS_PRICES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [compareRegion, setCompareRegion] = useState("北美");
  const [compareZone, setCompareZone] = useState("1");
  const [trendRegion, setTrendRegion] = useState("北美");
  const [trendZone, setTrendZone] = useState("1");

  useEffect(() => {
    fetch("/api/prices/ups")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as typeof MOCK_UPS_PRICES | undefined;
        if (data && data.length > 0) setPrices(data);
      })
      .catch(() => {});
  }, []);

  const regions = useMemo(
    () => [...new Set(prices.map((p) => p.destinationRegion))],
    [prices]
  );
  const zones = useMemo(
    () => [...new Set(prices.map((p) => p.zone))].sort((a, b) => a - b),
    [prices]
  );

  const compareData: CompareGroup[] = useMemo(() => {
    const filtered = prices.filter(
      (p) =>
        p.destinationRegion === compareRegion &&
        p.zone === Number(compareZone)
    );
    if (filtered.length === 0) return [];
    return [
      {
        groupKey: `${compareRegion}-Zone${compareZone}`,
        groupLabel: `${compareRegion} - Zone ${compareZone}`,
        items: filtered.map((p) => ({
          label:
            p.priceType === "agent"
              ? p.agentName || "代理"
              : "自有账号",
          price: p.unitPrice,
          extra: {
            旺季附加费: p.peakSurcharge,
            燃油附加费: p.fuelSurcharge,
          },
        })),
      },
    ];
  }, [prices, compareRegion, compareZone]);

  const trendData = useMemo(() => {
    return MOCK_TREND;
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/prices/ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json() as Record<string, unknown>;
        setPrices((prev) => [...prev, result.data as typeof MOCK_UPS_PRICES[0]]);
        setDialogOpen(false);
      }
    } catch {
      // fallback: add locally
      setPrices((prev) => [
        ...prev,
        { ...data, id: Date.now() } as typeof MOCK_UPS_PRICES[0],
      ]);
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight text-stone-800">UPS 价格管理</h1>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="list">价格列表</TabsTrigger>
          <TabsTrigger value="compare">价格对比</TabsTrigger>
          <TabsTrigger value="trend">历史趋势</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="h-9 rounded-lg border-stone-200 bg-white text-stone-600 shadow-sm hover:bg-stone-50 hover:text-stone-800"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-3.5" />
              新增价格
            </Button>
          </div>
          <PriceTable columns={columns} data={prices} />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-light tracking-tight text-stone-800">新增 UPS 价格</DialogTitle>
                <DialogDescription className="text-sm text-stone-400">填写以下信息添加新的 UPS 价格记录</DialogDescription>
              </DialogHeader>
              <PriceForm fields={formFields} onSubmit={handleAdd} submitLabel="添加" />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="compare" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-stone-400">目的地区</Label>
              <Select value={compareRegion} onValueChange={(v) => v && setCompareRegion(v)}>
                <SelectTrigger className="h-9 w-40 rounded-lg border-stone-200 bg-white text-sm text-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-stone-400">区域</Label>
              <Select value={compareZone} onValueChange={(v) => v && setCompareZone(v)}>
                <SelectTrigger className="h-9 w-32 rounded-lg border-stone-200 bg-white text-sm text-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={String(z)}>
                      Zone {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <PriceCompare data={compareData} highlightLowest />
        </TabsContent>

        <TabsContent value="trend" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-stone-400">目的地区</Label>
              <Select value={trendRegion} onValueChange={(v) => v && setTrendRegion(v)}>
                <SelectTrigger className="h-9 w-40 rounded-lg border-stone-200 bg-white text-sm text-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-stone-400">区域</Label>
              <Select value={trendZone} onValueChange={(v) => v && setTrendZone(v)}>
                <SelectTrigger className="h-9 w-32 rounded-lg border-stone-200 bg-white text-sm text-stone-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={String(z)}>
                      Zone {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <PriceTrendChart
            data={trendData}
            title={`${trendRegion} Zone ${trendZone} 价格趋势`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
