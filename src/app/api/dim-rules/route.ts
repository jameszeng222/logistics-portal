import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { dimRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { db } = await getContext();
    const rules = await db.select().from(dimRules).orderBy(dimRules.id);
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json(
      { error: "获取分泡规则失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body = (await request.json()) as { channelName?: string; dimDivisor?: number; isDefault?: boolean };
    const { channelName, dimDivisor, isDefault } = body;

    if (!channelName || !dimDivisor) {
      return NextResponse.json(
        { error: "渠道名称和除数不能为空" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db
        .update(dimRules)
        .set({ isDefault: 0 })
        .where(eq(dimRules.isDefault, 1));
    }

    const result = await db
      .insert(dimRules)
      .values({
        channelName,
        dimDivisor: Number(dimDivisor),
        isDefault: isDefault ? 1 : 0,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "创建分泡规则失败" },
      { status: 500 }
    );
  }
}
