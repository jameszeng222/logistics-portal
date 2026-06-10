import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { memberReportTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { db } = await getContext();
    const templates = await db
      .select()
      .from(memberReportTemplates)
      .orderBy(memberReportTemplates.memberName);

    return NextResponse.json(templates);
  } catch {
    return NextResponse.json(
      { error: "获取模板列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as { memberName: string; template: string };

    if (!body.memberName) {
      return NextResponse.json(
        { error: "成员名称不能为空" },
        { status: 400 }
      );
    }

    // Check if template already exists
    const existing = await db
      .select()
      .from(memberReportTemplates)
      .where(eq(memberReportTemplates.memberName, body.memberName));

    if (existing.length > 0) {
      // Update existing template
      await db
        .update(memberReportTemplates)
        .set({
          template: body.template || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(memberReportTemplates.memberName, body.memberName));

      return NextResponse.json({ success: true, action: "updated" });
    }

    // Create new template
    const result = await db
      .insert(memberReportTemplates)
      .values({
        memberName: body.memberName,
        template: body.template || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "创建模板失败" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as { id: number; memberName?: string; template?: string };

    if (!body.id) {
      return NextResponse.json(
        { error: "模板ID不能为空" },
        { status: 400 }
      );
    }

    await db
      .update(memberReportTemplates)
      .set({
        memberName: body.memberName ?? undefined,
        template: body.template ?? undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(memberReportTemplates.id, body.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "更新模板失败" },
      { status: 500 }
    );
  }
}
