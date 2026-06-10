"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShipmentFiltersProps {
  startDate: string
  endDate: string
  brand: string
  channel: string
  provider: string
  trackingNo: string
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onBrandChange: (v: string) => void
  onChannelChange: (v: string) => void
  onProviderChange: (v: string) => void
  onTrackingNoChange: (v: string) => void
  onSearch: () => void
  onReset: () => void
}

const BRANDS = ["LM", "LM-TT", "FD", "FD-TT"]
const CHANNELS = ["UPS", "空运", "海运"]

export function ShipmentFilters({
  startDate, endDate, brand, channel, provider, trackingNo,
  onStartDateChange, onEndDateChange, onBrandChange, onChannelChange,
  onProviderChange, onTrackingNoChange, onSearch, onReset,
}: ShipmentFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">开始日期</label>
        <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="w-36" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">结束日期</label>
        <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="w-36" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">品牌</label>
        <select value={brand} onChange={(e) => onBrandChange(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
          <option value="">全部</option>
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">渠道</label>
        <select value={channel} onChange={(e) => onChannelChange(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
          <option value="">全部</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">服务商</label>
        <Input value={provider} onChange={(e) => onProviderChange(e.target.value)} placeholder="服务商名" className="w-28" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">追踪号</label>
        <Input value={trackingNo} onChange={(e) => onTrackingNoChange(e.target.value)} placeholder="追踪号" className="w-32" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSearch}>查询</Button>
        <Button size="sm" variant="outline" onClick={onReset}>重置</Button>
      </div>
    </div>
  )
}
