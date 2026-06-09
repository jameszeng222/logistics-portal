import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { providers, channels } from "@/lib/db/schema";
import { eq, and, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { db } = await getContext();
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions = [];
    if (channelId) {
      conditions.push(eq(providers.channelId, Number(channelId)));
    }
    if (status) {
      conditions.push(eq(providers.status, status));
    }
    if (search) {
      conditions.push(like(providers.name, `%${search}%`));
    }

    const result = await db
      .select({
        id: providers.id,
        name: providers.name,
        channelId: providers.channelId,
        channelName: channels.name,
        contactPerson: providers.contactPerson,
        contactPhone: providers.contactPhone,
        email: providers.email,
        address: providers.address,
        status: providers.status,
        cooperationStartDate: providers.cooperationStartDate,
        notes: providers.notes,
      })
      .from(providers)
      .leftJoin(channels, eq(providers.channelId, channels.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("获取服务商列表失败:", error);
    return NextResponse.json(
      { error: "获取服务商列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body: Record<string, unknown> = await request.json();

    const name = body.name as string | undefined;
    const channelId = body.channelId as number | undefined;
    const contactPerson = body.contactPerson as string | undefined;
    const contactPhone = body.contactPhone as string | undefined;
    const email = body.email as string | undefined;
    const address = body.address as string | undefined;
    const status = body.status as string | undefined;
    const cooperationStartDate = body.cooperationStartDate as string | undefined;
    const notes = body.notes as string | undefined;

    if (!name) {
      return NextResponse.json(
        { error: "缺少必填字段: name" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(providers)
      .values({
        name,
        channelId: channelId ?? null,
        contactPerson: contactPerson ?? null,
        contactPhone: contactPhone ?? null,
        email: email ?? null,
        address: address ?? null,
        status: status ?? "active",
        cooperationStartDate: cooperationStartDate ?? null,
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("创建服务商失败:", error);
    return NextResponse.json(
      { error: "创建服务商失败" },
      { status: 500 }
    );
  }
}
