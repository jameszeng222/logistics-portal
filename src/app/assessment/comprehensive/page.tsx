"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeightConfig, type Weights } from "@/components/assessment/weight-config";
import { ScoreTable, type ScoreRow } from "@/components/assessment/score-table";

// Mock 数据
const mockRankings: ScoreRow[] = [
  { providerName: "UPS", channelId: 1, timelinessScore: 47.6, inspectionScore: 28.3, priceScore: 18.5, totalScore: 94.4, grade: "A" },
  { providerName: "顺丰国际", channelId: 1, timelinessScore: 46.2, inspectionScore: 27.4, priceScore: 16.2, totalScore: 89.8, grade: "B" },
  { providerName: "DHL", channelId: 2, timelinessScore: 44.3, inspectionScore: 27.5, priceScore: 14.8, totalScore: 86.6, grade: "B" },
  { providerName: "中远海运", channelId: 3, timelinessScore: 36.1, inspectionScore: 23.3, priceScore: 19.2, totalScore: 78.6, grade: "B" },
];

export default function ComprehensivePage() {
  const [period, setPeriod] = useState("month");
  const [weights, setWeights] = useState<Weights>({ timeliness: 50, inspection: 30, price: 20 });
  const [rankings, setRankings] = useState<ScoreRow[]>(mockRankings);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        period,
        timelinessWeight: String(weights.timeliness),
        inspectionWeight: String(weights.inspection),
        priceWeight: String(weights.price),
      });
      const res = await fetch(`/api/assessment/comprehensive?${params}`);
      const json = (await res.json()) as { rankings?: ScoreRow[] };
      if (json.rankings && json.rankings.length > 0) {
        setRankings(json.rankings);
      }
    } catch {
      // 使用 mock 数据
    }
  }, [period, weights]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">综合考核</h1>
        <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">本月</SelectItem>
            <SelectItem value="quarter">本季度</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* 权重配置 */}
        <WeightConfig weights={weights} onChange={setWeights} />

        {/* 评分排名表 */}
        <ScoreTable data={rankings} />
      </div>
    </div>
  );
}
