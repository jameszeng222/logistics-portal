"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type TimeRange = "month" | "quarter" | "year";

interface FiltersProps {
  brands: string[];
  selectedBrands: string[];
  timeRange: TimeRange;
  onBrandsChange: (brands: string[]) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "month", label: "本月" },
  { value: "quarter", label: "本季" },
  { value: "year", label: "本年" },
];

export function Filters({
  brands,
  selectedBrands,
  timeRange,
  onBrandsChange,
  onTimeRangeChange,
}: FiltersProps) {
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandsChange(selectedBrands.filter((b) => b !== brand));
    } else {
      onBrandsChange([...selectedBrands, brand]);
    }
  };

  const selectAllBrands = () => {
    onBrandsChange([...brands]);
  };

  const clearBrands = () => {
    onBrandsChange([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Time range selector */}
      <div className="flex items-center gap-1">
        {timeRangeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={`h-7 px-3 text-xs ${
              timeRange === opt.value
                ? "bg-accent/8 text-accent border border-accent/15"
                : ""
            }`}
            onClick={() => onTimeRangeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Brand multi-select */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs border-border/50 bg-transparent hover:bg-secondary/60 text-muted-foreground rounded-xl"
          onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
        >
          品牌
          {selectedBrands.length > 0 && (
            <span className="ml-1 rounded-full bg-accent/8 px-1.5 py-0.5 text-[10px] text-accent">
              {selectedBrands.length}
            </span>
          )}
        </Button>

        {brandDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setBrandDropdownOpen(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-xl border border-border/40 bg-white/95 p-2 shadow-none">
              <div className="mb-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-muted-foreground/60"
                  onClick={selectAllBrands}
                >
                  全选
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-muted-foreground/60"
                  onClick={clearBrands}
                >
                  清空
                </Button>
              </div>
              <div className="space-y-0.5">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-foreground/80 hover:bg-secondary/60"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-border/40"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
