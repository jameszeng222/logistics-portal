"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ScoreRow {
  providerName: string;
  channelId?: number;
  timelinessScore: number;
  inspectionScore: number;
  priceScore: number;
  totalScore: number;
  grade: string;
}

interface ScoreTableProps {
  data: ScoreRow[];
  title?: string;
}

function gradeVariant(grade: string) {
  switch (grade) {
    case "A":
      return "default" as const;
    case "B":
      return "secondary" as const;
    case "C":
      return "outline" as const;
    case "D":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function gradeColor(grade: string) {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    case "C":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    case "D":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    default:
      return "";
  }
}

export function ScoreTable({ data, title = "综合评分排名" }: ScoreTableProps) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...data].sort((a, b) =>
    sortDir === "desc" ? b.totalScore - a.totalScore : a.totalScore - b.totalScore
  );

  const toggleSort = () => setSortDir((d) => (d === "desc" ? "asc" : "desc"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排名</TableHead>
              <TableHead>服务商</TableHead>
              <TableHead className="text-right">时效得分</TableHead>
              <TableHead className="text-right">验货得分</TableHead>
              <TableHead className="text-right">价格得分</TableHead>
              <TableHead
                className="cursor-pointer text-right select-none"
                onClick={toggleSort}
              >
                总分 {sortDir === "desc" ? "↓" : "↑"}
              </TableHead>
              <TableHead className="text-center">等级</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  暂无评分数据
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, idx) => (
                <TableRow key={`${row.providerName}-${row.channelId ?? ""}`}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>{row.providerName}</TableCell>
                  <TableCell className="text-right">{row.timelinessScore}</TableCell>
                  <TableCell className="text-right">{row.inspectionScore}</TableCell>
                  <TableCell className="text-right">{row.priceScore}</TableCell>
                  <TableCell className="text-right font-semibold">{row.totalScore}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={gradeColor(row.grade)}>{row.grade}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
