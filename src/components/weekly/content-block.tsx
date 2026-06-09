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
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react";
import type { ContentBlockData } from "./member-section";

interface ContentBlockProps {
  block: ContentBlockData;
  onChange: (block: ContentBlockData) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

export function ContentBlock({
  block,
  onChange,
  onRemove,
  readOnly = false,
}: ContentBlockProps) {
  const updateTitle = (title: string) => {
    onChange({ ...block, title });
  };

  if (block.type === "table") {
    return (
      <TableBlock
        block={block}
        onChange={onChange}
        onRemove={onRemove}
        readOnly={readOnly}
        updateTitle={updateTitle}
      />
    );
  }

  return (
    <ListBlock
      block={block}
      onChange={onChange}
      onRemove={onRemove}
      readOnly={readOnly}
      updateTitle={updateTitle}
    />
  );
}

function TableBlock({
  block,
  onChange,
  onRemove,
  readOnly,
  updateTitle,
}: ContentBlockProps & { updateTitle: (t: string) => void }) {
  const columns = block.columns || ["列1", "列2"];
  const rows = block.rows || [["", ""]];

  const updateColumn = (colIndex: number, value: string) => {
    const newCols = [...columns];
    newCols[colIndex] = value;
    onChange({ ...block, columns: newCols });
  };

  const addColumn = () => {
    onChange({
      ...block,
      columns: [...columns, `列${columns.length + 1}`],
      rows: rows.map((r) => [...r, ""]),
    });
  };

  const removeColumn = (colIndex: number) => {
    if (columns.length <= 1) return;
    onChange({
      ...block,
      columns: columns.filter((_, i) => i !== colIndex),
      rows: rows.map((r) => r.filter((_, i) => i !== colIndex)),
    });
  };

  const addRow = () => {
    onChange({
      ...block,
      rows: [...rows, new Array(columns.length).fill("")],
    });
  };

  const removeRow = (rowIndex: number) => {
    onChange({
      ...block,
      rows: rows.filter((_, i) => i !== rowIndex),
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((r, i) =>
      i === rowIndex
        ? r.map((c, j) => (j === colIndex ? value : c))
        : r
    );
    onChange({ ...block, rows: newRows });
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <Badge variant="outline" className="text-[10px]">
          表格
        </Badge>
        {readOnly ? (
          <span className="text-sm font-medium">{block.title}</span>
        ) : (
          <Input
            value={block.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="h-6 text-xs border-0 bg-transparent focus-visible:ring-0 px-1"
          />
        )}
        <div className="flex-1" />
        {!readOnly && (
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <TrashIcon className="size-3.5 text-destructive" />
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, colIndex) => (
              <TableHead key={colIndex} className="h-8">
                {readOnly ? (
                  col
                ) : (
                  <div className="flex items-center gap-1">
                    <Input
                      value={col}
                      onChange={(e) => updateColumn(colIndex, e.target.value)}
                      className="h-6 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                    {columns.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0"
                        onClick={() => removeColumn(colIndex)}
                      >
                        <TrashIcon className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                )}
              </TableHead>
            ))}
            {!readOnly && <TableHead className="w-[40px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, colIndex) => (
                <TableCell key={colIndex}>
                  {readOnly ? (
                    <span className="text-xs">{cell || "-"}</span>
                  ) : (
                    <Input
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                      className="h-7 text-xs"
                      placeholder="..."
                    />
                  )}
                </TableCell>
              ))}
              {!readOnly && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <TrashIcon className="size-3 text-muted-foreground" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!readOnly && (
        <div className="flex gap-1 px-3 py-2 border-t">
          <Button variant="ghost" size="xs" onClick={addRow}>
            <PlusIcon className="size-3" />
            添加行
          </Button>
          <Button variant="ghost" size="xs" onClick={addColumn}>
            <PlusIcon className="size-3" />
            添加列
          </Button>
        </div>
      )}
    </div>
  );
}

function ListBlock({
  block,
  onChange,
  onRemove,
  readOnly,
  updateTitle,
}: ContentBlockProps & { updateTitle: (t: string) => void }) {
  const items = block.items || [""];

  const updateItem = (index: number, value: string) => {
    const newItems = items.map((item, i) => (i === index ? value : item));
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    onChange({ ...block, items: [...items, ""] });
  };

  const removeItem = (index: number) => {
    onChange({ ...block, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <Badge variant="outline" className="text-[10px]">
          列表
        </Badge>
        {readOnly ? (
          <span className="text-sm font-medium">{block.title}</span>
        ) : (
          <Input
            value={block.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="h-6 text-xs border-0 bg-transparent focus-visible:ring-0 px-1"
          />
        )}
        <div className="flex-1" />
        {!readOnly && (
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <TrashIcon className="size-3.5 text-destructive" />
          </Button>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
              {index + 1}.
            </span>
            {readOnly ? (
              <span className="text-sm">{item || "-"}</span>
            ) : (
              <>
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  className="h-7 text-xs"
                  placeholder="输入内容..."
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeItem(index)}
                  className="shrink-0"
                >
                  <TrashIcon className="size-3 text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button variant="ghost" size="xs" onClick={addItem} className="ml-7">
            <PlusIcon className="size-3" />
            添加条目
          </Button>
        )}
      </div>
    </div>
  );
}
