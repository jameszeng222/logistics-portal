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
