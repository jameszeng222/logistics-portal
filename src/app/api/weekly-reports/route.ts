import { NextRequest, NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import {
  weeklyReports,
  weeklyTimeliness,
  weeklyIssues,
  memberReports,
  channels,
} from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { db } = await getContext();

    const reports = await db
      .select({
        id: weeklyReports.id,
        weekNumber: weeklyReports.weekNumber,
        year: weeklyReports.year,
        startDate: weeklyReports.startDate,
        endDate: weeklyReports.endDate,
        thisWeekNotes: weeklyReports.thisWeekNotes,
        nextWeekPlan: weeklyReports.nextWeekPlan,
        createdAt: weeklyReports.createdAt,
        updatedAt: weeklyReports.updatedAt,
        timelinessCount:
          sql<number>`(SELECT COUNT(*) FROM weekly_timeliness WHERE weekly_timeliness.report_id = weekly_reports.id)`.as(
            "timelinessCount"
          ),
        issueCount:
          sql<number>`(SELECT COUNT(*) FROM weekly_issues WHERE weekly_issues.report_id = weekly_reports.id)`.as(
            "issueCount"
          ),
        openIssueCount:
          sql<number>`(SELECT COUNT(*) FROM weekly_issues WHERE weekly_issues.report_id = weekly_reports.id AND weekly_issues.status = 'open')`.as(
            "openIssueCount"
          ),
        memberCount:
          sql<number>`(SELECT COUNT(DISTINCT member_reports.member_name) FROM member_reports WHERE member_reports.report_id = weekly_reports.id)`.as(
            "memberCount"
          ),
      })
      .from(weeklyReports)
      .orderBy(desc(weeklyReports.year), desc(weeklyReports.weekNumber));

    return NextResponse.json(reports);
  } catch {
    return NextResponse.json(
      { error: "获取周报列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await getContext();
    const body: {
      thisWeekNotes?: string;
      nextWeekPlan?: string;
      timeliness?: {
        channelId: number;
        promisedTime: string;
        actualTime: string;
        achievementRate: number;
        reason: string;
      }[];
      issues?: {
        description: string;
        assignee?: string;
        solution?: string;
        difficulty?: string;
        progress?: string;
        status?: string;
      }[];
      members?: {
        memberName: string;
        color?: string;
        contentBlocks?: string;
      }[];
    } = await request.json();

    // Auto-calculate week number and date range from current date
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;
    const weekNumber = Math.ceil(dayOfYear / 7);

    // Calculate week start (Monday) and end (Sunday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = monday.toISOString().split("T")[0];
    const endDate = sunday.toISOString().split("T")[0];

    // Check if report for this week already exists
    const existing = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.year, year),
          eq(weeklyReports.weekNumber, weekNumber)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `${year}年第${weekNumber}周周报已存在` },
        { status: 409 }
      );
    }

    // Create the report
    const reportResult = await db
      .insert(weeklyReports)
      .values({
        weekNumber,
        year,
        startDate,
        endDate,
        thisWeekNotes: body.thisWeekNotes || null,
        nextWeekPlan: body.nextWeekPlan || null,
      })
      .returning();

    const reportId = reportResult[0].id;

    // Insert timeliness data
    if (body.timeliness && body.timeliness.length > 0) {
      await db.insert(weeklyTimeliness).values(
        body.timeliness.map((t) => ({
          reportId,
          channelId: t.channelId,
          promisedTime: t.promisedTime || null,
          actualTime: t.actualTime || null,
          achievementRate: t.achievementRate ?? null,
          reason: t.reason || null,
        }))
      );
    }

    // Insert issues
    if (body.issues && body.issues.length > 0) {
      await db.insert(weeklyIssues).values(
        body.issues.map((i) => ({
          reportId,
          description: i.description,
          assignee: i.assignee || null,
          solution: i.solution || null,
          difficulty: i.difficulty || null,
          progress: i.progress || null,
          status: i.status || "open",
        }))
      );
    }

    // Carry over unresolved issues from previous week
    const previousReport = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.year, year),
          sql`${weeklyReports.weekNumber} < ${weekNumber}`
        )
      )
      .orderBy(desc(weeklyReports.weekNumber))
      .limit(1);

    if (previousReport.length > 0) {
      const prevIssues = await db
        .select()
        .from(weeklyIssues)
        .where(
          and(
            eq(weeklyIssues.reportId, previousReport[0].id),
            eq(weeklyIssues.status, "open")
          )
        );

      if (prevIssues.length > 0) {
        await db.insert(weeklyIssues).values(
          prevIssues.map((pi) => ({
            reportId,
            description: pi.description,
            assignee: pi.assignee,
            solution: pi.solution,
            difficulty: pi.difficulty,
            progress: pi.progress,
            status: "open",
            carryOver: 1,
            sourceIssueId: pi.id,
          }))
        );
      }
    }

    // Insert member reports
    if (body.members && body.members.length > 0) {
      await db.insert(memberReports).values(
        body.members.map((m) => ({
          reportId,
          memberName: m.memberName,
          color: m.color || null,
          contentBlocks: m.contentBlocks || null,
        }))
      );
    }

    return NextResponse.json(reportResult[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "创建周报失败" },
      { status: 500 }
    );
  }
}
