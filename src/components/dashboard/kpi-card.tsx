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
        "rounded-2xl bg-card p-6",
        className
      )}
    >
      <p className="text-[11px] font-light text-muted-foreground/60 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-3xl font-extralight text-foreground/80 tracking-tight">
          {value}
        </span>
        {trend && trendValue && (
          <span
            className={cn(
              "text-[11px] font-light",
              trend === "up" && "text-muted-foreground/50",
              trend === "down" && "text-accent",
              trend === "flat" && "text-muted-foreground/30"
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
        <p className="text-[11px] text-muted-foreground/40 mt-2 font-light">{description}</p>
      )}
    </div>
  );
}
