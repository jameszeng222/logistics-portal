import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  trend,
  trendValue,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow duration-300",
        className
      )}
    >
      <p className="text-xs font-normal text-stone-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-light text-stone-800 tracking-tight">
          {value}
        </span>
        {trend && trendValue && (
          <span
            className={cn(
              "text-xs font-normal",
              trend === "up" && "text-stone-400",
              trend === "down" && "text-[#5f8a7e]",
              trend === "flat" && "text-stone-300"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "flat" && "→"}
            {trendValue}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-stone-400 mt-1.5">{description}</p>
      )}
    </div>
  );
}
