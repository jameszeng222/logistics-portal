"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  SaveIcon,
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  UsersIcon,
  PlusIcon,
} from "lucide-react";
import { TimelinessTable, type TimelinessRow } from "@/components/weekly/timeliness-table";
import { IssueTracker, type IssueRow } from "@/components/weekly/issue-tracker";
import { MemberSection, type MemberData, type ContentBlockData } from "@/components/weekly/member-section";

interface Channel {
  id: number;
  name: string;
}

interface ReportData {
  id: number;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  thisWeekNotes: string | null;
  nextWeekPlan: string | null;
  timeliness: (TimelinessRow & { channelName?: string })[];
  issues: IssueRow[];
  members: {
    id: number;
    memberName: string;
    color: string | null;
    contentBlocks: string | null;
  }[];
}

// Mock data for initial display
function getMockData(id: number): ReportData {
  return {
    id,
    weekNumber: 23,
    year: 2026,
    startDate: "2026-06-02",
    endDate: "2026-06-08",
    thisWeekNotes: "本周物流运转正常，各渠道时效基本达标。海运渠道因天气原因略有延误，已与供应商沟通调整方案。",
    nextWeekPlan: "1. 推进新服务商引入流程\n2. 优化空运渠道时效\n3. 跟进UPS旺季附加费变化",
    timeliness: [
      { id: 1, channelId: 1, channelName: "UPS", promisedTime: "3天", actualTime: "3天", achievementRate: 100, reason: "" },
      { id: 2, channelId: 2, channelName: "DHL", promisedTime: "2天", actualTime: "2.5天", achievementRate: 80, reason: "航班延误" },
      { id: 3, channelId: 3, channelName: "空运", promisedTime: "5天", actualTime: "5天", achievementRate: 100, reason: "" },
      { id: 4, channelId: 4, channelName: "海运", promisedTime: "25天", actualTime: "28天", achievementRate: 89, reason: "天气原因导致港口拥堵" },
    ],
    issues: [
      { id: 1, description: "海运时效不达标", assignee: "张三", solution: "更换中转港口", difficulty: "需要重新谈判价格", progress: "已联系3家备选港口", status: "open", carryOver: 0 },
      { id: 2, description: "DHL旺季附加费上涨", assignee: "李四", solution: "对比其他渠道价格", difficulty: "替代渠道容量有限", progress: "已获取报价对比", status: "open", carryOver: 1, sourceIssueId: 5 },
      { id: 3, description: "仓库打包效率低", assignee: "王五", solution: "优化打包流程", difficulty: "", progress: "已完成流程优化", status: "completed", carryOver: 0 },
    ],
    members: [
      {
        id: 1,
        memberName: "张三",
        color: "#3b82f6",
        contentBlocks: JSON.stringify([
          { type: "table", title: "渠道时效跟进", columns: ["渠道", "承诺时效", "实际时效", "达标率"], rows: [["UPS", "3天", "3天", "100%"], ["DHL", "2天", "2.5天", "80%"]] },
          { type: "list", title: "本周完成事项", items: ["完成UPS渠道价格更新", "跟进DHL航班延误问题"] },
        ]),
      },
      {
        id: 2,
        memberName: "李四",
        color: "#ef4444",
        contentBlocks: JSON.stringify([
          { type: "list", title: "价格对比工作", items: ["收集DHL替代渠道报价", "整理旺季附加费数据"] },
        ]),
      },
    ],
  };
}

