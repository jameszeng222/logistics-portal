"use client";

import { BoxSpecTable } from "@/components/tools/box-spec-table";

export default function BoxSpecsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">箱规记录</h1>
        <p className="mt-1 text-muted-foreground">
          管理产品箱规尺寸，支持搜索与新增
        </p>
      </div>

      <BoxSpecTable />
    </div>
  );
}
