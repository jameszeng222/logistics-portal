import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { documents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const { db } = await getContext();
    const data = await db.select().from(documents).orderBy(desc(documents.createdAt));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("获取单据列表失败:", error);
    return NextResponse.json({ error: "获取单据列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = await request.json();
    const result = await db.insert(documents).values({
      templateId: body.templateId ?? null,
      type: body.type,
      data: JSON.stringify(body.data),
    }).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建单据失败:", error);
    return NextResponse.json({ error: "创建单据失败" }, { status: 500 });
  }
}
