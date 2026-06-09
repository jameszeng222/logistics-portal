import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { deliveryRecords, channels, providers } from "@/lib/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";
  const channelId = searchParams.get("channelId");
  const providerId = searchParams.get("providerId");

  const { db } = await getContext();

  const now = new Date();
  let startDate: Date;

  if (period === "quarter") {
    startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = now.toISOString().slice(0, 10);

  const conditions = [
    gte(deliveryRecords.shipmentDate, startDateStr),
    lte(deliveryRecords.shipmentDate, endDateStr),
  ];
  if (channelId) conditions.push(eq(deliveryRecords.channelId, Number(channelId)));
  if (providerId) conditions.push(eq(deliveryRecords.providerId, Number(providerId)));

  try {
    // 按服务商汇总
    const byProviderRaw = await db
      .select({
        providerName: providers.name,
        inspectionRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(${deliveryRecords.inspected}) * 100.0 / COUNT(*), 1) ELSE 0 END`,
        totalRecords: sql<number>`COUNT(*)`,
        inspectedCount: sql<number>`SUM(${deliveryRecords.inspected})`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(and(...conditions))
      .groupBy(providers.name);

    const byProvider = byProviderRaw.map((r) => ({
      providerName: r.providerName,
      inspectionRate: Number(r.inspectionRate),
      totalRecords: Number(r.totalRecords),
      inspectedCount: Number(r.inspectedCount),
    }));

    // 趋势数据
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().slice(0, 10);

    const trendConditions = [
      gte(deliveryRecords.shipmentDate, twelveMonthsAgoStr),
      lte(deliveryRecords.shipmentDate, endDateStr),
    ];
    if (channelId) trendConditions.push(eq(deliveryRecords.channelId, Number(channelId)));
    if (providerId) trendConditions.push(eq(deliveryRecords.providerId, Number(providerId)));

    const trendRaw = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`,
        providerName: providers.name,
        inspectionRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(${deliveryRecords.inspected}) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(and(...trendConditions))
      .groupBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`, providers.name)
      .orderBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`);

    const trend = trendRaw.map((r) => ({
      month: r.month,
      providerName: r.providerName,
      inspectionRate: Number(r.inspectionRate),
    }));

    // 按渠道汇总
    const byChannelRaw = await db
      .select({
        channelName: channels.name,
        inspectionRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(${deliveryRecords.inspected}) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(channels, eq(deliveryRecords.channelId, channels.id))
      .where(and(...conditions))
      .groupBy(channels.name);

    const byChannel = byChannelRaw.map((r) => ({
      channelName: r.channelName,
      inspectionRate: Number(r.inspectionRate),
    }));

    // 明细数据
    const detailsRaw = await db
      .select({
        providerName: providers.name,
        channelName: channels.name,
        month: sql<string>`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`,
        inspected: sql<number>`SUM(${deliveryRecords.inspected})`,
        total: sql<number>`COUNT(*)`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .innerJoin(channels, eq(deliveryRecords.channelId, channels.id))
      .where(and(...conditions))
      .groupBy(providers.name, channels.name, sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`)
      .orderBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`);

    const details = detailsRaw.map((r) => ({
      providerName: r.providerName,
      channelName: r.channelName,
      month: r.month,
      inspected: Number(r.inspected),
      total: Number(r.total),
    }));

    return NextResponse.json({ byProvider, trend, byChannel, details });
  } catch (error) {
    console.error("Inspection assessment API error:", error);
    return NextResponse.json(
      { byProvider: [], trend: [], byChannel: [], details: [] },
      { status: 200 }
    );
  }
}
