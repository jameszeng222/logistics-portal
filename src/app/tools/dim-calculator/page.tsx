"use client";

import { DimCalculatorForm } from "@/components/tools/dim-calculator-form";
import { BatchCalculator } from "@/components/tools/batch-calculator";
import { DimRulesManager } from "@/components/tools/dim-rules-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DimCalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-tight text-stone-800">分泡计算器</h1>
        <p className="mt-1 text-sm text-stone-400">
          计算体积重量与分泡比例，支持单箱和批量计算
        </p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="single">单箱计算</TabsTrigger>
          <TabsTrigger value="batch">批量计算</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-6">
          <div className="bg-accent/5 rounded-lg p-4">
            <DimCalculatorForm />
          </div>
        </TabsContent>
        <TabsContent value="batch" className="mt-6">
          <div className="bg-accent/5 rounded-lg p-4">
            <BatchCalculator />
          </div>
        </TabsContent>
      </Tabs>

      <DimRulesManager />
    </div>
  );
}