export default function WeeklyReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const reportId = Number(id);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState<ReportData | null>(null);
  const [thisWeekNotes, setThisWeekNotes] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [timeliness, setTimeliness] = useState<TimelinessRow[]>([]);
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [newMemberName, setNewMemberName] = useState("");

  useEffect(() => {
    // Load channels
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChannels(data);
      })
      .catch(() => {
        setChannels([
          { id: 1, name: "UPS" },
          { id: 2, name: "DHL" },
          { id: 3, name: "空运" },
          { id: 4, name: "海运" },
        ]);
      });

    // Load report data
    fetch(`/api/weekly-reports/${reportId}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        const reportData = data as ReportData;
        if (reportData.id) {
          loadReportData(reportData);
        } else {
          // Use mock data
          loadReportData(getMockData(reportId));
        }
      })
      .catch(() => {
        loadReportData(getMockData(reportId));
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const loadReportData = (data: ReportData) => {
    setReport(data);
    setThisWeekNotes(data.thisWeekNotes || "");
    setNextWeekPlan(data.nextWeekPlan || "");
    setTimeliness(
      data.timeliness.map((t) => ({
        id: t.id,
        channelId: t.channelId,
        channelName: t.channelName,
        promisedTime: t.promisedTime || "",
        actualTime: t.actualTime || "",
        achievementRate: t.achievementRate,
        reason: t.reason || "",
      }))
    );
    setIssues(
      data.issues.map((i) => ({
        id: i.id,
        description: i.description || "",
        assignee: i.assignee || "",
        solution: i.solution || "",
        difficulty: i.difficulty || "",
        progress: i.progress || "",
        status: i.status || "open",
        carryOver: i.carryOver ?? 0,
        sourceIssueId: i.sourceIssueId ?? undefined,
      }))
    );
    setMembers(
      data.members.map((m) => ({
        id: m.id,
        memberName: m.memberName,
        color: m.color || "#6b7280",
        contentBlocks: m.contentBlocks
          ? (() => {
              try {
                return JSON.parse(m.contentBlocks);
              } catch {
                return [];
              }
            })()
          : [],
      }))
    );
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#22c55e",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#f97316",
    ];
    setMembers([
      ...members,
      {
        memberName: newMemberName.trim(),
        color: colors[members.length % colors.length],
        contentBlocks: [],
      },
    ]);
    setNewMemberName("");
  };

  const updateMember = (index: number, member: MemberData) => {
    const updated = [...members];
    updated[index] = member;
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/weekly-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thisWeekNotes,
          nextWeekPlan,
          timeliness: timeliness.map((t) => ({
            channelId: t.channelId,
            promisedTime: t.promisedTime,
            actualTime: t.actualTime,
            achievementRate: t.achievementRate,
            reason: t.reason,
          })),
          issues: issues.map((i) => ({
            description: i.description,
            assignee: i.assignee,
            solution: i.solution,
            difficulty: i.difficulty,
            progress: i.progress,
            status: i.status,
            carryOver: i.carryOver ?? 0,
            sourceIssueId: i.sourceIssueId ?? null,
          })),
          members: members.map((m) => ({
            memberName: m.memberName,
            color: m.color,
            contentBlocks: JSON.stringify(m.contentBlocks),
          })),
        }),
      });

      if (res.ok) {
        setEditing(false);
      } else {
        const data: { error?: string } = await res.json();
        alert(data.error || "保存失败");
      }
    } catch {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">周报不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/weekly-reports")}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {report.year}年第{report.weekNumber}周
            </h1>
            <p className="text-sm text-muted-foreground">
              {report.startDate} ~ {report.endDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  loadReportData(report);
                }}
              >
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <SaveIcon className="size-4" />
                {saving ? "保存中..." : "保存"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <PencilIcon className="size-4" />
              编辑
            </Button>
          )}
        </div>
      </div>

      {/* Week Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="size-4" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">年份</Label>
              <Input value={report.year} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">周数</Label>
              <Input value={report.weekNumber} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">开始日期</Label>
              <Input value={report.startDate} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">结束日期</Label>
              <Input value={report.endDate} readOnly className="h-8 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeliness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClockIcon className="size-4" />
            时效达成表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelinessTable
            data={timeliness}
            onChange={setTimeliness}
            channels={channels}
            readOnly={!editing}
          />
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircleIcon className="size-4" />
            重点问题追踪
            {issues.some((i) => i.carryOver) && (
              <Badge variant="secondary" className="text-[10px]">
                含上周带入
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IssueTracker
            data={issues}
            onChange={setIssues}
            readOnly={!editing}
          />
        </CardContent>
      </Card>

      {/* Notes and Plans */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">本周总结</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={thisWeekNotes}
                onChange={(e) => setThisWeekNotes(e.target.value)}
                placeholder="本周工作总结..."
                rows={6}
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {thisWeekNotes || (
                  <span className="text-muted-foreground">暂无内容</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">下周计划</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={nextWeekPlan}
                onChange={(e) => setNextWeekPlan(e.target.value)}
                placeholder="下周工作计划..."
                rows={6}
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {nextWeekPlan || (
                  <span className="text-muted-foreground">暂无内容</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersIcon className="size-4" />
            成员周报
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing && (
            <div className="flex items-center gap-2">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="输入成员姓名"
                className="max-w-[200px] h-8"
                onKeyDown={(e) => e.key === "Enter" && addMember()}
              />
              <Button variant="outline" size="sm" onClick={addMember}>
                <PlusIcon className="size-3.5" />
                添加成员
              </Button>
            </div>
          )}
          {members.map((member, index) => (
            <MemberSection
              key={member.id || index}
              member={member}
              onChange={(m) => updateMember(index, m)}
              onRemove={() => removeMember(index)}
              readOnly={!editing}
            />
          ))}
          {members.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              暂无成员周报
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
