"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShipmentFormProps {
  initialData?: Record<string, unknown>
  mode: "create" | "edit"
}

const BRANDS = ["LM", "LM-TT", "FD", "FD-TT"]
const CHANNELS = ["UPS", "空运", "海运"]

export function ShipmentForm({ initialData, mode }: ShipmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    shipmentDate: (initialData?.shipmentDate as string) || "",
    brand: (initialData?.brand as string) || "",
    channel: (initialData?.channel as string) || "",
    provider: (initialData?.provider as string) || "",
    destination: (initialData?.destination as string) || "",
    trackingNo: (initialData?.trackingNo as string) || "",
    pieces: (initialData?.pieces as number) || 0,
    actualWeight: (initialData?.actualWeight as number) || 0,
    volWeight: (initialData?.volWeight as number) || 0,
    chargeWeight: (initialData?.chargeWeight as number) || 0,
    freightCost: (initialData?.freightCost as number) || 0,
    extraCost: (initialData?.extraCost as number) || 0,
    totalCost: (initialData?.totalCost as number) || 0,
    currency: (initialData?.currency as string) || "CNY",
    remark: (initialData?.remark as string) || "",
  })

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = mode === "create" ? "/api/shipments" : `/api/shipments/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) {
        router.push("/shipments")
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.error || "操作失败")
      }
    } catch {
      alert("网络错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">发货日期 *</label>
          <Input type="date" value={form.shipmentDate} onChange={(e) => updateField("shipmentDate", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">品牌 *</label>
          <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)} required className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="">选择品牌</option>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">渠道 *</label>
          <select value={form.channel} onChange={(e) => updateField("channel", e.target.value)} required className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="">选择渠道</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">服务商 *</label>
          <Input value={form.provider} onChange={(e) => updateField("provider", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">目的地 *</label>
          <Input value={form.destination} onChange={(e) => updateField("destination", e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">追踪号</label>
          <Input value={form.trackingNo} onChange={(e) => updateField("trackingNo", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">件数 *</label>
          <Input type="number" value={form.pieces || ""} onChange={(e) => updateField("pieces", Number(e.target.value))} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">实重 (kg)</label>
          <Input type="number" step="0.1" value={form.actualWeight || ""} onChange={(e) => updateField("actualWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">体积重 (kg)</label>
          <Input type="number" step="0.1" value={form.volWeight || ""} onChange={(e) => updateField("volWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">计费重量 (kg)</label>
          <Input type="number" step="0.1" value={form.chargeWeight || ""} onChange={(e) => updateField("chargeWeight", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">运费</label>
          <Input type="number" step="0.01" value={form.freightCost || ""} onChange={(e) => updateField("freightCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">附加费</label>
          <Input type="number" step="0.01" value={form.extraCost || ""} onChange={(e) => updateField("extraCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">总费用</label>
          <Input type="number" step="0.01" value={form.totalCost || ""} onChange={(e) => updateField("totalCost", Number(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">币种</label>
          <select value={form.currency} onChange={(e) => updateField("currency", e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className="text-[11px] text-muted-foreground">备注</label>
          <Input value={form.remark} onChange={(e) => updateField("remark", e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "提交中..." : mode === "create" ? "新增" : "保存"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  )
}
