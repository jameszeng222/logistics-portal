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
        providerId: providers.id,
        providerName: providers.name,
        channelId: deliveryRecords.channelId,
        avgActualDays: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.actualDays}), 1), 0)`,
        avgPromisedDays: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.promisedDays}), 1), 0)`,
        achievementRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN ${deliveryRecords.onTime} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) ELSE 0 END`,
        totalRecords: sql<number>`COUNT(*)`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(and(...conditions))
      .groupBy(providers.id, providers.name, deliveryRecords.channelId);

    const byProvider = byProviderRaw.map((r) => ({
      providerName: r.providerName,
      channelId: r.channelId,
      avgActualDays: Number(r.avgActualDays),
      avgPromisedDays: Number(r.avgPromisedDays),
      achievementRate: Number(r.achievementRate),
      totalRecords: Number(r.totalRecords),
    }));

    // 趋势数据 - 按月
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
        achievementRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN ${deliveryRecords.onTime} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(and(...trendConditions))
      .groupBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`, providers.name)
      .orderBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`);

    const trend = trendRaw.map((r) => ({
      month: r.month,
      providerName: r.providerName,
      achievementRate: Number(r.achievementRate),
    }));

    // 按渠道汇总
    const byChannelRaw = await db
      .select({
        channelName: channels.name,
        providerName: providers.name,
        achievementRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN ${deliveryRecords.onTime} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(channels, eq(deliveryRecords.channelId, channels.id))
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(and(...conditions))
      .groupBy(channels.name, providers.name);

    const byChannel = byChannelRaw.map((r) => ({
      channelName: r.channelName,
      providerName: r.providerName,
      achievementRate: Number(r.achievementRate),
    }));

    // 明细数据
    const detailsRaw = await db
      .select({
        providerName: providers.name,
        channelName: channels.name,
        month: sql<string>`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`,
        promisedDays: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.promisedDays}), 1), 0)`,
        actualDays: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.actualDays}), 1), 0)`,
        onTime: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN ${deliveryRecords.onTime} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) ELSE 0 END`,
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
      promisedDays: Number(r.promisedDays),
      actualDays: Number(r.actualDays),
      onTime: Number(r.onTime),
    }));

    return NextResponse.json({ byProvider, trend, byChannel, details });
  } catch (error) {
    console.error("Timeliness assessment API error:", error);
    return NextResponse.json(
      { byProvider: [], trend: [], byChannel: [], details: [] },
      { status: 200 }
    );
  }
}
