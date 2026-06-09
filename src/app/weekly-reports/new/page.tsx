"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  SaveIcon,
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  UsersIcon,
  PlusIcon,
} from "lucide-react";
import { TimelinessTable, type TimelinessRow } from "@/components/weekly/timeliness-table";
import { IssueTracker, type IssueRow } from "@/components/weekly/issue-tracker";
import { MemberSection, type MemberData } from "@/components/weekly/member-section";
import type { ContentBlockData } from "@/components/weekly/member-section";

interface Channel {
  id: number;
  name: string;
}

function getWeekInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear =
    Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekNumber,
    year,
    startDate: monday.toISOString().split("T")[0],
    endDate: sunday.toISOString().split("T")[0],
  };
}

export default function NewWeeklyReportPage() {
  const router = useRouter();
  const { weekNumber, year, startDate, endDate } = getWeekInfo();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [saving, setSaving] = useState(false);
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
        if (Array.isArray(data)) {
          setChannels(data);
          // Pre-fill timeliness with channels
          setTimeliness(
            data.map((ch: Channel) => ({
              channelId: ch.id,
              channelName: ch.name,
              promisedTime: "",
              actualTime: "",
              achievementRate: null,
              reason: "",
            }))
          );
        }
      })
      .catch(() => {
        // Use mock channels
        const mockChannels = [
          { id: 1, name: "UPS" },
          { id: 2, name: "DHL" },
          { id: 3, name: "空运" },
          { id: 4, name: "海运" },
        ];
        setChannels(mockChannels);
        setTimeliness(
          mockChannels.map((ch) => ({
            channelId: ch.id,
            channelName: ch.name,
            promisedTime: "",
            actualTime: "",
            achievementRate: null,
            reason: "",
          }))
        );
      });

    // Load carry-over issues from previous week
    fetch("/api/weekly-reports")
      .then((res) => res.json())
      .then((data: unknown) => {
        const reports = data as { id: number }[];
        if (Array.isArray(reports) && reports.length > 0) {
          const latestReport = reports[0];
          return fetch(`/api/weekly-reports/${latestReport.id}`);
        }
        return null;
      })
      .then((res) => res?.json())
      .then((data: unknown) => {
        const reportData = data as Record<string, unknown> | null;
        if (reportData?.issues && Array.isArray(reportData.issues)) {
          const openIssues = (reportData.issues as { status: string }[]).filter(
            (i) => i.status === "open"
          );
          if (openIssues.length > 0) {
            setIssues(
              openIssues.map((i: Record<string, unknown>) => ({
                description: (i.description as string) || "",
                assignee: (i.assignee as string) || "",
                solution: (i.solution as string) || "",
                difficulty: (i.difficulty as string) || "",
                progress: (i.progress as string) || "",
                status: "open" as const,
                carryOver: 1,
                sourceIssueId: i.id as number,
              }))
            );
          }
        }
      })
      .catch(() => {
        // No carry-over issues
      });
  }, []);

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
      const res = await fetch("/api/weekly-reports", {
        method: "POST",
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
          })),
          members: members.map((m) => ({
            memberName: m.memberName,
            color: m.color,
            contentBlocks: JSON.stringify(m.contentBlocks),
          })),
        }),
      });

      if (res.ok) {
        router.push("/weekly-reports");
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
            <h1 className="text-2xl font-semibold">新建周报</h1>
            <p className="text-sm text-muted-foreground">
              {year}年第{weekNumber}周
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <SaveIcon className="size-4" />
          {saving ? "保存中..." : "保存周报"}
        </Button>
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
              <Input value={year} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">周数</Label>
              <Input value={weekNumber} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">开始日期</Label>
              <Input value={startDate} readOnly className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">结束日期</Label>
              <Input value={endDate} readOnly className="h-8 mt-1" />
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
          <IssueTracker data={issues} onChange={setIssues} />
        </CardContent>
      </Card>

      {/* Notes and Plans */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">本周总结</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={thisWeekNotes}
              onChange={(e) => setThisWeekNotes(e.target.value)}
              placeholder="本周工作总结..."
              rows={6}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">下周计划</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={nextWeekPlan}
              onChange={(e) => setNextWeekPlan(e.target.value)}
              placeholder="下周工作计划..."
              rows={6}
            />
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
          {members.map((member, index) => (
            <MemberSection
              key={index}
              member={member}
              onChange={(m) => updateMember(index, m)}
              onRemove={() => removeMember(index)}
            />
          ))}
          {members.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              添加成员以开始编辑成员周报
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
