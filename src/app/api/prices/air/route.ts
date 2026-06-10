import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { airPrices, providers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get("provider_id");
    const originCountry = searchParams.get("origin_country");
    const destCountry = searchParams.get("dest_country");

    const conditions = [];
    if (providerId) {
      conditions.push(eq(airPrices.providerId, Number(providerId)));
    }
    if (originCountry) {
      conditions.push(eq(airPrices.originCountry, originCountry));
    }
    if (destCountry) {
      conditions.push(eq(airPrices.destCountry, destCountry));
    }

    const query = db
      .select({
        id: airPrices.id,
        providerId: airPrices.providerId,
        providerName: providers.name,
        originCountry: airPrices.originCountry,
        originAirport: airPrices.originAirport,
        destCountry: airPrices.destCountry,
        destAirport: airPrices.destAirport,
        unitPrice: airPrices.unitPrice,
        dimDivisor: airPrices.dimDivisor,
        minCharge: airPrices.minCharge,
        effectiveDate: airPrices.effectiveDate,
        notes: airPrices.notes,
        createdAt: airPrices.createdAt,
      })
      .from(airPrices)
      .leftJoin(providers, eq(airPrices.providerId, providers.id));

    const data =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取空运价格失败:", error);
    return NextResponse.json(
      { error: "获取空运价格失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as Record<string, unknown>;

    const providerId = body.providerId as number | undefined;
    const originCountry = body.originCountry as string | undefined;
    const originAirport = body.originAirport as string | undefined;
    const destCountry = body.destCountry as string | undefined;
    const destAirport = body.destAirport as string | undefined;
    const unitPrice = body.unitPrice as number | undefined;
    const dimDivisor = body.dimDivisor as number | undefined;
    const minCharge = body.minCharge as number | undefined;
    const effectiveDate = body.effectiveDate as string | undefined;
    const notes = body.notes as string | undefined;

    if (
      !providerId ||
      !originCountry ||
      !originAirport ||
      !destCountry ||
      !destAirport ||
      !unitPrice ||
      !effectiveDate
    ) {
      return NextResponse.json(
        {
          error:
            "缺少必填字段: providerId, originCountry, originAirport, destCountry, destAirport, unitPrice, effectiveDate",
        },
        { status: 400 }
      );
    }

    const result = await db
      .insert(airPrices)
      .values({
        providerId,
        originCountry,
        originAirport,
        destCountry,
        destAirport,
        unitPrice,
        dimDivisor: dimDivisor ?? 6000,
        minCharge: minCharge ?? 0,
        effectiveDate,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建空运价格失败:", error);
    return NextResponse.json(
      { error: "创建空运价格失败" },
      { status: 500 }
    );
  }
}
