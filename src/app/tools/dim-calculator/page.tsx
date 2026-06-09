"use client";

import { DimCalculatorForm } from "@/components/tools/dim-calculator-form";
import { BatchCalculator } from "@/components/tools/batch-calculator";
import { DimRulesManager } from "@/components/tools/dim-rules-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DimCalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">分泡计算器</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          计算体积重量与分泡比例，支持单箱和批量计算
        </p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="bg-secondary/60">
          <TabsTrigger value="single">单箱计算</TabsTrigger>
          <TabsTrigger value="batch">批量计算</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-6">
          <div className="bg-secondary/30 rounded-2xl p-5">
            <DimCalculatorForm />
          </div>
        </TabsContent>
        <TabsContent value="batch" className="mt-6">
          <div className="bg-secondary/30 rounded-2xl p-5">
            <BatchCalculator />
          </div>
        </TabsContent>
      </Tabs>

      <DimRulesManager />
    </div>
  );
}
