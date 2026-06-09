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
const MOCK_SEA_PRICES = [
  { id: 1, providerId: 1, providerName: "中远海运", originPort: "深圳盐田", destPort: "洛杉矶", unitPrice: 12.0, minCharge: 500, effectiveDate: "2025-01-01", notes: "" },
  { id: 2, providerId: 2, providerName: "马士基", originPort: "深圳盐田", destPort: "洛杉矶", unitPrice: 13.5, minCharge: 550, effectiveDate: "2025-01-01", notes: "" },
  { id: 3, providerId: 3, providerName: "达飞轮船", originPort: "深圳盐田", destPort: "洛杉矶", unitPrice: 11.5, minCharge: 480, effectiveDate: "2025-01-15", notes: "特价" },
  { id: 4, providerId: 1, providerName: "中远海运", originPort: "上海洋山", destPort: "鹿特丹", unitPrice: 10.5, minCharge: 450, effectiveDate: "2025-01-01", notes: "" },
  { id: 5, providerId: 2, providerName: "马士基", originPort: "上海洋山", destPort: "鹿特丹", unitPrice: 12.0, minCharge: 500, effectiveDate: "2025-01-01", notes: "" },
  { id: 6, providerId: 3, providerName: "达飞轮船", originPort: "上海洋山", destPort: "鹿特丹", unitPrice: 11.0, minCharge: 460, effectiveDate: "2025-02-01", notes: "" },
  { id: 7, providerId: 1, providerName: "中远海运", originPort: "宁波舟山", destPort: "费利克斯托", unitPrice: 11.0, minCharge: 470, effectiveDate: "2025-01-01", notes: "" },
  { id: 8, providerId: 2, providerName: "马士基", originPort: "宁波舟山", destPort: "费利克斯托", unitPrice: 12.5, minCharge: 520, effectiveDate: "2025-02-01", notes: "" },
];

const MOCK_TREND = [
  { date: "2025-01", price: 12.0, label: "中远海运" },
  { date: "2025-01", price: 13.5, label: "马士基" },
  { date: "2025-01", price: 11.5, label: "达飞轮船" },
  { date: "2025-02", price: 12.5, label: "中远海运" },
  { date: "2025-02", price: 13.0, label: "马士基" },
  { date: "2025-02", price: 12.0, label: "达飞轮船" },
  { date: "2025-03", price: 11.5, label: "中远海运" },
  { date: "2025-03", price: 13.5, label: "马士基" },
  { date: "2025-03", price: 11.0, label: "达飞轮船" },
  { date: "2025-04", price: 11.0, label: "中远海运" },
  { date: "2025-04", price: 13.0, label: "马士基" },
  { date: "2025-04", price: 10.5, label: "达飞轮船" },
];

const columns: Column[] = [
  { key: "providerName", label: "服务商" },
  { key: "originPort", label: "始发港" },
  { key: "destPort", label: "目的港" },
  { key: "unitPrice", label: "单价 (¥/CBM)", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "minCharge", label: "最低收费", render: (v) => `¥${Number(v).toFixed(2)}` },
  { key: "effectiveDate", label: "生效日期" },
  { key: "notes", label: "备注", render: (v) => (v as string) || "-" },
];

const formFields: FieldConfig[] = [
  { key: "providerId", label: "服务商 ID", type: "number", required: true, placeholder: "输入服务商编号" },
  { key: "originPort", label: "始发港", type: "text", required: true, placeholder: "如：深圳盐田" },
  { key: "destPort", label: "目的港", type: "text", required: true, placeholder: "如：洛杉矶" },
  { key: "unitPrice", label: "单价 (¥/CBM)", type: "number", required: true },
  { key: "minCharge", label: "最低收费", type: "number", defaultValue: 0 },
  { key: "effectiveDate", label: "生效日期", type: "date", required: true },
  { key: "notes", label: "备注", type: "textarea" },
];

export default function SeaPricePage() {
  const [prices, setPrices] = useState(MOCK_SEA_PRICES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comparePortPair, setComparePortPair] = useState("深圳盐田→洛杉矶");
  const [trendPortPair, setTrendPortPair] = useState("深圳盐田→洛杉矶");

  useEffect(() => {
    fetch("/api/prices/sea")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as typeof MOCK_SEA_PRICES | undefined;
        if (data && data.length > 0) setPrices(data);
      })
      .catch(() => {});
  }, []);

  const portPairs = useMemo(() => {
    const pairSet = new Set<string>();
    prices.forEach((p) => {
      pairSet.add(`${p.originPort}→${p.destPort}`);
    });
    return [...pairSet];
  }, [prices]);

  const compareData: CompareGroup[] = useMemo(() => {
    const [origin, dest] = comparePortPair.split("→");
    const filtered = prices.filter(
      (p) => p.originPort === origin && p.destPort === dest
    );
    if (filtered.length === 0) return [];
    return [
      {
        groupKey: comparePortPair,
        groupLabel: `${origin} → ${dest}`,
        items: filtered.map((p) => ({
          label: p.providerName || `服务商${p.providerId}`,
          price: p.unitPrice,
        })),
      },
    ];
  }, [prices, comparePortPair]);

  const trendData = useMemo(() => {
    return MOCK_TREND;
  }, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/prices/sea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json() as Record<string, unknown>;
        setPrices((prev) => [...prev, result.data as typeof MOCK_SEA_PRICES[0]]);
        setDialogOpen(false);
      }
    } catch {
      setPrices((prev) => [
        ...prev,
        { ...data, id: Date.now(), providerName: `服务商${data.providerId}` } as typeof MOCK_SEA_PRICES[0],
      ]);
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">海运价格管理</h1>
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
                <DialogTitle>新增海运价格</DialogTitle>
                <DialogDescription>填写以下信息添加新的海运价格记录</DialogDescription>
              </DialogHeader>
              <PriceForm fields={formFields} onSubmit={handleAdd} submitLabel="添加" />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="compare" className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label>港口对</Label>
            <Select value={comparePortPair} onValueChange={(v) => v && setComparePortPair(v)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {portPairs.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PriceCompare data={compareData} highlightLowest />
        </TabsContent>

        <TabsContent value="trend" className="mt-4 space-y-4">
          <div className="grid gap-1.5">
            <Label>港口对</Label>
            <Select value={trendPortPair} onValueChange={(v) => v && setTrendPortPair(v)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {portPairs.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PriceTrendChart
            data={trendData}
            title={`${trendPortPair} 价格趋势`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
