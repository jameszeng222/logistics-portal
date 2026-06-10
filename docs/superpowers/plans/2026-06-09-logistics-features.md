# 发货记录台账 + 单据生成器 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为物流部内部工具站新增发货记录台账（手动录入 + Excel 导入 + 统计汇总）和单据生成器（装箱单 + 商业发票 + 报关草单 + 货代自定义模板）。

**Architecture:** 延续现有 Next.js + Drizzle ORM + D1 + Cloudflare Pages 架构。发货记录新增 `shipments` 表；单据生成器新增 `document_templates` 和 `documents` 表。PDF 生成使用 `@react-pdf/renderer`（兼容 Cloudflare Workers 运行时）。Excel 解析使用 `xlsx` 库在浏览器端完成。

**Tech Stack:** Next.js 16, Drizzle ORM, D1, Tailwind, shadcn/ui, @react-pdf/renderer, xlsx (SheetJS)

---

## File Structure

### 新增文件

```
src/lib/db/schema.ts                          -- 追加 shipments, document_templates, documents 表定义
src/app/shipments/page.tsx                    -- 发货记录列表页
src/app/shipments/new/page.tsx                -- 手动新增发货记录页
src/app/shipments/[id]/page.tsx               -- 记录详情/编辑页
src/app/shipments/import/page.tsx             -- Excel 批量导入页
src/app/shipments/stats/page.tsx              -- 统计汇总页
src/app/api/shipments/route.ts                -- GET 列表 / POST 新增
src/app/api/shipments/[id]/route.ts           -- GET / PUT / DELETE 单条记录
src/app/api/shipments/import/route.ts         -- POST Excel 导入
src/app/api/shipments/stats/route.ts          -- GET 统计数据
src/components/shipments/shipment-table.tsx   -- 发货记录表格组件
src/components/shipments/shipment-form.tsx    -- 发货记录表单组件
src/components/shipments/shipment-filters.tsx -- 筛选组件
src/components/shipments/import-dropzone.tsx  -- Excel 上传拖拽区组件
src/components/shipments/import-preview.tsx   -- 导入预览表格组件
src/app/documents/page.tsx                    -- 单据列表页
src/app/documents/generate/page.tsx           -- 单据生成页
src/app/documents/templates/page.tsx          -- 模板管理页
src/app/api/documents/route.ts                -- GET 列表 / POST 生成
src/app/api/documents/templates/route.ts      -- GET / POST 模板
src/app/api/documents/templates/[id]/route.ts -- PUT / DELETE 模板
src/components/documents/packing-list-pdf.tsx -- 装箱单 PDF 模板
src/components/documents/commercial-invoice-pdf.tsx -- 商业发票 PDF 模板
src/components/documents/customs-declaration-pdf.tsx -- 报关草单 PDF 模板
src/components/documents/forwarder-invoice-pdf.tsx -- 货代发票 PDF 模板
src/components/documents/template-editor.tsx  -- 模板编辑器组件
```

### 修改文件

```
src/components/layout/sidebar.tsx             -- 新增发货记录和单据生成导航项
src/components/layout/header.tsx              -- 新增路由映射
```

---

## Task 1: 数据库 Schema 扩展

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: 在 schema.ts 末尾追加 shipments 表定义**

在文件末尾（`memberReportTemplates` 表之后）追加：

```typescript
// 发货记录台账
export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shipmentDate: text("shipment_date").notNull(),
  brand: text("brand").notNull(),           // LM / LM-TT / FD / FD-TT
  channel: text("channel").notNull(),       // UPS / 空运 / 海运
  provider: text("provider").notNull(),
  destination: text("destination").notNull(),
  trackingNo: text("tracking_no"),
  pieces: integer("pieces").notNull(),
  actualWeight: real("actual_weight"),
  volWeight: real("vol_weight"),
  chargeWeight: real("charge_weight"),
  freightCost: real("freight_cost"),
  extraCost: real("extra_cost").default(0),
  totalCost: real("total_cost"),
  currency: text("currency").default("CNY"),
  remark: text("remark"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (table) => [
  index("idx_shipment_date").on(table.shipmentDate),
  index("idx_shipment_brand").on(table.brand),
  index("idx_shipment_channel").on(table.channel),
  index("idx_shipment_provider").on(table.provider),
]);

// 单据模板
export const documentTemplates = sqliteTable("document_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),  // packing_list / commercial_invoice / customs / forwarder_invoice
  fields: text("fields").notNull(),  // JSON: 字段定义
  layout: text("layout"),            // JSON: 布局配置（货代自定义模板用）
  isDefault: integer("is_default").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 生成的单据
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  templateId: integer("template_id").references(() => documentTemplates.id),
  type: text("type").notNull(),
  data: text("data").notNull(),       // JSON: 填写的数据
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
```

- [ ] **Step 2: 运行 Drizzle 迁移生成**

Run: `cd /workspace/logistics-portal && npx drizzle-kit generate`
Expected: 生成新的迁移 SQL 文件

- [ ] **Step 3: 提交**

```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add shipments and documents schema"
```

---

