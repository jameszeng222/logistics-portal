import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { deliveryRecords, channels, providers } from "@/lib/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";
  const timelinessWeight = Number(searchParams.get("timelinessWeight") || 50);
  const inspectionWeight = Number(searchParams.get("inspectionWeight") || 30);
  const priceWeight = Number(searchParams.get("priceWeight") || 20);

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

  try {
    // 时效达成率
    const timelinessRaw = await db
      .select({
        providerId: providers.id,
        providerName: providers.name,
        channelId: deliveryRecords.channelId,
        achievementRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN ${deliveryRecords.onTime} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr)
        )
      )
      .groupBy(providers.id, providers.name, deliveryRecords.channelId);

    // 验货率
    const inspectionRaw = await db
      .select({
        providerId: providers.id,
        providerName: providers.name,
        inspectionRate: sql<number>`CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(${deliveryRecords.inspected}) * 100.0 / COUNT(*), 1) ELSE 0 END`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr)
        )
      )
      .groupBy(providers.id, providers.name);

    // 平均物流成本（用于价格评分）
    const priceRaw = await db
      .select({
        providerId: providers.id,
        providerName: providers.name,
        avgCost: sql<number>`COALESCE(ROUND(AVG(${deliveryRecords.logisticsCost}), 2), 0)`,
      })
      .from(deliveryRecords)
      .innerJoin(providers, eq(deliveryRecords.providerId, providers.id))
      .where(
        and(
          gte(deliveryRecords.shipmentDate, startDateStr),
          lte(deliveryRecords.shipmentDate, endDateStr)
        )
      )
      .groupBy(providers.id, providers.name);

    // 构建评分
    const inspectionMap = new Map(inspectionRaw.map((r) => [r.providerId, Number(r.inspectionRate)]));
    const priceMap = new Map(priceRaw.map((r) => [r.providerId, Number(r.avgCost)]));

    // 价格评分：最低价=100，最高价=60，线性插值
    const prices = priceRaw.map((r) => Number(r.avgCost)).filter((p) => p > 0);
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 1);

    const rankings = timelinessRaw.map((r) => {
      const achievementRate = Number(r.achievementRate);
      const inspRate = inspectionMap.get(r.providerId) ?? 0;
      const avgCost = priceMap.get(r.providerId) ?? 0;

      const timelinessScore = achievementRate * timelinessWeight / 100;
      const inspectionScore = (1 - inspRate / 100) * 100 * inspectionWeight / 100;

      let priceScore = 0;
      if (maxPrice > minPrice && avgCost > 0) {
        priceScore = (1 - (avgCost - minPrice) / (maxPrice - minPrice)) * 40 + 60;
      } else {
        priceScore = 80;
      }
      priceScore = priceScore * priceWeight / 100;

      const totalScore = Math.round((timelinessScore + inspectionScore + priceScore) * 10) / 10;

      let grade: string;
      if (totalScore >= 90) grade = "A";
      else if (totalScore >= 75) grade = "B";
      else if (totalScore >= 60) grade = "C";
      else grade = "D";

      return {
        providerName: r.providerName,
        channelId: r.channelId,
        timelinessScore: Math.round(timelinessScore * 10) / 10,
        inspectionScore: Math.round(inspectionScore * 10) / 10,
        priceScore: Math.round(priceScore * 10) / 10,
        totalScore,
        grade,
      };
    });

    rankings.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("Comprehensive assessment API error:", error);
    return NextResponse.json({ rankings: [] }, { status: 200 });
  }
}
