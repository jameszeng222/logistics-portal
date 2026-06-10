"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const COLUMN_MAP: Record<string, string> = {
  "发货日期": "shipmentDate", "日期": "shipmentDate",
  "品牌": "brand", "渠道": "channel", "服务商": "provider",
  "目的地": "destination", "追踪号": "trackingNo",
  "件数": "pieces", "实重": "actualWeight", "实重kg": "actualWeight",
  "体积重": "volWeight", "体积重kg": "volWeight",
  "计费重": "chargeWeight", "计费重kg": "chargeWeight",
  "运费": "freightCost", "附加费": "extraCost",
  "总费用": "totalCost", "币种": "currency", "备注": "remark",
}

const PREVIEW_COLS = ["shipmentDate", "brand", "channel", "provider", "destination", "pieces", "trackingNo", "freightCost", "remark"]
const COL_LABELS: Record<string, string> = {
  shipmentDate: "日期", brand: "品牌", channel: "渠道", provider: "服务商",
  destination: "目的地", pieces: "件数", trackingNo: "追踪号", freightCost: "运费", remark: "备注",
}

export default function ImportPage() {
  const [parsed, setParsed] = useState<Record<string, unknown>[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ count: number } | null>(null)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws)

      const mapped = raw.map((row) => {
        const out: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(row)) {
          const mappedKey = COLUMN_MAP[key] || key
          out[mappedKey] = val
        }
        return out
      })

      setParsed(mapped)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch("/api/shipments/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsed }),
      })
      const json = await res.json()
      if (res.ok) {
        setResult({ count: json.count })
      } else {
        alert(json.error || "导入失败")
      }
    } catch {
      alert("网络错误")
    } finally {
      setImporting(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">批量导入</h1>
        <div className="rounded-2xl bg-card p-8 text-center">
          <p className="text-lg font-light text-foreground">成功导入 {result.count} 条记录</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/shipments"><Button>查看发货台账</Button></Link>
            <Link href="/shipments/import"><Button variant="outline">继续导入</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">批量导入</h1>

      {parsed.length === 0 ? (
        <div className="rounded-2xl bg-card p-8">
          <label className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-border py-12 hover:border-accent/40 transition-colors">
            <span className="text-sm text-muted-foreground">点击或拖拽上传 Excel 文件 (.xlsx)</span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }} />
          </label>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>支持的列名：发货日期、品牌、渠道、服务商、目的地、追踪号、件数、实重、体积重、计费重、运费、附加费、总费用、币种、备注</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">预览 {parsed.length} 条记录</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setParsed([])}>重新选择</Button>
              <Button size="sm" onClick={handleImport} disabled={importing}>
                {importing ? "导入中..." : "确认导入"}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-card overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {PREVIEW_COLS.map((col) => <TableHead key={col}>{COL_LABELS[col]}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      {PREVIEW_COLS.map((col) => <TableCell key={col}>{String(row[col] ?? "")}</TableCell>)}
                    </TableRow>
                  ))}
                  {parsed.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={PREVIEW_COLS.length} className="text-center text-muted-foreground">
                        还有 {parsed.length - 20} 条未显示...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
