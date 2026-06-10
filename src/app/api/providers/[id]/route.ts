import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import {
  providers,
  channels,
  providerStatusLog,
  airPrices,
  seaPrices,
  upsPrices,
  deliveryRecords,
} from "@/lib/db/schema";
import { eq, avg, count, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;

    // Basic info with channel name
    const providerRows = await db
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
        createdAt: providers.createdAt,
        updatedAt: providers.updatedAt,
      })
      .from(providers)
      .leftJoin(channels, eq(providers.channelId, channels.id))
      .where(eq(providers.id, Number(id)));

    if (providerRows.length === 0) {
      return NextResponse.json(
        { error: "服务商不存在" },
        { status: 404 }
      );
    }

    const provider = providerRows[0];

    // Related prices based on channel
    let prices: unknown[] = [];
    const channelName = provider.channelName?.toLowerCase() ?? "";

    if (channelName.includes("空运") || channelName.includes("air")) {
      prices = await db
        .select()
        .from(airPrices)
        .where(eq(airPrices.providerId, Number(id)));
    } else if (channelName.includes("海运") || channelName.includes("sea")) {
      prices = await db
        .select()
        .from(seaPrices)
        .where(eq(seaPrices.providerId, Number(id)));
    }
    // UPS prices don't have providerId, skip

    // Assessment summary from delivery records
    const assessmentRows = await db
      .select({
        avgTimeliness: avg(deliveryRecords.actualDays),
        totalRecords: count(deliveryRecords.id),
        inspectedCount: sql<number>`sum(case when ${deliveryRecords.inspected} = 1 then 1 else 0 end)`,
        onTimeCount: sql<number>`sum(case when ${deliveryRecords.onTime} = 1 then 1 else 0 end)`,
      })
      .from(deliveryRecords)
      .where(eq(deliveryRecords.providerId, Number(id)));

    const assessment = assessmentRows[0]
      ? {
          avgTimeliness: Number(assessmentRows[0].avgTimeliness) || 0,
          totalRecords: assessmentRows[0].totalRecords,
          inspectionRate:
            assessmentRows[0].totalRecords > 0
              ? Math.round(
                  (Number(assessmentRows[0].inspectedCount) /
                    assessmentRows[0].totalRecords) *
                    100
                )
              : 0,
          onTimeRate:
            assessmentRows[0].totalRecords > 0
              ? Math.round(
                  (Number(assessmentRows[0].onTimeCount) /
                    assessmentRows[0].totalRecords) *
                    100
                )
              : 0,
        }
      : { avgTimeliness: 0, totalRecords: 0, inspectionRate: 0, onTimeRate: 0 };

    // Status change history
    const statusLog = await db
      .select()
      .from(providerStatusLog)
      .where(eq(providerStatusLog.providerId, Number(id)))
      .orderBy(providerStatusLog.changedAt);

    return NextResponse.json({
      data: {
        ...provider,
        prices,
        assessment,
        statusLog,
      },
    });
  } catch (error) {
    console.error("获取服务商详情失败:", error);
    return NextResponse.json(
      { error: "获取服务商详情失败" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    // Get current provider
    const current = await db
      .select()
      .from(providers)
      .where(eq(providers.id, Number(id)));

    if (current.length === 0) {
      return NextResponse.json(
        { error: "服务商不存在" },
        { status: 404 }
      );
    }

    const oldStatus = current[0].status;
    const newStatus = body.status as string | undefined;

    // Build update object
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "name",
      "channelId",
      "contactPerson",
      "contactPhone",
      "email",
      "address",
      "status",
      "cooperationStartDate",
      "notes",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const result = await db
      .update(providers)
      .set(updateData)
      .where(eq(providers.id, Number(id)))
      .returning();

    // Log status change
    if (newStatus && newStatus !== oldStatus) {
      const reason = body.reason as string | undefined;
      await db.insert(providerStatusLog).values({
        providerId: Number(id),
        oldStatus,
        newStatus,
        reason: reason ?? null,
      });
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("更新服务商失败:", error);
    return NextResponse.json(
      { error: "更新服务商失败" },
      { status: 500 }
    );
  }
}
