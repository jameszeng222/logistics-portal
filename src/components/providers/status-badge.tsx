"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: {
    label: "合作中",
    className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  paused: {
    label: "暂停",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  terminated: {
    label: "终止",
    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "",
  };

  return (
    <Badge variant="outline" className={`${config.className} ${className ?? ""}`}>
      {config.label}
    </Badge>
  );
}
