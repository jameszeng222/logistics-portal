import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import {
  weeklyReports,
  weeklyTimeliness,
  weeklyIssues,
  memberReports,
  channels,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await getContext();
    const { id } = await params;
    const reportId = Number(id);

    const report = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, reportId));

    if (report.length === 0) {
      return NextResponse.json({ error: "周报不存在" }, { status: 404 });
    }

    const timeliness = await db
      .select({
        id: weeklyTimeliness.id,
        reportId: weeklyTimeliness.reportId,
        channelId: weeklyTimeliness.channelId,
        channelName: channels.name,
        promisedTime: weeklyTimeliness.promisedTime,
        actualTime: weeklyTimeliness.actualTime,
        achievementRate: weeklyTimeliness.achievementRate,
        reason: weeklyTimeliness.reason,
      })
      .from(weeklyTimeliness)
      .leftJoin(channels, eq(weeklyTimeliness.channelId, channels.id))
      .where(eq(weeklyTimeliness.reportId, reportId));

    const issues = await db
      .select()
      .from(weeklyIssues)
      .where(eq(weeklyIssues.reportId, reportId));

    const members = await db
      .select()
      .from(memberReports)
      .where(eq(memberReports.reportId, reportId));

    return NextResponse.json({
      ...report[0],
      timeliness,
      issues,
      members,
    });
  } catch {
    return NextResponse.json(
      { error: "获取周报详情失败" },
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
    const reportId = Number(id);
    const body: {
      thisWeekNotes?: string;
      nextWeekPlan?: string;
      timeliness?: {
        id?: number;
        channelId?: number;
        promisedTime?: string;
        actualTime?: string;
        achievementRate?: number;
        reason?: string;
      }[];
      issues?: {
        id?: number;
        description?: string;
        assignee?: string;
        solution?: string;
        difficulty?: string;
        progress?: string;
        status?: string;
        carryOver?: number;
        sourceIssueId?: number;
      }[];
      members?: {
        id?: number;
        memberName?: string;
        color?: string;
        contentBlocks?: string;
      }[];
    } = await request.json();

    // Update report notes and plans
    await db
      .update(weeklyReports)
      .set({
        thisWeekNotes: body.thisWeekNotes ?? undefined,
        nextWeekPlan: body.nextWeekPlan ?? undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(weeklyReports.id, reportId));

    // Update timeliness
    if (body.timeliness) {
      // Delete existing and re-insert
      await db
        .delete(weeklyTimeliness)
        .where(eq(weeklyTimeliness.reportId, reportId));

      if (body.timeliness.length > 0) {
        await db.insert(weeklyTimeliness).values(
          body.timeliness.map((t) => ({
            reportId,
            channelId: t.channelId ?? null,
            promisedTime: t.promisedTime || null,
            actualTime: t.actualTime || null,
            achievementRate: t.achievementRate ?? null,
            reason: t.reason || null,
          }))
        );
      }
    }

    // Update issues
    if (body.issues) {
      // Delete existing and re-insert
      await db
        .delete(weeklyIssues)
        .where(eq(weeklyIssues.reportId, reportId));

      if (body.issues.length > 0) {
        await db.insert(weeklyIssues).values(
          body.issues.map((i) => ({
            reportId,
            description: i.description || "",
            assignee: i.assignee || null,
            solution: i.solution || null,
            difficulty: i.difficulty || null,
            progress: i.progress || null,
            status: i.status || "open",
            carryOver: i.carryOver ?? 0,
            sourceIssueId: i.sourceIssueId ?? null,
          }))
        );
      }
    }

    // Update member reports
    if (body.members) {
      await db
        .delete(memberReports)
        .where(eq(memberReports.reportId, reportId));

      if (body.members.length > 0) {
        await db.insert(memberReports).values(
          body.members.map((m) => ({
            reportId,
            memberName: m.memberName || "",
            color: m.color || null,
            contentBlocks: m.contentBlocks || null,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "更新周报失败" },
      { status: 500 }
    );
  }
}
