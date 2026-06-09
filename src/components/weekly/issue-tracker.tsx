"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";

export interface IssueRow {
  id?: number;
  description: string;
  assignee: string;
  solution: string;
  difficulty: string;
  progress: string;
  status: "open" | "completed";
  carryOver?: number;
  sourceIssueId?: number | null;
}

interface IssueTrackerProps {
  data: IssueRow[];
  onChange: (data: IssueRow[]) => void;
  readOnly?: boolean;
}

export function IssueTracker({
  data,
  onChange,
  readOnly = false,
}: IssueTrackerProps) {
  const addRow = () => {
    onChange([
      ...data,
      {
        description: "",
        assignee: "",
        solution: "",
        difficulty: "",
        progress: "",
        status: "open",
        carryOver: 0,
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof IssueRow, value: unknown) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>问题描述</TableHead>
            <TableHead className="w-[100px]">责任人</TableHead>
            <TableHead className="w-[140px]">方案</TableHead>
            <TableHead className="w-[100px]">难点</TableHead>
            <TableHead className="w-[120px]">解决进展</TableHead>
            <TableHead className="w-[90px]">状态</TableHead>
            {!readOnly && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={readOnly ? 7 : 8}
                className="text-center text-muted-foreground py-6"
              >
                暂无问题记录
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {row.carryOver ? (
                    <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                      上周带入
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span
                      className={
                        row.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {row.description || "-"}
                    </span>
                  ) : (
                    <Input
                      value={row.description}
                      onChange={(e) =>
                        updateRow(index, "description", e.target.value)
                      }
                      placeholder="问题描述"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span
                      className={
                        row.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {row.assignee || "-"}
                    </span>
                  ) : (
                    <Input
                      value={row.assignee}
                      onChange={(e) =>
                        updateRow(index, "assignee", e.target.value)
                      }
                      placeholder="责任人"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span
                      className={
                        row.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {row.solution || "-"}
                    </span>
                  ) : (
                    <Input
                      value={row.solution}
                      onChange={(e) =>
                        updateRow(index, "solution", e.target.value)
                      }
                      placeholder="方案"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span
                      className={
                        row.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {row.difficulty || "-"}
                    </span>
                  ) : (
                    <Input
                      value={row.difficulty}
                      onChange={(e) =>
                        updateRow(index, "difficulty", e.target.value)
                      }
                      placeholder="难点"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span
                      className={
                        row.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {row.progress || "-"}
                    </span>
                  ) : (
                    <Input
                      value={row.progress}
                      onChange={(e) =>
                        updateRow(index, "progress", e.target.value)
                      }
                      placeholder="解决进展"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <Badge
                      variant={
                        row.status === "completed" ? "secondary" : "destructive"
                      }
                    >
                      {row.status === "completed" ? "已完成" : "进行中"}
                    </Badge>
                  ) : (
                    <Select
                      value={row.status}
                      onValueChange={(val) =>
                        updateRow(index, "status", val)
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeRow(index)}
                    >
                      <TrashIcon className="size-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!readOnly && (
        <Button variant="outline" size="sm" onClick={addRow}>
          <PlusIcon className="size-3.5" />
          添加问题
        </Button>
      )}
    </div>
  );
}
