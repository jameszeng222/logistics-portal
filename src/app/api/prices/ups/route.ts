import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { upsPrices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const destinationRegion = searchParams.get("destination_region");
    const zone = searchParams.get("zone");
    const priceType = searchParams.get("price_type");

    const conditions = [];
    if (destinationRegion) {
      conditions.push(eq(upsPrices.destinationRegion, destinationRegion));
    }
    if (zone) {
      conditions.push(eq(upsPrices.zone, Number(zone)));
    }
    if (priceType) {
      conditions.push(eq(upsPrices.priceType, priceType));
    }

    const data =
      conditions.length > 0
        ? await db
            .select()
            .from(upsPrices)
            .where(and(...conditions))
        : await db.select().from(upsPrices);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取UPS价格失败:", error);
    return NextResponse.json(
      { error: "获取UPS价格失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body: Record<string, unknown> = await request.json();

    const priceType = body.priceType as string | undefined;
    const agentName = body.agentName as string | undefined;
    const destinationRegion = body.destinationRegion as string | undefined;
    const zone = body.zone as number | undefined;
    const unitPrice = body.unitPrice as number | undefined;
    const peakSurcharge = body.peakSurcharge as number | undefined;
    const fuelSurcharge = body.fuelSurcharge as number | undefined;
    const effectiveDate = body.effectiveDate as string | undefined;
    const notes = body.notes as string | undefined;

    if (!priceType || !destinationRegion || !unitPrice || !effectiveDate) {
      return NextResponse.json(
        { error: "缺少必填字段: priceType, destinationRegion, unitPrice, effectiveDate" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(upsPrices)
      .values({
        priceType,
        agentName,
        destinationRegion,
        zone: zone ?? null,
        unitPrice,
        peakSurcharge: peakSurcharge ?? 0,
        fuelSurcharge: fuelSurcharge ?? 0,
        effectiveDate,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建UPS价格失败:", error);
    return NextResponse.json(
      { error: "创建UPS价格失败" },
      { status: 500 }
    );
  }
}
