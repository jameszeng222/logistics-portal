"use client";

import { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface CompareGroup {
  groupKey: string;
  groupLabel: string;
  items: {
    label: string;
    price: number;
    extra?: Record<string, number>;
    total?: number;
  }[];
}

interface PriceCompareProps {
  data: CompareGroup[];
  highlightLowest?: boolean;
}

export function PriceCompare({
  data,
  highlightLowest = true,
}: PriceCompareProps) {
  const processed = useMemo(() => {
    return data.map((group) => {
      const itemsWithTotal = group.items.map((item) => ({
        ...item,
        total:
          item.total ??
          item.price + Object.values(item.extra ?? {}).reduce((s, v) => s + v, 0),
      }));
      const lowestTotal = Math.min(...itemsWithTotal.map((i) => i.total));
      return { ...group, items: itemsWithTotal, lowestTotal };
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        请选择筛选条件查看价格对比
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {processed.map((group) => (
        <div key={group.groupKey}>
          <h3 className="mb-2 text-sm font-medium">{group.groupLabel}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>来源</TableHead>
                <TableHead>单价</TableHead>
                {group.items[0]?.extra &&
                  Object.keys(group.items[0].extra).map((k) => (
                    <TableHead key={k}>{k}</TableHead>
                  ))}
                <TableHead>合计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.items.map((item, idx) => {
                const isLowest =
                  highlightLowest && item.total === group.lowestTotal;
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      {item.label}
                      {isLowest && (
                        <Badge variant="secondary" className="ml-2">
                          最低
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        isLowest ? "font-semibold text-green-600" : ""
                      }
                    >
                      ¥{item.price.toFixed(2)}
                    </TableCell>
                    {item.extra &&
                      Object.values(item.extra).map((v, i) => (
                        <TableCell
                          key={i}
                          className={
                            isLowest ? "font-semibold text-green-600" : ""
                          }
                        >
                          ¥{v.toFixed(2)}
                        </TableCell>
                      ))}
                    <TableCell
                      className={
                        isLowest
                          ? "font-bold text-green-600"
                          : ""
                      }
                    >
                      ¥{item.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
