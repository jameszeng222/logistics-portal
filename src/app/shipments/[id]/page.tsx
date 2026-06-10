"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ShipmentForm } from "@/components/shipments/shipment-form"

export default function EditShipmentPage() {
  const params = useParams()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/shipments/${params.id}`)
      .then((res) => res.json() as Promise<Record<string, any>>)
      .then((json) => setData(json.data))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-muted-foreground">加载中...</div>
  if (!data) return <div className="text-muted-foreground">记录不存在</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">编辑发货记录</h1>
      <div className="rounded-2xl bg-card p-6">
        <ShipmentForm mode="edit" initialData={data} />
      </div>
    </div>
  )
}
