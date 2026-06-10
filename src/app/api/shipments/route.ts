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
