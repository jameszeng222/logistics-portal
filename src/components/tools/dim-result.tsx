"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalcResult {
  volumetricWeight: number;
  actualWeight: number;
  chargeableWeight: number;
  dimRatio: number;
  dimApplies: boolean;
}

interface DimResultProps {
  result: CalcResult;
}

export function DimResult({ result }: DimResultProps) {
  const { volumetricWeight, actualWeight, chargeableWeight, dimRatio, dimApplies } = result;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">体积重量</p>
            <p className="text-2xl font-semibold">
              {volumetricWeight} <span className="text-sm font-normal text-muted-foreground">kg</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">实际重量</p>
            <p className="text-2xl font-semibold">
              {actualWeight} <span className="text-sm font-normal text-muted-foreground">kg</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">计费重量</p>
            <p className={`text-2xl font-semibold ${dimApplies ? "text-orange-600" : "text-green-600"}`}>
              {chargeableWeight} <span className="text-sm font-normal text-muted-foreground">kg</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">分泡比例</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-semibold ${dimApplies ? "text-orange-600" : "text-green-600"}`}>
                {dimRatio}%
              </p>
              <Badge variant={dimApplies ? "destructive" : "secondary"}>
                {dimApplies ? "分泡" : "不分泡"}
              </Badge>
            </div>
          </div>
        </div>

        {dimApplies && (
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300">
            体积重量 ({volumetricWeight}kg) &gt; 实际重量 ({actualWeight}kg)，
            需按体积重量计费，分泡比例 {dimRatio}%
          </div>
        )}
        {!dimApplies && volumetricWeight > 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            实际重量 ({actualWeight}kg) &ge; 体积重量 ({volumetricWeight}kg)，
            按实际重量计费，无需分泡
          </div>
        )}
      </CardContent>
    </Card>
  );
}
