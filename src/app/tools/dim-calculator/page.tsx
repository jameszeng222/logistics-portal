"use client";

import { DimCalculatorForm } from "@/components/tools/dim-calculator-form";
import { BatchCalculator } from "@/components/tools/batch-calculator";
import { DimRulesManager } from "@/components/tools/dim-rules-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DimCalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">分泡计算器</h1>
        <p className="mt-1 text-muted-foreground">
          计算体积重量与分泡比例，支持单箱和批量计算
        </p>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">单箱计算</TabsTrigger>
          <TabsTrigger value="batch">批量计算</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <DimCalculatorForm />
        </TabsContent>
        <TabsContent value="batch">
          <BatchCalculator />
        </TabsContent>
      </Tabs>

      <DimRulesManager />
    </div>
  );
}
