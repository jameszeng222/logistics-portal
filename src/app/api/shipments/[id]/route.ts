import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { shipments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const result = await db.select().from(shipments).where(eq(shipments.id, Number(id)));
    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("获取发货记录失败:", error);
    return NextResponse.json({ error: "获取发货记录失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const body = (await request.json()) as Record<string, any>;

    const result = await db
      .update(shipments)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(shipments.id, Number(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("更新发货记录失败:", error);
    return NextResponse.json({ error: "更新发货记录失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const result = await db.delete(shipments).where(eq(shipments.id, Number(id))).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("删除发货记录失败:", error);
    return NextResponse.json({ error: "删除发货记录失败" }, { status: 500 });
  }
}