## Task 2: 侧边栏导航更新

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/header.tsx`

- [ ] **Step 1: 更新 sidebar.tsx 导航项**

在 `navItems` 数组中，在"价格管理"和"工具箱"之间插入"发货记录"分组，在"工具箱"下新增"单据生成"和"模板管理"子项。

将 `navItems` 改为：

```typescript
const navItems: NavItem[] = [
  {
    label: "价格管理",
    icon: <DollarSign className="size-4" />,
    children: [
      { label: "UPS价格", href: "/prices/ups", icon: <Truck className="size-4" /> },
      { label: "空运价格", href: "/prices/air", icon: <Plane className="size-4" /> },
      { label: "海运价格", href: "/prices/sea", icon: <Ship className="size-4" /> },
    ],
  },
  {
    label: "发货记录",
    icon: <Package className="size-4" />,
    children: [
      { label: "发货台账", href: "/shipments", icon: <List className="size-4" /> },
      { label: "批量导入", href: "/shipments/import", icon: <Upload className="size-4" /> },
      { label: "统计汇总", href: "/shipments/stats", icon: <BarChart3 className="size-4" /> },
    ],
  },
  {
    label: "工具箱",
    icon: <Wrench className="size-4" />,
    children: [
      { label: "体积计算器", href: "/tools/dim-calculator", icon: <Ruler className="size-4" /> },
      { label: "箱规查询", href: "/tools/box-specs", icon: <Box className="size-4" /> },
      { label: "单据生成", href: "/documents/generate", icon: <FileText className="size-4" /> },
      { label: "模板管理", href: "/documents/templates", icon: <LayoutTemplate className="size-4" /> },
    ],
  },
  {
    label: "供应商考核",
    icon: <ClipboardCheck className="size-4" />,
    children: [
      { label: "时效考核", href: "/assessment/timeliness", icon: <Clock className="size-4" /> },
      { label: "验货考核", href: "/assessment/inspection", icon: <ShieldCheck className="size-4" /> },
      { label: "综合考核", href: "/assessment/comprehensive", icon: <BarChart3 className="size-4" /> },
      { label: "服务商列表", href: "/providers", icon: <Users className="size-4" /> },
    ],
  },
]
```

同时在 import 中添加新的图标：

```typescript
import {
  DollarSign,
  Wrench,
  ClipboardCheck,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plane,
  Ship,
  Truck,
  Ruler,
  Box,
  Clock,
  ShieldCheck,
  BarChart3,
  List,
  Upload,
  FileText,
  LayoutTemplate,
} from "lucide-react"
```

在 `expandedGroups` 初始状态中添加 `"发货记录": true`。

- [ ] **Step 2: 更新 header.tsx 路由映射**

在 `routeMap` 中添加：

```typescript
"shipments": "发货记录",
"import": "批量导入",
"stats": "统计汇总",
"documents": "单据",
"generate": "单据生成",
"templates": "模板管理",
```

- [ ] **Step 3: 提交**

```bash
git add src/components/layout/sidebar.tsx src/components/layout/header.tsx
git commit -m "feat: add shipments and documents navigation items"
```

---

## Task 3: 发货记录 API

**Files:**
- Create: `src/app/api/shipments/route.ts`
- Create: `src/app/api/shipments/[id]/route.ts`
- Create: `src/app/api/shipments/stats/route.ts`

- [ ] **Step 1: 创建 shipments 列表/新增 API**

创建 `src/app/api/shipments/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const brand = searchParams.get("brand");
    const channel = searchParams.get("channel");
    const provider = searchParams.get("provider");
    const destination = searchParams.get("destination");
    const trackingNo = searchParams.get("tracking_no");
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("page_size") || "20");

    const conditions = [];
    if (startDate) conditions.push(gte(shipments.shipmentDate, startDate));
    if (endDate) conditions.push(lte(shipments.shipmentDate, endDate));
    if (brand) conditions.push(eq(shipments.brand, brand));
    if (channel) conditions.push(eq(shipments.channel, channel));
    if (provider) conditions.push(eq(shipments.provider, provider));
    if (destination) conditions.push(eq(shipments.destination, destination));
    if (trackingNo) conditions.push(like(shipments.trackingNo, `%${trackingNo}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.select().from(shipments).where(where)
        .orderBy(sql`${shipments.shipmentDate} DESC`)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ count: sql<number>`count(*)` }).from(shipments).where(where),
    ]);

    return NextResponse.json({
      data,
      total: countResult[0].count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("获取发货记录失败:", error);
    return NextResponse.json({ error: "获取发货记录失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = await request.json();

    if (!body.shipmentDate || !body.brand || !body.channel || !body.provider || !body.destination || !body.pieces) {
      return NextResponse.json(
        { error: "缺少必填字段: shipmentDate, brand, channel, provider, destination, pieces" },
        { status: 400 }
      );
    }

    const result = await db.insert(shipments).values({
      shipmentDate: body.shipmentDate,
      brand: body.brand,
      channel: body.channel,
      provider: body.provider,
      destination: body.destination,
      trackingNo: body.trackingNo ?? null,
      pieces: body.pieces,
      actualWeight: body.actualWeight ?? null,
      volWeight: body.volWeight ?? null,
      chargeWeight: body.chargeWeight ?? null,
      freightCost: body.freightCost ?? null,
      extraCost: body.extraCost ?? 0,
      totalCost: body.totalCost ?? null,
      currency: body.currency ?? "CNY",
      remark: body.remark ?? null,
    }).returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建发货记录失败:", error);
    return NextResponse.json({ error: "创建发货记录失败" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 创建单条记录 API**

创建 `src/app/api/shipments/[id]/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const result = await db.select().from(shipments).where(eq(shipments.id, Number(id)));
    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("获取发货记录失败:", error);
    return NextResponse.json({ error: "获取发货记录失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(shipments)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(shipments.id, Number(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("更新发货记录失败:", error);
    return NextResponse.json({ error: "更新发货记录失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const result = await db.delete(shipments).where(eq(shipments.id, Number(id))).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("删除发货记录失败:", error);
    return NextResponse.json({ error: "删除发货记录失败" }, { status: 500 });
  }
}
```

- [ ] **Step 3: 创建统计 API**

创建 `src/app/api/shipments/stats/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const brand = searchParams.get("brand");
    const channel = searchParams.get("channel");

    const conditions = [];
    if (startDate) conditions.push(gte(shipments.shipmentDate, startDate));
    if (endDate) conditions.push(lte(shipments.shipmentDate, endDate));
    if (brand) conditions.push(eq(shipments.brand, brand));
    if (channel) conditions.push(eq(shipments.channel, channel));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // 按月汇总
    const monthlyStats = await db
      .select({
        month: sql<string>`substr(${shipments.shipmentDate}, 1, 7)`,
        totalPieces: sql<number>`sum(${shipments.pieces})`,
        totalWeight: sql<number>`sum(${shipments.actualWeight})`,
        totalCost: sql<number>`sum(${shipments.totalCost})`,
        count: sql<number>`count(*)`,
      })
      .from(shipments)
      .where(where)
      .groupBy(sql`substr(${shipments.shipmentDate}, 1, 7)`)
      .orderBy(sql`substr(${shipments.shipmentDate}, 1, 7) DESC`);

    // 按品牌汇总
    const brandStats = await db
      .select({
        brand: shipments.brand,
        totalPieces: sql<number>`sum(${shipments.pieces})`,
        totalCost: sql<number>`sum(${shipments.totalCost})`,
        count: sql<number>`count(*)`,
      })
      .from(shipments)
      .where(where)
      .groupBy(shipments.brand);

    // 按渠道汇总
    const channelStats = await db
      .select({
        channel: shipments.channel,
        totalPieces: sql<number>`sum(${shipments.pieces})`,
        totalCost: sql<number>`sum(${shipments.totalCost})`,
        count: sql<number>`count(*)`,
      })
      .from(shipments)
      .where(where)
      .groupBy(shipments.channel);

    return NextResponse.json({
      data: { monthly: monthlyStats, byBrand: brandStats, byChannel: channelStats },
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/app/api/shipments/
git commit -m "feat: add shipments API routes (CRUD + stats)"
```

---

## Task 4: 发货记录前端组件

**Files:**
- Create: `src/components/shipments/shipment-table.tsx`
- Create: `src/components/shipments/shipment-form.tsx`
- Create: `src/components/shipments/shipment-filters.tsx`

- [ ] **Step 1: 创建筛选组件**

创建 `src/components/shipments/shipment-filters.tsx`：

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShipmentFiltersProps {
  startDate: string
  endDate: string
  brand: string
  channel: string
  provider: string
  trackingNo: string
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onBrandChange: (v: string) => void
  onChannelChange: (v: string) => void
  onProviderChange: (v: string) => void
  onTrackingNoChange: (v: string) => void
  onSearch: () => void
  onReset: () => void
}

const BRANDS = ["LM", "LM-TT", "FD", "FD-TT"]
const CHANNELS = ["UPS", "空运", "海运"]

export function ShipmentFilters({
  startDate, endDate, brand, channel, provider, trackingNo,
  onStartDateChange, onEndDateChange, onBrandChange, onChannelChange,
  onProviderChange, onTrackingNoChange, onSearch, onReset,
}: ShipmentFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">开始日期</label>
        <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="w-36" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">结束日期</label>
        <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="w-36" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">品牌</label>
        <select value={brand} onChange={(e) => onBrandChange(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
          <option value="">全部</option>
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">渠道</label>
        <select value={channel} onChange={(e) => onChannelChange(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
          <option value="">全部</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">服务商</label>
        <Input value={provider} onChange={(e) => onProviderChange(e.target.value)} placeholder="服务商名" className="w-28" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">追踪号</label>
        <Input value={trackingNo} onChange={(e) => onTrackingNoChange(e.target.value)} placeholder="追踪号" className="w-32" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSearch}>查询</Button>
        <Button size="sm" variant="outline" onClick={onReset}>重置</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建表格组件**

创建 `src/components/shipments/shipment-table.tsx`：

```typescript
"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Shipment {
  id: number
  shipmentDate: string
  brand: string
  channel: string
  provider: string
  destination: string
  trackingNo: string | null
  pieces: number
  actualWeight: number | null
  volWeight: number | null
  chargeWeight: number | null
  freightCost: number | null
  extraCost: number | null
  totalCost: number | null
  currency: string | null
  remark: string | null
}

interface ShipmentTableProps {
  data: Shipment[]
  onDelete: (id: number) => void
}

export function ShipmentTable({ data, onDelete }: ShipmentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日期</TableHead>
          <TableHead>品牌</TableHead>
          <TableHead>渠道</TableHead>
          <TableHead>服务商</TableHead>
          <TableHead>目的地</TableHead>
          <TableHead>追踪号</TableHead>
          <TableHead className="text-right">件数</TableHead>
          <TableHead className="text-right">实重(kg)</TableHead>
          <TableHead className="text-right">计费重(kg)</TableHead>
          <TableHead className="text-right">运费</TableHead>
          <TableHead>备注</TableHead>
          <TableHead className="w-20">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
              暂无发货记录
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.shipmentDate}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.channel}</TableCell>
              <TableCell>{item.provider}</TableCell>
              <TableCell>{item.destination}</TableCell>
              <TableCell>{item.trackingNo || "-"}</TableCell>
              <TableCell className="text-right">{item.pieces}</TableCell>
              <TableCell className="text-right">{item.actualWeight ?? "-"}</TableCell>
              <TableCell className="text-right">{item.chargeWeight ?? "-"}</TableCell>
              <TableCell className="text-right">
                {item.totalCost != null ? `${item.currency === "USD" ? "$" : "¥"}${item.totalCost.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="max-w-[120px] truncate">{item.remark || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/shipments/${item.id}`}>
                    <Button variant="ghost" size="icon-xs"><Pencil className="size-3" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete(item.id)}>
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: 创建表单组件**

创建 `src/components/shipments/shipment-form.tsx`：

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShipmentFormProps {
  initialData?: Record<string, unknown>
  mode: "create" | "edit"
}

const BRANDS = ["LM", "LM-TT", "FD", "FD-TT"]
const CHANNELS = ["UPS", "空运", "海运"]

export function ShipmentForm({ initialData, mode }: ShipmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    shipmentDate: (initialData?.shipmentDate as string) || "",
    brand: (initialData?.brand as string) || "",
    channel: (initialData?.channel as string) || "",
    provider: (initialData?.provider as string) || "",
    destination: (initialData?.destination as string) || "",
    trackingNo: (initialData?.trackingNo as string) || "",
    pieces: (initialData?.pieces as number) || 0,
    actualWeight: (initialData?.actualWeight as number) || 0,
    volWeight: (initialData?.volWeight as number) || 0,
    chargeWeight: (initialData?.chargeWeight as number) || 0,
    freightCost: (initialData?.freightCost as number) || 0,
    extraCost: (initialData?.extraCost as number) || 0,
    totalCost: (initialData?.totalCost as number) || 0,
    currency: (initialData?.currency as string) || "CNY",
    remark: (initialData?.remark as string) || "",
  })

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === "create" ? "/api/shipments" : `/api/shipments/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) {
        router.push("/shipments")
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.error || "操作失败")
      }
    } catch {
      alert("网络错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">发货日期 *</label>
          <Input type="date" value={form.shipmentDate} onChange={(e) => updateField("shipmentDate", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">品牌 *</label>
          <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)} required className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="">选择品牌</option>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">渠道 *</label>
          <select value={form.channel} onChange={(e) => updateField("channel", e.target.value)} required className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="">选择渠道</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">服务商 *</label>
          <Input value={form.provider} onChange={(e) => updateField("provider", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">目的地 *</label>
          <Input value={form.destination} onChange={(e) => updateField("destination", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">追踪号</label>
          <Input value={form.trackingNo} onChange={(e) => updateField("trackingNo", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">件数 *</label>
          <Input type="number" value={form.pieces || ""} onChange={(e) => updateField("pieces", Number(e.target.value))} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">实重 (kg)</label>
          <Input type="number" step="0.1" value={form.actualWeight || ""} onChange={(e) => updateField("actualWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">体积重 (kg)</label>
          <Input type="number" step="0.1" value={form.volWeight || ""} onChange={(e) => updateField("volWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">计费重量 (kg)</label>
          <Input type="number" step="0.1" value={form.chargeWeight || ""} onChange={(e) => updateField("chargeWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">运费</label>
          <Input type="number" step="0.01" value={form.freightCost || ""} onChange={(e) => updateField("freightCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">附加费</label>
          <Input type="number" step="0.01" value={form.extraCost || ""} onChange={(e) => updateField("extraCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">总费用</label>
          <Input type="number" step="0.01" value={form.totalCost || ""} onChange={(e) => updateField("totalCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">币种</label>
          <select value={form.currency} onChange={(e) => updateField("currency", e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className="text-[11px] text-muted-foreground">备注</label>
          <Input value={form.remark} onChange={(e) => updateField("remark", e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "提交中..." : mode === "create" ? "新增" : "保存"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/shipments/
git commit -m "feat: add shipment table, form, and filters components"
```

---

## Task 5: 发货记录页面

**Files:**
- Create: `src/app/shipments/page.tsx`
- Create: `src/app/shipments/new/page.tsx`
- Create: `src/app/shipments/[id]/page.tsx`
- Create: `src/app/shipments/stats/page.tsx`

- [ ] **Step 1: 创建发货台账列表页**

创建 `src/app/shipments/page.tsx`：

```typescript
"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ShipmentTable } from "@/components/shipments/shipment-table"
import { ShipmentFilters } from "@/components/shipments/shipment-filters"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function ShipmentsPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    startDate: "", endDate: "", brand: "", channel: "", provider: "", trackingNo: "",
  })

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("page_size", "20")
    if (filters.startDate) params.set("start_date", filters.startDate)
    if (filters.endDate) params.set("end_date", filters.endDate)
    if (filters.brand) params.set("brand", filters.brand)
    if (filters.channel) params.set("channel", filters.channel)
    if (filters.provider) params.set("provider", filters.provider)
    if (filters.trackingNo) params.set("tracking_no", filters.trackingNo)

    const res = await fetch(`/api/shipments?${params}`)
    const json = await res.json()
    setData(json.data || [])
    setTotal(json.total || 0)
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此记录？")) return
    await fetch(`/api/shipments/${id}`, { method: "DELETE" })
    fetchData()
  }

  const resetFilters = () => {
    setFilters({ startDate: "", endDate: "", brand: "", channel: "", provider: "", trackingNo: "" })
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">发货台账</h1>
        <div className="flex gap-2">
          <Link href="/shipments/import">
            <Button variant="outline" size="sm"><Upload className="size-4 mr-1" />批量导入</Button>
          </Link>
          <Link href="/shipments/new">
            <Button size="sm"><Plus className="size-4 mr-1" />新增记录</Button>
          </Link>
        </div>
      </div>

      <ShipmentFilters
        startDate={filters.startDate} endDate={filters.endDate}
        brand={filters.brand} channel={filters.channel}
        provider={filters.provider} trackingNo={filters.trackingNo}
        onStartDateChange={(v) => setFilters((p) => ({ ...p, startDate: v }))}
        onEndDateChange={(v) => setFilters((p) => ({ ...p, endDate: v }))}
        onBrandChange={(v) => setFilters((p) => ({ ...p, brand: v }))}
        onChannelChange={(v) => setFilters((p) => ({ ...p, channel: v }))}
        onProviderChange={(v) => setFilters((p) => ({ ...p, provider: v }))}
        onTrackingNoChange={(v) => setFilters((p) => ({ ...p, trackingNo: v }))}
        onSearch={() => { setPage(1); fetchData(); }}
        onReset={resetFilters}
      />

      <ShipmentTable data={data} onDelete={handleDelete} />

      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {total} 条</span>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
            <Button variant="outline" size="xs" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>下一页</Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建新增记录页**

创建 `src/app/shipments/new/page.tsx`：

```typescript
import { ShipmentForm } from "@/components/shipments/shipment-form"

export default function NewShipmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">新增发货记录</h1>
      <div className="rounded-2xl bg-card p-6">
        <ShipmentForm mode="create" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建编辑记录页**

创建 `src/app/shipments/[id]/page.tsx`：

```typescript
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ShipmentForm } from "@/components/shipments/shipment-form"

export default function EditShipmentPage() {
  const params = useParams()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/shipments/${params.id}`)
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-muted-foreground">加载中...</div>
  if (!data) return <div className="text-muted-foreground">记录不存在</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">编辑发货记录</h1>
      <div className="rounded-2xl bg-card p-6">
        <ShipmentForm mode="edit" initialData={data} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 创建统计汇总页**

创建 `src/app/shipments/stats/page.tsx`：

```typescript
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#7a9e91", "#a3a8b8", "#b8b49e", "#c4b0a8"]

export default function ShipmentStatsPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/shipments/stats")
      .then((res) => res.json())
      .then((json) => setStats(json.data))
  }, [])

  if (!stats) return <div className="text-muted-foreground">加载中...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">统计汇总</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle>月度发货量趋势</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly}>
                  <CartesianGrid stroke="#f0eeec" />
                  <XAxis dataKey="month" tick={{ fill: "#6b6560", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: "#6b6560", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                  <Bar dataKey="totalPieces" name="件数" fill="#7a9e91" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>品牌发货占比</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.byBrand} dataKey="totalPieces" nameKey="brand" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={0}>
                    {stats.byBrand.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>渠道运费对比</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byChannel}>
                  <CartesianGrid stroke="#f0eeec" />
                  <XAxis dataKey="channel" tick={{ fill: "#6b6560", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b6560", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                  <Bar dataKey="totalCost" name="运费" fill="#a3a8b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 提交**

```bash
git add src/app/shipments/
git commit -m "feat: add shipments pages (list, new, edit, stats)"
```

---

## Task 6: Excel 批量导入

**Files:**
- Install: `xlsx` package
- Create: `src/components/shipments/import-dropzone.tsx`
- Create: `src/components/shipments/import-preview.tsx`
- Create: `src/app/shipments/import/page.tsx`
- Create: `src/app/api/shipments/import/route.ts`

- [ ] **Step 1: 安装 xlsx 依赖**

Run: `cd /workspace/logistics-portal && npm install xlsx`

- [ ] **Step 2: 创建导入 API**

创建 `src/app/api/shipments/import/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = await request.json();
    const records: Record<string, unknown>[] = body.records;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "无有效数据" }, { status: 400 });
    }

    const values = records.map((r) => ({
      shipmentDate: String(r.shipmentDate || ""),
      brand: String(r.brand || ""),
      channel: String(r.channel || ""),
      provider: String(r.provider || ""),
      destination: String(r.destination || ""),
      trackingNo: r.trackingNo ? String(r.trackingNo) : null,
      pieces: Number(r.pieces) || 0,
      actualWeight: r.actualWeight ? Number(r.actualWeight) : null,
      volWeight: r.volWeight ? Number(r.volWeight) : null,
      chargeWeight: r.chargeWeight ? Number(r.chargeWeight) : null,
      freightCost: r.freightCost ? Number(r.freightCost) : null,
      extraCost: r.extraCost ? Number(r.extraCost) : 0,
      totalCost: r.totalCost ? Number(r.totalCost) : null,
      currency: r.currency ? String(r.currency) : "CNY",
      remark: r.remark ? String(r.remark) : null,
    }));

    const result = await db.insert(shipments).values(values).returning();
    return NextResponse.json({ data: result, count: result.length }, { status: 201 });
  } catch (error) {
    console.error("导入发货记录失败:", error);
    return NextResponse.json({ error: "导入发货记录失败" }, { status: 500 });
  }
}
```

- [ ] **Step 3: 创建导入页面**

创建 `src/app/shipments/import/page.tsx`：

```typescript
"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const REQUIRED_COLUMNS = ["shipmentDate", "brand", "channel", "provider", "destination", "pieces"]
const COLUMN_MAP: Record<string, string> = {
  "发货日期": "shipmentDate", "日期": "shipmentDate",
  "品牌": "brand", "渠道": "channel", "服务商": "provider",
  "目的地": "destination", "追踪号": "trackingNo",
  "件数": "pieces", "实重": "actualWeight", "实重kg": "actualWeight",
  "体积重": "volWeight", "体积重kg": "volWeight",
  "计费重": "chargeWeight", "计费重kg": "chargeWeight",
  "运费": "freightCost", "附加费": "extraCost",
  "总费用": "totalCost", "币种": "currency", "备注": "remark",
}

