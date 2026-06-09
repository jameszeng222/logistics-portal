"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  SearchIcon,
  CalendarIcon,
  AlertCircleIcon,
  UsersIcon,
} from "lucide-react";

interface WeeklyReportSummary {
  id: number;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  timelinessCount: number;
  issueCount: number;
  openIssueCount: number;
  memberCount: number;
}

// Mock data for initial display
const mockReports: WeeklyReportSummary[] = [
  {
    id: 1,
    weekNumber: 23,
    year: 2026,
    startDate: "2026-06-02",
    endDate: "2026-06-08",
    timelinessCount: 4,
    issueCount: 3,
    openIssueCount: 1,
    memberCount: 5,
  },
  {
    id: 2,
    weekNumber: 22,
    year: 2026,
    startDate: "2026-05-26",
    endDate: "2026-06-01",
    timelinessCount: 4,
    issueCount: 5,
    openIssueCount: 2,
    memberCount: 5,
  },
  {
    id: 3,
    weekNumber: 21,
    year: 2026,
    startDate: "2026-05-19",
    endDate: "2026-05-25",
    timelinessCount: 3,
    issueCount: 2,
    openIssueCount: 0,
    memberCount: 4,
  },
];

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<WeeklyReportSummary[]>(mockReports);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly-reports")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
        }
      })
      .catch(() => {
        // Use mock data on error
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(
    (r) =>
      !search ||
      `${r.year}年第${r.weekNumber}周`.includes(search) ||
      r.weekNumber.toString().includes(search) ||
      r.year.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extralight tracking-tight text-foreground/80">周报管理</h1>
          <p className="text-sm text-muted-foreground/50 font-light mt-1">
            管理物流部周报，追踪时效达成和重点问题
          </p>
        </div>
        <Link href="/weekly-reports/new">
          <Button
            variant="outline"
            className="h-9 rounded-xl border-border/50 bg-transparent hover:bg-secondary/60 text-muted-foreground"
          >
            <PlusIcon className="size-3.5" />
            新建周报
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-300" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索周数或年份..."
          className="h-9 rounded-xl border-border/50 bg-white/80 pl-8 text-foreground/80 font-light placeholder:text-muted-foreground/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <CalendarIcon className="size-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">暂无周报记录</p>
          <Link href="/weekly-reports/new">
            <Button variant="outline" className="mt-3 h-9 rounded-xl border-border/50 bg-transparent hover:bg-secondary/60 text-muted-foreground">
              创建第一份周报
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <Link key={report.id} href={`/weekly-reports/${report.id}`}>
              <Card className="border-border/30 shadow-none hover:shadow-none transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-normal text-stone-700">
                    <CalendarIcon className="size-3.5 text-stone-400" />
                    {report.year}年第{report.weekNumber}周
                  </CardTitle>
                  <CardDescription className="text-xs text-stone-400">
                    {report.startDate} ~ {report.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <AlertCircleIcon className="size-3 text-stone-300" />
                      <span>
                        {report.issueCount} 个问题
                      </span>
                      {report.openIssueCount > 0 && (
                        <Badge variant="destructive" className="text-[10px] px-1 rounded">
                          {report.openIssueCount} 未解决
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="size-3 text-stone-300" />
                      <span>{report.memberCount} 人</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
