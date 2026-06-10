import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as Record<string, any>;
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
