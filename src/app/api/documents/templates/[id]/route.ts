import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documentTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const body = (await request.json()) as Record<string, any>;
    const result = await db.update(documentTemplates)
      .set({
        name: body.name,
        type: body.type,
        fields: JSON.stringify(body.fields),
        layout: body.layout ? JSON.stringify(body.layout) : null,
        isDefault: body.isDefault ? 1 : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documentTemplates.id, Number(id)))
      .returning();
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("更新模板失败:", error);
    return NextResponse.json({ error: "更新模板失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    await db.delete(documentTemplates).where(eq(documentTemplates.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除模板失败:", error);
    return NextResponse.json({ error: "删除模板失败" }, { status: 500 });
  }
}
