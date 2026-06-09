import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { seaPrices, providers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get("provider_id");
    const originPort = searchParams.get("origin_port");
    const destPort = searchParams.get("dest_port");

    const conditions = [];
    if (providerId) {
      conditions.push(eq(seaPrices.providerId, Number(providerId)));
    }
    if (originPort) {
      conditions.push(eq(seaPrices.originPort, originPort));
    }
    if (destPort) {
      conditions.push(eq(seaPrices.destPort, destPort));
    }

    const query = db
      .select({
        id: seaPrices.id,
        providerId: seaPrices.providerId,
        providerName: providers.name,
        originPort: seaPrices.originPort,
        destPort: seaPrices.destPort,
        unitPrice: seaPrices.unitPrice,
        minCharge: seaPrices.minCharge,
        effectiveDate: seaPrices.effectiveDate,
        notes: seaPrices.notes,
        createdAt: seaPrices.createdAt,
      })
      .from(seaPrices)
      .leftJoin(providers, eq(seaPrices.providerId, providers.id));

    const data =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取海运价格失败:", error);
    return NextResponse.json(
      { error: "获取海运价格失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body: Record<string, unknown> = await request.json();

    const providerId = body.providerId as number | undefined;
    const originPort = body.originPort as string | undefined;
    const destPort = body.destPort as string | undefined;
    const unitPrice = body.unitPrice as number | undefined;
    const minCharge = body.minCharge as number | undefined;
    const effectiveDate = body.effectiveDate as string | undefined;
    const notes = body.notes as string | undefined;

    if (!providerId || !originPort || !destPort || !unitPrice || !effectiveDate) {
      return NextResponse.json(
        { error: "缺少必填字段: providerId, originPort, destPort, unitPrice, effectiveDate" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(seaPrices)
      .values({
        providerId,
        originPort,
        destPort,
        unitPrice,
        minCharge: minCharge ?? 0,
        effectiveDate,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建海运价格失败:", error);
    return NextResponse.json(
      { error: "创建海运价格失败" },
      { status: 500 }
    );
  }
}
