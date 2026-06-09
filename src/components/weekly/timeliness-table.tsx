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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";

export interface TimelinessRow {
  id?: number;
  channelId: number | null;
  channelName?: string;
  promisedTime: string;
  actualTime: string;
  achievementRate: number | null;
  reason: string;
}

interface TimelinessTableProps {
  data: TimelinessRow[];
  onChange: (data: TimelinessRow[]) => void;
  channels: { id: number; name: string }[];
  readOnly?: boolean;
}

export function TimelinessTable({
  data,
  onChange,
  channels,
  readOnly = false,
}: TimelinessTableProps) {
  const addRow = () => {
    onChange([
      ...data,
      {
        channelId: null,
        promisedTime: "",
        actualTime: "",
        achievementRate: null,
        reason: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof TimelinessRow, value: unknown) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">渠道</TableHead>
            <TableHead className="w-[120px]">承诺时效</TableHead>
            <TableHead className="w-[120px]">实际时效</TableHead>
            <TableHead className="w-[100px]">达标率</TableHead>
            <TableHead>原因说明</TableHead>
            {!readOnly && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={readOnly ? 5 : 6}
                className="text-center text-muted-foreground py-6"
              >
                暂无时效数据，点击下方按钮添加
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {readOnly ? (
                    row.channelName || "-"
                  ) : (
                    <Select
                      value={row.channelId?.toString() ?? ""}
                      onValueChange={(val) =>
                        updateRow(index, "channelId", val ? Number(val) : null)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择渠道" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id.toString()}>
                            {ch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.promisedTime || "-"
                  ) : (
                    <Input
                      value={row.promisedTime}
                      onChange={(e) =>
                        updateRow(index, "promisedTime", e.target.value)
                      }
                      placeholder="如: 3天"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.actualTime || "-"
                  ) : (
                    <Input
                      value={row.actualTime}
                      onChange={(e) =>
                        updateRow(index, "actualTime", e.target.value)
                      }
                      placeholder="如: 4天"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.achievementRate !== null
                      ? `${row.achievementRate}%`
                      : "-"
                  ) : (
                    <Input
                      type="number"
                      value={row.achievementRate ?? ""}
                      onChange={(e) =>
                        updateRow(
                          index,
                          "achievementRate",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="%"
                      className="h-7 text-xs w-20"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.reason || "-"
                  ) : (
                    <Input
                      value={row.reason}
                      onChange={(e) =>
                        updateRow(index, "reason", e.target.value)
                      }
                      placeholder="原因说明"
                      className="h-7 text-xs"
                    />
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
          添加渠道
        </Button>
      )}
    </div>
  );
}
