"use client";

import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Weights {
  timeliness: number;
  inspection: number;
  price: number;
}

interface WeightConfigProps {
  weights: Weights;
  onChange: (weights: Weights) => void;
}

export function WeightConfig({ weights, onChange }: WeightConfigProps) {
  const total = weights.timeliness + weights.inspection + weights.price;
  const isValid = total === 100;

  const handleTimeliness = (value: number | readonly number[]) => {
    const newVal = Array.isArray(value) ? value[0] : value;
    const remaining = 100 - newVal;
    const inspectionRatio = weights.inspection / (weights.inspection + weights.price || 1);
    onChange({
      timeliness: newVal,
      inspection: Math.round(remaining * inspectionRatio),
      price: remaining - Math.round(remaining * inspectionRatio),
    });
  };

  const handleInspection = (value: number | readonly number[]) => {
    const newVal = Array.isArray(value) ? value[0] : value;
    const remaining = 100 - newVal;
    const timelinessRatio = weights.timeliness / (weights.timeliness + weights.price || 1);
    onChange({
      timeliness: Math.round(remaining * timelinessRatio),
      inspection: newVal,
      price: remaining - Math.round(remaining * timelinessRatio),
    });
  };

  const handlePrice = (value: number | readonly number[]) => {
    const newVal = Array.isArray(value) ? value[0] : value;
    const remaining = 100 - newVal;
    const timelinessRatio = weights.timeliness / (weights.timeliness + weights.inspection || 1);
    onChange({
      timeliness: Math.round(remaining * timelinessRatio),
      inspection: remaining - Math.round(remaining * timelinessRatio),
      price: newVal,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>权重配置</span>
          <span
            className={`text-sm font-normal ${
              isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            合计：{total}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>时效权重</span>
            <span className="font-medium">{weights.timeliness}%</span>
          </div>
          <Slider
            value={[weights.timeliness]}
            onValueChange={handleTimeliness}
            min={0}
            max={100}
            step={5}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>验货权重</span>
            <span className="font-medium">{weights.inspection}%</span>
          </div>
          <Slider
            value={[weights.inspection]}
            onValueChange={handleInspection}
            min={0}
            max={100}
            step={5}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>价格权重</span>
            <span className="font-medium">{weights.price}%</span>
          </div>
          <Slider
            value={[weights.price]}
            onValueChange={handlePrice}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </CardContent>
    </Card>
  );
}
