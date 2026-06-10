import { ShipmentForm } from "@/components/shipments/shipment-form"

export default function NewShipmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">新增发货记录</h1>
      <div className="rounded-2xl bg-card p-6">
        <ShipmentForm mode="create" />
      </div>
    </div>
  )
}
