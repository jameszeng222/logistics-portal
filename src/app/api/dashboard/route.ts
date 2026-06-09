import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { deliveryRecords, brands, channels, providers } from "@/lib/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get("timeRange") || "month";
  const brandFilter = searchParams.get("brands")?.split(",").filter(Boolean) || [];

  const { db } = await getContext();

  const now = new Date();
  let startDate: Date;

  if (timeRange === "quarter") {
    startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  } else if (timeRange === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = now.toISOString().slice(0, 10);

  // Build brand filter conditions
  const brandConditions = brandFilter.length > 0
    ? brandFilter.map((b) => eq(brands.name, b))
    : undefined;

  try {
    // KPI data for current period
    const kpiResult = await db
      .select({
        totalCost: sql<number>`COALESCE(SUM(${deliveryRecords.logisticsCost}), 0)`,
        totalQty: sql<number>`COALESCE(SUM(${deliveryRecords.qty}), 0)`,
        avgDays: sql<number>`COALESCE(AVG(${deliveryRecords.actualDays}), 0)`,
        totalSales: sql<number>`COALESCE(SUM(${deliveryRecords.salesAmount}), 0)`,
      })
      .from(deliveryRecords)
      .innerJoin(brands, eq(deliveryRecords.brandId, brands.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr),
          ...(brandConditions ? [sql`${brands.name} IN (${sql.join(brandConditions.map(c => sql`${c}`), sql`, `)})`] : [])
        )
      );

    const kpi = {
      totalCost: Number(kpiResult[0]?.totalCost ?? 0),
      totalQty: Number(kpiResult[0]?.totalQty ?? 0),
      avgDays: Math.round(Number(kpiResult[0]?.avgDays ?? 0) * 10) / 10,
      feeRatio:
        Number(kpiResult[0]?.totalSales ?? 0) > 0
          ? Math.round((Number(kpiResult[0]?.totalCost ?? 0) / Number(kpiResult[0]?.totalSales ?? 1)) * 10000) / 10000
          : 0,
    };

    // Fee ratio trend by brand (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().slice(0, 10);

    const feeRatioTrendRaw = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`,
        brand: brands.name,
        feeRatio: sql<number>`CASE WHEN SUM(${deliveryRecords.salesAmount}) > 0 THEN ROUND(SUM(${deliveryRecords.logisticsCost}) * 1.0 / SUM(${deliveryRecords.salesAmount}), 4) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(brands, eq(deliveryRecords.brandId, brands.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, twelveMonthsAgoStr),
          lte(deliveryRecords.shipmentDate, endDateStr),
          ...(brandConditions ? [sql`${brands.name} IN (${sql.join(brandConditions.map(c => sql`${c}`), sql`, `)})`] : [])
        )
      )
      .groupBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`, brands.name)
      .orderBy(sql`strftime('%Y-%m', ${deliveryRecords.shipmentDate})`);

    const feeRatioTrend = feeRatioTrendRaw.map((r) => ({
      month: r.month,
      brand: r.brand,
      feeRatio: Number(r.feeRatio),
    }));

    // Brand fee ratio rank (current period)
    const brandFeeRankRaw = await db
      .select({
        brand: brands.name,
        feeRatio: sql<number>`CASE WHEN SUM(${deliveryRecords.salesAmount}) > 0 THEN ROUND(SUM(${deliveryRecords.logisticsCost}) * 1.0 / SUM(${deliveryRecords.salesAmount}), 4) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(brands, eq(deliveryRecords.brandId, brands.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr),
          ...(brandConditions ? [sql`${brands.name} IN (${sql.join(brandConditions.map(c => sql`${c}`), sql`, `)})`] : [])
        )
      )
      .groupBy(brands.name)
      .orderBy(sql`feeRatio DESC`);

    const brandFeeRank = brandFeeRankRaw.map((r) => ({
      brand: r.brand,
      feeRatio: Number(r.feeRatio),
    }));

    // Provider timeliness comparison
    const providerTimelinessRaw = await db
      .select({
        provider: providers.name,
        channel: channels.name,
        avgDays: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.actualDays}), 1), 0)`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .innerJoin(channels, eq(deliveryRecords.channelId, channels.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr)
        )
      )
      .groupBy(providers.name, channels.name)
      .orderBy(providers.name);

    const providerTimeliness = providerTimelinessRaw.map((r) => ({
      provider: r.provider,
      channel: r.channel,
      avgDays: Number(r.avgDays),
    }));

    // Channel volume comparison
    const channelVolumeRaw = await db
      .select({
        channel: channels.name,
        qty: sql<number>`COALESCE(SUM(${deliveryRecords.qty}), 0)`,
      })
      .from(deliveryRecords)
      .innerJoin(channels, eq(deliveryRecords.channelId, channels.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr)
        )
      )
      .groupBy(channels.name);

    const channelVolume = channelVolumeRaw.map((r) => ({
      channel: r.channel,
      qty: Number(r.qty),
    }));

    return NextResponse.json({
      kpi,
      feeRatioTrend,
      brandFeeRank,
      providerTimeliness,
      channelVolume,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        kpi: { feeRatio: 0, avgDays: 0, totalQty: 0, totalCost: 0 },
        feeRatioTrend: [],
        brandFeeRank: [],
        providerTimeliness: [],
        channelVolume: [],
      },
      { status: 200 }
    );
  }
}
