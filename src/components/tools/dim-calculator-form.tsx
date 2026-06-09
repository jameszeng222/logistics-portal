"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BoxSpecTable } from "./box-spec-table";
import { DimResult } from "./dim-result";

interface DimRule {
  id: number;
  channelName: string;
  dimDivisor: number;
  isDefault: number;
}

interface CalcResult {
  volumetricWeight: number;
  actualWeight: number;
  chargeableWeight: number;
  dimRatio: number;
  dimApplies: boolean;
}

interface DimCalculatorFormProps {
  onResult?: (result: CalcResult | null) => void;
}

export function DimCalculatorForm({ onResult }: DimCalculatorFormProps) {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [channel, setChannel] = useState("");
  const [customDivisor, setCustomDivisor] = useState("");
  const [dimRules, setDimRules] = useState<DimRule[]>([]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [boxSpecDialogOpen, setBoxSpecDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dim-rules")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDimRules(data);
          const defaultRule = data.find((r: DimRule) => r.isDefault === 1);
          if (defaultRule) {
            setChannel(String(defaultRule.id));
          }
        }
      })
      .catch(() => {
        // 使用 mock 数据
        const mockRules: DimRule[] = [
          { id: 1, channelName: "UPS", dimDivisor: 6000, isDefault: 1 },
          { id: 2, channelName: "DHL", dimDivisor: 5000, isDefault: 0 },
          { id: 3, channelName: "空运", dimDivisor: 6000, isDefault: 0 },
          { id: 4, channelName: "海运", dimDivisor: 1000000, isDefault: 0 },
        ];
        setDimRules(mockRules);
        setChannel("1");
      });
  }, []);

  const getDivisor = useCallback(() => {
    if (channel === "custom") {
      return Number(customDivisor) || 0;
    }
    const rule = dimRules.find((r) => String(r.id) === channel);
    return rule?.dimDivisor || 0;
  }, [channel, customDivisor, dimRules]);

  const calculate = useCallback(() => {
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);
    const aw = Number(actualWeight);
    const divisor = getDivisor();

    if (!l || !w || !h || !aw || !divisor) return;

    const volumetricWeight = (l * w * h) / divisor;
    const chargeableWeight = Math.max(aw, volumetricWeight);
    const dimRatio = volumetricWeight > aw
      ? ((volumetricWeight - aw) / volumetricWeight) * 100
      : 0;
    const dimApplies = volumetricWeight > aw;

    const calcResult: CalcResult = {
      volumetricWeight: Math.round(volumetricWeight * 100) / 100,
      actualWeight: aw,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100,
      dimRatio: Math.round(dimRatio * 100) / 100,
      dimApplies,
    };

    setResult(calcResult);
    onResult?.(calcResult);
  }, [length, width, height, actualWeight, getDivisor, onResult]);

  const handleSelectBoxSpec = (spec: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    grossWeightKg: number;
  }) => {
    setLength(String(spec.lengthCm));
    setWidth(String(spec.widthCm));
    setHeight(String(spec.heightCm));
    setActualWeight(String(spec.grossWeightKg));
    setBoxSpecDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>分泡计算器</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="length">长 (cm)</Label>
              <Input
                id="length"
                type="number"
                placeholder="长度"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">宽 (cm)</Label>
              <Input
                id="width"
                type="number"
                placeholder="宽度"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">高 (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="高度"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">实际重量 (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="重量"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>渠道/除数</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择渠道" />
                </SelectTrigger>
                <SelectContent>
                  {dimRules.map((rule) => (
                    <SelectItem key={rule.id} value={String(rule.id)}>
                      {rule.channelName} ({rule.dimDivisor})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {channel === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-divisor">自定义除数</Label>
                <Input
                  id="custom-divisor"
                  type="number"
                  placeholder="输入除数"
                  value={customDivisor}
                  onChange={(e) => setCustomDivisor(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button onClick={calculate} className="flex-1">
                计算
              </Button>
              <Dialog
                open={boxSpecDialogOpen}
                onOpenChange={setBoxSpecDialogOpen}
              >
                <DialogTrigger render={<Button variant="outline" />}>
                  选择箱规
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>选择箱规</DialogTitle>
                  </DialogHeader>
                  <BoxSpecTable onSelect={handleSelectBoxSpec} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && <DimResult result={result} />}
    </div>
  );
}
