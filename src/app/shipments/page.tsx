"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ShipmentTable } from "@/components/shipments/shipment-table"
import { ShipmentFilters } from "@/components/shipments/shipment-filters"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function ShipmentsPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    startDate: "", endDate: "", brand: "", channel: "", provider: "", trackingNo: "",
  })

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("page_size", "20")
    if (filters.startDate) params.set("start_date", filters.startDate)
    if (filters.endDate) params.set("end_date", filters.endDate)
    if (filters.brand) params.set("brand", filters.brand)
    if (filters.channel) params.set("channel", filters.channel)
    if (filters.provider) params.set("provider", filters.provider)
    if (filters.trackingNo) params.set("tracking_no", filters.trackingNo)

    const res = await fetch(`/api/shipments?${params}`)
    const json = await res.json() as Record<string, any>
    setData(json.data || [])
    setTotal(json.total || 0)
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此记录？")) return
    await fetch(`/api/shipments/${id}`, { method: "DELETE" })
    fetchData()
  }

  const resetFilters = () => {
    setFilters({ startDate: "", endDate: "", brand: "", channel: "", provider: "", trackingNo: "" })
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">发货台账</h1>
        <div className="flex gap-2">
          <Link href="/shipments/import">
            <Button variant="outline" size="sm"><Upload className="size-4 mr-1" />批量导入</Button>
          </Link>
          <Link href="/shipments/new">
            <Button size="sm"><Plus className="size-4 mr-1" />新增记录</Button>
          </Link>
        </div>
      </div>

      <ShipmentFilters
        startDate={filters.startDate} endDate={filters.endDate}
        brand={filters.brand} channel={filters.channel}
        provider={filters.provider} trackingNo={filters.trackingNo}
        onStartDateChange={(v) => setFilters((p) => ({ ...p, startDate: v }))}
        onEndDateChange={(v) => setFilters((p) => ({ ...p, endDate: v }))}
        onBrandChange={(v) => setFilters((p) => ({ ...p, brand: v }))}
        onChannelChange={(v) => setFilters((p) => ({ ...p, channel: v }))}
        onProviderChange={(v) => setFilters((p) => ({ ...p, provider: v }))}
        onTrackingNoChange={(v) => setFilters((p) => ({ ...p, trackingNo: v }))}
        onSearch={() => { setPage(1); fetchData(); }}
        onReset={resetFilters}
      />

      <ShipmentTable data={data} onDelete={handleDelete} />

      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>共 {total} 条</span>
          <div className="flex gap-2">
            <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
            <Button variant="outline" size="xs" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>下一页</Button>
          </div>
        </div>
      )}
    </div>
  )
}