export default function ImportPage() {
  const [parsed, setParsed] = useState<Record<string, unknown>[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ count: number } | null>(null)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws)

      const mapped = raw.map((row) => {
        const out: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(row)) {
          const mappedKey = COLUMN_MAP[key] || key
          out[mappedKey] = val
        }
        return out
      })

      setParsed(mapped)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch("/api/shipments/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsed }),
      })
      const json = await res.json()
      if (res.ok) {
        setResult({ count: json.count })
      } else {
        alert(json.error || "导入失败")
      }
    } catch {
      alert("网络错误")
    } finally {
      setImporting(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">批量导入</h1>
        <div className="rounded-2xl bg-card p-8 text-center">
          <p className="text-lg font-light text-foreground">成功导入 {result.count} 条记录</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/shipments"><Button>查看发货台账</Button></Link>
            <Link href="/shipments/import"><Button variant="outline">继续导入</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">批量导入</h1>

      {parsed.length === 0 ? (
        <div className="rounded-2xl bg-card p-8">
          <label className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-border py-12 hover:border-accent/40 transition-colors">
            <span className="text-sm text-muted-foreground">点击或拖拽上传 Excel 文件 (.xlsx)</span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }} />
          </label>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>支持的列名：发货日期、品牌、渠道、服务商、目的地、追踪号、件数、实重、体积重、计费重、运费、附加费、总费用、币种、备注</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">预览 {parsed.length} 条记录</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setParsed([])}>重新选择</Button>
              <Button size="sm" onClick={handleImport} disabled={importing}>
                {importing ? "导入中..." : "确认导入"}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {REQUIRED_COLUMNS.map((col) => <TableHead key={col}>{col}</TableHead>)}
                    <TableHead>trackingNo</TableHead>
                    <TableHead>freightCost</TableHead>
                    <TableHead>remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      {REQUIRED_COLUMNS.map((col) => <TableCell key={col}>{String(row[col] ?? "")}</TableCell>)}
                      <TableCell>{String(row.trackingNo ?? "")}</TableCell>
                      <TableCell>{String(row.freightCost ?? "")}</TableCell>
                      <TableCell>{String(row.remark ?? "")}</TableCell>
                    </TableRow>
                  ))}
                  {parsed.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        还有 {parsed.length - 20} 条未显示...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/app/shipments/import/ src/app/api/shipments/import/ package.json package-lock.json
git commit -m "feat: add Excel import for shipments"
```

---

## Task 7: 单据生成器 API 和模板

**Files:**
- Create: `src/app/api/documents/route.ts`
- Create: `src/app/api/documents/templates/route.ts`
- Create: `src/app/api/documents/templates/[id]/route.ts`

- [ ] **Step 1: 创建单据 API**

创建 `src/app/api/documents/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const { db } = await getContext();
    const data = await db.select().from(documents).orderBy(desc(documents.createdAt));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取单据列表失败:", error);
    return NextResponse.json({ error: "获取单据列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = await request.json();
    const result = await db.insert(documents).values({
      templateId: body.templateId ?? null,
      type: body.type,
      data: JSON.stringify(body.data),
    }).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建单据失败:", error);
    return NextResponse.json({ error: "创建单据失败" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 创建模板 API**

创建 `src/app/api/documents/templates/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documentTemplates } from "@/lib/db/schema";

export async function GET() {
  try {
    const { db } = await getContext();
    const data = await db.select().from(documentTemplates);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取模板列表失败:", error);
    return NextResponse.json({ error: "获取模板列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = await request.json();
    const result = await db.insert(documentTemplates).values({
      name: body.name,
      type: body.type,
      fields: JSON.stringify(body.fields),
      layout: body.layout ? JSON.stringify(body.layout) : null,
      isDefault: body.isDefault ? 1 : 0,
    }).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建模板失败:", error);
    return NextResponse.json({ error: "创建模板失败" }, { status: 500 });
  }
}
```

创建 `src/app/api/documents/templates/[id]/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documentTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(documentTemplates)
      .set({
        name: body.name,
        type: body.type,
        fields: JSON.stringify(body.fields),
        layout: body.layout ? JSON.stringify(body.layout) : null,
        isDefault: body.isDefault ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documentTemplates.id, Number(id)))
      .returning();
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("更新模板失败:", error);
    return NextResponse.json({ error: "更新模板失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    await db.delete(documentTemplates).where(eq(documentTemplates.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除模板失败:", error);
    return NextResponse.json({ error: "删除模板失败" }, { status: 500 });
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/api/documents/
git commit -m "feat: add documents and templates API routes"
```

---

## Task 8: 单据生成器前端

**Files:**
- Install: `@react-pdf/renderer`
- Create: `src/components/documents/packing-list-pdf.tsx`
- Create: `src/components/documents/commercial-invoice-pdf.tsx`
- Create: `src/app/documents/generate/page.tsx`
- Create: `src/app/documents/templates/page.tsx`
- Create: `src/app/documents/page.tsx`

- [ ] **Step 1: 安装 @react-pdf/renderer**

Run: `cd /workspace/logistics-portal && npm install @react-pdf/renderer`

- [ ] **Step 2: 创建装箱单 PDF 模板**

创建 `src/components/documents/packing-list-pdf.tsx`：

```typescript
"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  headerBlock: { fontSize: 9 },
  label: { fontSize: 8, color: "#666", marginBottom: 2 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  col1: { width: "8%", padding: 4 },
  col2: { width: "25%", padding: 4 },
  col3: { width: "12%", padding: 4 },
  col4: { width: "12%", padding: 4 },
  col5: { width: "12%", padding: 4 },
  col6: { width: "12%", padding: 4 },
  col7: { width: "10%", padding: 4 },
  col8: { width: "9%", padding: 4 },
  footer: { marginTop: 20, fontSize: 8, color: "#999" },
})

interface PackingListData {
  shipper: { name: string; address: string; contact: string }
  consignee: { name: string; address: string; contact: string }
  invoiceNo: string
  date: string
  items: { cartonNo: number; description: string; qty: number; gw: number; nw: number; length: number; width: number; height: number }[]
}

export function PackingListPDF({ data }: { data: PackingListData }) {
  const totalQty = data.items.reduce((s, i) => s + i.qty, 0)
  const totalGW = data.items.reduce((s, i) => s + i.gw, 0)
  const totalNW = data.items.reduce((s, i) => s + i.nw, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PACKING LIST</Text>
        <View style={styles.header}>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Shipper / Exporter</Text>
            <Text>{data.shipper.name}</Text>
            <Text>{data.shipper.address}</Text>
            <Text>{data.shipper.contact}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Consignee</Text>
            <Text>{data.consignee.name}</Text>
            <Text>{data.consignee.address}</Text>
            <Text>{data.consignee.contact}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Invoice No.</Text>
            <Text>{data.invoiceNo}</Text>
            <Text style={styles.label}>Date</Text>
            <Text>{data.date}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>CTN</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>G.W.(kg)</Text>
            <Text style={styles.col5}>N.W.(kg)</Text>
            <Text style={styles.col6}>L(cm)</Text>
            <Text style={styles.col7}>W(cm)</Text>
            <Text style={styles.col8}>H(cm)</Text>
          </View>
          {data.items.map((item) => (
            <View key={item.cartonNo} style={styles.tableRow}>
              <Text style={styles.col1}>{item.cartonNo}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>{item.qty}</Text>
              <Text style={styles.col4}>{item.gw}</Text>
              <Text style={styles.col5}>{item.nw}</Text>
              <Text style={styles.col6}>{item.length}</Text>
              <Text style={styles.col7}>{item.width}</Text>
              <Text style={styles.col8}>{item.height}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", marginTop: 10, fontSize: 10 }}>
          <Text style={{ width: "33%" }}>Total Qty: {totalQty}</Text>
          <Text style={{ width: "33%" }}>Total G.W.: {totalGW.toFixed(1)} kg</Text>
          <Text style={{ width: "33%" }}>Total N.W.: {totalNW.toFixed(1)} kg</Text>
        </View>
        <Text style={styles.footer}>Generated by Logistics Portal</Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 3: 创建商业发票 PDF 模板**

创建 `src/components/documents/commercial-invoice-pdf.tsx`：

```typescript
"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  headerBlock: { fontSize: 9 },
  label: { fontSize: 8, color: "#666", marginBottom: 2 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  col1: { width: "5%", padding: 4 },
  col2: { width: "30%", padding: 4 },
  col3: { width: "15%", padding: 4 },
  col4: { width: "15%", padding: 4 },
  col5: { width: "15%", padding: 4 },
  col6: { width: "20%", padding: 4 },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, fontSize: 11 },
  footer: { marginTop: 20, fontSize: 8, color: "#999" },
})

interface CommercialInvoiceData {
  seller: { name: string; address: string }
  buyer: { name: string; address: string }
  invoiceNo: string
  date: string
  terms: string
  currency: string
  items: { no: number; description: string; qty: number; unitPrice: number; amount: number }[]
}

export function CommercialInvoicePDF({ data }: { data: CommercialInvoiceData }) {
  const totalAmount = data.items.reduce((s, i) => s + i.amount, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>COMMERCIAL INVOICE</Text>
        <View style={styles.header}>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Seller</Text>
            <Text>{data.seller.name}</Text>
            <Text>{data.seller.address}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Buyer</Text>
            <Text>{data.buyer.name}</Text>
            <Text>{data.buyer.address}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.label}>Invoice No.</Text>
            <Text>{data.invoiceNo}</Text>
            <Text style={styles.label}>Date</Text>
            <Text>{data.date}</Text>
            <Text style={styles.label}>Terms</Text>
            <Text>{data.terms}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>No.</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>Unit Price</Text>
            <Text style={styles.col5}>Amount</Text>
            <Text style={styles.col6}>Currency</Text>
          </View>
          {data.items.map((item) => (
            <View key={item.no} style={styles.tableRow}>
              <Text style={styles.col1}>{item.no}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>{item.qty}</Text>
              <Text style={styles.col4}>{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.col5}>{item.amount.toFixed(2)}</Text>
              <Text style={styles.col6}>{data.currency}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.total}>Total: {data.currency} {totalAmount.toFixed(2)}</Text>
        <Text style={styles.footer}>Generated by Logistics Portal</Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: 创建单据生成页面**

创建 `src/app/documents/generate/page.tsx`：

```typescript
"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { PackingListPDF } from "@/components/documents/packing-list-pdf"
import { CommercialInvoicePDF } from "@/components/documents/commercial-invoice-pdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type DocType = "packing_list" | "commercial_invoice"

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "packing_list", label: "装箱单 Packing List" },
  { value: "commercial_invoice", label: "商业发票 Commercial Invoice" },
]

export default function GenerateDocumentPage() {
  const [docType, setDocType] = useState<DocType>("packing_list")
  const [generating, setGenerating] = useState(false)

  // 装箱单表单
  const [plData, setPlData] = useState({
    shipperName: "", shipperAddress: "", shipperContact: "",
    consigneeName: "", consigneeAddress: "", consigneeContact: "",
    invoiceNo: "", date: new Date().toISOString().slice(0, 10),
  })

  // 商业发票表单
  const [ciData, setCiData] = useState({
    sellerName: "", sellerAddress: "",
    buyerName: "", buyerAddress: "",
    invoiceNo: "", date: new Date().toISOString().slice(0, 10),
    terms: "FOB", currency: "USD",
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let blob: Blob
      if (docType === "packing_list") {
        blob = await pdf(<PackingListPDF data={{
          shipper: { name: plData.shipperName, address: plData.shipperAddress, contact: plData.shipperContact },
          consignee: { name: plData.consigneeName, address: plData.consigneeAddress, contact: plData.consigneeContact },
          invoiceNo: plData.invoiceNo, date: plData.date,
          items: [{ cartonNo: 1, description: "Sample", qty: 1, gw: 0, nw: 0, length: 0, width: 0, height: 0 }],
        }} />).toBlob()
      } else {
        blob = await pdf(<CommercialInvoicePDF data={{
          seller: { name: ciData.sellerName, address: ciData.sellerAddress },
          buyer: { name: ciData.buyerName, address: ciData.buyerAddress },
          invoiceNo: ciData.invoiceNo, date: ciData.date,
          terms: ciData.terms, currency: ciData.currency,
          items: [{ no: 1, description: "Sample", qty: 1, unitPrice: 0, amount: 0 }],
        }} />).toBlob()
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${docType === "packing_list" ? "Packing_List" : "Commercial_Invoice"}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("生成失败")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">单据生成</h1>

      <div className="flex gap-2">
        {DOC_TYPES.map((t) => (
          <Button key={t.value} variant={docType === t.value ? "default" : "outline"} size="sm" onClick={() => setDocType(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-6">
        {docType === "packing_list" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">发货人名称</label>
              <Input value={plData.shipperName} onChange={(e) => setPlData((p) => ({ ...p, shipperName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">发货人地址</label>
              <Input value={plData.shipperAddress} onChange={(e) => setPlData((p) => ({ ...p, shipperAddress: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">联系方式</label>
              <Input value={plData.shipperContact} onChange={(e) => setPlData((p) => ({ ...p, shipperContact: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">收货人名称</label>
              <Input value={plData.consigneeName} onChange={(e) => setPlData((p) => ({ ...p, consigneeName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">收货人地址</label>
              <Input value={plData.consigneeAddress} onChange={(e) => setPlData((p) => ({ ...p, consigneeAddress: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">联系方式</label>
              <Input value={plData.consigneeContact} onChange={(e) => setPlData((p) => ({ ...p, consigneeContact: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">发票号</label>
              <Input value={plData.invoiceNo} onChange={(e) => setPlData((p) => ({ ...p, invoiceNo: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">日期</label>
              <Input type="date" value={plData.date} onChange={(e) => setPlData((p) => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">卖方名称</label>
              <Input value={ciData.sellerName} onChange={(e) => setCiData((p) => ({ ...p, sellerName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">卖方地址</label>
              <Input value={ciData.sellerAddress} onChange={(e) => setCiData((p) => ({ ...p, sellerAddress: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">买方名称</label>
              <Input value={ciData.buyerName} onChange={(e) => setCiData((p) => ({ ...p, buyerName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">买方地址</label>
              <Input value={ciData.buyerAddress} onChange={(e) => setCiData((p) => ({ ...p, buyerAddress: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">发票号</label>
              <Input value={ciData.invoiceNo} onChange={(e) => setCiData((p) => ({ ...p, invoiceNo: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">日期</label>
              <Input type="date" value={ciData.date} onChange={(e) => setCiData((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">贸易条款</label>
              <select value={ciData.terms} onChange={(e) => setCiData((p) => ({ ...p, terms: e.target.value }))} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="DDP">DDP</option>
                <option value="EXW">EXW</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-muted-foreground">币种</label>
              <select value={ciData.currency} onChange={(e) => setCiData((p) => ({ ...p, currency: e.target.value }))} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleGenerate} disabled={generating} size="lg">
        {generating ? "生成中..." : "生成 PDF"}
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: 创建模板管理页和单据列表页**

创建 `src/app/documents/templates/page.tsx`：

```typescript
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface Template {
  id: number
  name: string
  type: string
  isDefault: number
}

const TYPE_LABELS: Record<string, string> = {
  packing_list: "装箱单",
  commercial_invoice: "商业发票",
  customs: "报关草单",
  forwarder_invoice: "货代发票",
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("packing_list")

  const fetchTemplates = async () => {
    const res = await fetch("/api/documents/templates")
    const json = await res.json()
    setTemplates(json.data || [])
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleCreate = async () => {
    if (!name) return
    await fetch("/api/documents/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, fields: [] }),
    })
    setName("")
    fetchTemplates()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此模板？")) return
    await fetch(`/api/documents/templates/${id}`, { method: "DELETE" })
    fetchTemplates()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">模板管理</h1>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">模板名称</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入模板名称" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={handleCreate}>新建模板</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{t.name}</CardTitle>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{TYPE_LABELS[t.type] || t.type}</p>
              {t.isDefault === 1 && <p className="text-xs text-accent mt-1">默认模板</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

创建 `src/app/documents/page.tsx`：

```typescript
import { redirect } from "next/server"

export default function DocumentsPage() {
  redirect("/documents/generate")
}
```

- [ ] **Step 6: 提交**

```bash
git add src/app/documents/ src/components/documents/ package.json package-lock.json
git commit -m "feat: add document generator with packing list and commercial invoice PDF"
```

---

## Task 9: 构建验证和部署

**Files:**
- 无新增/修改

- [ ] **Step 1: 本地构建验证**

Run: `cd /workspace/logistics-portal && npx @opennextjs/cloudflare build 2>&1 | tail -10`
Expected: `OpenNext build complete.`

- [ ] **Step 2: 生成 Worker bundle 并部署**

```bash
rm -rf /tmp/wrangler-out
npx wrangler deploy --dry-run --outdir /tmp/wrangler-out --config /tmp/wrangler-worker.jsonc --minify
cp /tmp/wrangler-out/worker.js .open-next/assets/_worker.js
echo '{"version":1,"include":["/*"],"exclude":["/_next/static/*","/_next/image","/favicon.ico","/favicon.svg","/*.png","/*.jpg","/*.svg","/*.ico","/*.woff2","/*.woff","/*.ttf"]}' > .open-next/assets/_routes.json
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy .open-next/assets --project-name=logistics-portal --commit-dirty=true
```

- [ ] **Step 3: 推送到 GitHub**

```bash
git push origin main
```
