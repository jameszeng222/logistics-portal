import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documentTemplates } from "@/lib/db/schema";

export async function GET() {
  try {
    const { db } = await getContext();
    const data = await db.select().from(documentTemplates);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取模板列表失败:", error);
    return NextResponse.json({ error: "获取模板列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as Record<string, any>;
    const result = await db.insert(documentTemplates).values({
      name: body.name,
      type: body.type,
      fields: JSON.stringify(body.fields),
      layout: body.layout ? JSON.stringify(body.layout) : null,
      isDefault: body.isDefault ? 1 : 0,
    }).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建模板失败:", error);
    return NextResponse.json({ error: "创建模板失败" }, { status: 500 });
  }
}
