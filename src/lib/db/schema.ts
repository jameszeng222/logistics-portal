import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 品牌团队
export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 渠道
export const channels = sqliteTable("channels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  dimDivisor: integer("dim_divisor").notNull().default(6000),
});

// 服务商
export const providers = sqliteTable("providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  channelId: integer("channel_id").references(() => channels.id),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  email: text("email"),
  address: text("address"),
  status: text("status").notNull().default("active"), // active | paused | terminated
  cooperationStartDate: text("cooperation_start_date"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 服务商状态变更日志
export const providerStatusLog = sqliteTable("provider_status_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").references(() => providers.id),
  oldStatus: text("old_status"),
  newStatus: text("new_status"),
  reason: text("reason"),
  changedAt: text("changed_at").default(sql`(datetime('now'))`),
});

// UPS 头程价格
export const upsPrices = sqliteTable("ups_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  priceType: text("price_type").notNull(), // agent | own_account
  agentName: text("agent_name"),
  destinationRegion: text("destination_region").notNull(),
  zone: integer("zone"),
  unitPrice: real("unit_price").notNull(),
  peakSurcharge: real("peak_surcharge").default(0),
  fuelSurcharge: real("fuel_surcharge").default(0),
  effectiveDate: text("effective_date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 空运价格
export const airPrices = sqliteTable("air_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").references(() => providers.id),
  originCountry: text("origin_country").notNull(),
  originAirport: text("origin_airport").notNull(),
  destCountry: text("dest_country").notNull(),
  destAirport: text("dest_airport").notNull(),
  unitPrice: real("unit_price").notNull(),
  dimDivisor: integer("dim_divisor").default(6000),
  minCharge: real("min_charge").default(0),
  effectiveDate: text("effective_date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 海运价格（散货 LCL）
export const seaPrices = sqliteTable("sea_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").references(() => providers.id),
  originPort: text("origin_port").notNull(),
  destPort: text("dest_port").notNull(),
  unitPrice: real("unit_price").notNull(),
  minCharge: real("min_charge").default(0),
  effectiveDate: text("effective_date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 箱规尺寸
export const boxSpecs = sqliteTable("box_specs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull(),
  lengthCm: real("length_cm").notNull(),
  widthCm: real("width_cm").notNull(),
  heightCm: real("height_cm").notNull(),
  grossWeightKg: real("gross_weight_kg").notNull(),
  qtyPerBox: integer("qty_per_box").default(1),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 分泡规则
export const dimRules = sqliteTable("dim_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channelName: text("channel_name").notNull().unique(),
  dimDivisor: integer("dim_divisor").notNull(),
  isDefault: integer("is_default").notNull().default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// 发货记录
export const deliveryRecords = sqliteTable("delivery_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brandId: integer("brand_id").references(() => brands.id),
  channelId: integer("channel_id").references(() => channels.id),
  providerId: integer("provider_id").references(() => providers.id),
  shipmentDate: text("shipment_date").notNull(),
  deliveryDate: text("delivery_date"),
  promisedDays: integer("promised_days"),
  actualDays: integer("actual_days"),
  onTime: integer("on_time").default(0),
  inspected: integer("inspected").default(0),
  qty: integer("qty").default(0),
  weightKg: real("weight_kg").default(0),
  logisticsCost: real("logistics_cost").default(0),
  salesAmount: real("sales_amount").default(0),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => [
  index("idx_delivery_brand").on(table.brandId),
  index("idx_delivery_channel").on(table.channelId),
  index("idx_delivery_provider").on(table.providerId),
  index("idx_delivery_date").on(table.shipmentDate),
]);

// 周报
export const weeklyReports = sqliteTable("weekly_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  thisWeekNotes: text("this_week_notes"),
  nextWeekPlan: text("next_week_plan"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 周报-时效达成表
export const weeklyTimeliness = sqliteTable("weekly_timeliness", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").references(() => weeklyReports.id),
  channelId: integer("channel_id").references(() => channels.id),
  promisedTime: text("promised_time"),
  actualTime: text("actual_time"),
  achievementRate: real("achievement_rate"),
  reason: text("reason"),
});

// 周报-重点问题追踪
export const weeklyIssues = sqliteTable("weekly_issues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").references(() => weeklyReports.id),
  description: text("description").notNull(),
  assignee: text("assignee"),
  solution: text("solution"),
  difficulty: text("difficulty"),
  progress: text("progress"),
  status: text("status").notNull().default("open"), // open | completed
  carryOver: integer("carry_over").default(0),
  sourceIssueId: integer("source_issue_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 成员周报
export const memberReports = sqliteTable("member_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").references(() => weeklyReports.id),
  memberName: text("member_name").notNull(),
  color: text("color"),
  contentBlocks: text("content_blocks"), // JSON
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 成员周报模板
export const memberReportTemplates = sqliteTable("member_report_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberName: text("member_name").notNull().unique(),
  template: text("template"), // JSON
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});
