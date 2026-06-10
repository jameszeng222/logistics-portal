"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Shipment {
  id: number
  shipmentDate: string
  brand: string
  channel: string
  provider: string
  destination: string
  trackingNo: string | null
  pieces: number
  actualWeight: number | null
  volWeight: number | null
  chargeWeight: number | null
  freightCost: number | null
  extraCost: number | null
  totalCost: number | null
  currency: string | null
  remark: string | null
}

interface ShipmentTableProps {
  data: Shipment[]
  onDelete: (id: number) => void
}

export function ShipmentTable({ data, onDelete }: ShipmentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日期</TableHead>
          <TableHead>品牌</TableHead>
          <TableHead>渠道</TableHead>
          <TableHead>服务商</TableHead>
          <TableHead>目的地</TableHead>
          <TableHead>追踪号</TableHead>
          <TableHead className="text-right">件数</TableHead>
          <TableHead className="text-right">实重(kg)</TableHead>
          <TableHead className="text-right">计费重(kg)</TableHead>
          <TableHead className="text-right">运费</TableHead>
          <TableHead>备注</TableHead>
          <TableHead className="w-20">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
              暂无发货记录
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.shipmentDate}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.channel}</TableCell>
              <TableCell>{item.provider}</TableCell>
              <TableCell>{item.destination}</TableCell>
              <TableCell>{item.trackingNo || "-"}</TableCell>
              <TableCell className="text-right">{item.pieces}</TableCell>
              <TableCell className="text-right">{item.actualWeight ?? "-"}</TableCell>
              <TableCell className="text-right">{item.chargeWeight ?? "-"}</TableCell>
              <TableCell className="text-right">
                {item.totalCost != null ? `${item.currency === "USD" ? "$" : "¥"}${item.totalCost.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="max-w-[120px] truncate">{item.remark || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/shipments/${item.id}`}>
                    <Button variant="ghost" size="icon-xs"><Pencil className="size-3" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete(item.id)}>
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
