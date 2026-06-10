import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { boxSpecs } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const sku = searchParams.get("sku");

    let result;
    if (sku) {
      result = await db
        .select()
        .from(boxSpecs)
        .where(like(boxSpecs.sku, `%${sku}%`))
        .orderBy(boxSpecs.id);
    } else {
      result = await db.select().from(boxSpecs).orderBy(boxSpecs.id);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "获取箱规数据失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as { sku?: string; lengthCm?: number; widthCm?: number; heightCm?: number; grossWeightKg?: number; qtyPerBox?: number; notes?: string };
    const { sku, lengthCm, widthCm, heightCm, grossWeightKg, qtyPerBox, notes } = body;

    if (!sku || !lengthCm || !widthCm || !heightCm || !grossWeightKg) {
      return NextResponse.json(
        { error: "SKU、尺寸和重量不能为空" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(boxSpecs)
      .values({
        sku,
        lengthCm: Number(lengthCm),
        widthCm: Number(widthCm),
        heightCm: Number(heightCm),
        grossWeightKg: Number(grossWeightKg),
        qtyPerBox: qtyPerBox ? Number(qtyPerBox) : 1,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "创建箱规失败" },
      { status: 500 }
    );
  }
}
