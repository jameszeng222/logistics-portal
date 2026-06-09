"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DimRule {
  id: number;
  channelName: string;
  dimDivisor: number;
  isDefault: number;
}

interface BatchResult {
  length: number;
  width: number;
  height: number;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  dimRatio: number;
  dimApplies: boolean;
}

export function BatchCalculator() {
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState("");
  const [dimRules, setDimRules] = useState<DimRule[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);

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
    const rule = dimRules.find((r) => String(r.id) === channel);
    return rule?.dimDivisor || 6000;
  }, [channel, dimRules]);

  const calculateAll = useCallback(() => {
    const divisor = getDivisor();
    if (!divisor) return;

    const lines = input
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    const batchResults: BatchResult[] = lines.map((line) => {
      const parts = line.split(/[,\t，]/).map((s) => s.trim());
      const l = Number(parts[0]) || 0;
      const w = Number(parts[1]) || 0;
      const h = Number(parts[2]) || 0;
      const aw = Number(parts[3]) || 0;

      if (!l || !w || !h || !aw) return null;

      const volumetricWeight = (l * w * h) / divisor;
      const chargeableWeight = Math.max(aw, volumetricWeight);
      const dimRatio =
        volumetricWeight > aw
          ? ((volumetricWeight - aw) / volumetricWeight) * 100
          : 0;
      const dimApplies = volumetricWeight > aw;

      return {
        length: l,
        width: w,
        height: h,
        actualWeight: aw,
        volumetricWeight: Math.round(volumetricWeight * 100) / 100,
        chargeableWeight: Math.round(chargeableWeight * 100) / 100,
        dimRatio: Math.round(dimRatio * 100) / 100,
        dimApplies,
      };
    }).filter(Boolean) as BatchResult[];

    setResults(batchResults);
  }, [input, getDivisor]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>批量计算</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>渠道/除数</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v ?? "")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                {dimRules.map((rule) => (
                  <SelectItem key={rule.id} value={String(rule.id)}>
                    {rule.channelName} ({rule.dimDivisor})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              箱据数据（每行一条，格式：长,宽,高,重量）
            </Label>
            <Textarea
              placeholder={"60,40,50,15\n50,40,30,8\n80,60,40,25"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={calculateAll}>批量计算</Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>尺寸 (L×W×H)</TableHead>
                  <TableHead>实际重量</TableHead>
                  <TableHead>体积重量</TableHead>
                  <TableHead>计费重量</TableHead>
                  <TableHead>分泡比例</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {r.length}×{r.width}×{r.height} cm
                    </TableCell>
                    <TableCell>{r.actualWeight} kg</TableCell>
                    <TableCell>{r.volumetricWeight} kg</TableCell>
                    <TableCell
                      className={
                        r.dimApplies ? "font-semibold text-orange-600" : "font-semibold text-green-600"
                      }
                    >
                      {r.chargeableWeight} kg
                    </TableCell>
                    <TableCell
                      className={
                        r.dimApplies ? "text-orange-600" : "text-green-600"
                      }
                    >
                      {r.dimRatio}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.dimApplies ? "destructive" : "secondary"}>
                        {r.dimApplies ? "分泡" : "不分泡"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
