"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface Template {
  id: number
  name: string
  type: string
  isDefault: number
}

const TYPE_LABELS: Record<string, string> = {
  packing_list: "装箱单",
  commercial_invoice: "商业发票",
  customs: "报关草单",
  forwarder_invoice: "货代发票",
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState("packing_list")

  const fetchTemplates = async () => {
    const res = await fetch("/api/documents/templates")
    const json = await res.json()
    setTemplates(json.data || [])
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleCreate = async () => {
    if (!name) return
    await fetch("/api/documents/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, fields: [] }),
    })
    setName("")
    fetchTemplates()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此模板？")) return
    await fetch(`/api/documents/templates/${id}`, { method: "DELETE" })
    fetchTemplates()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">模板管理</h1>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">模板名称</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入模板名称" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">类型</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground">
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={handleCreate}>新建模板</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{t.name}</CardTitle>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{TYPE_LABELS[t.type] || t.type}</p>
              {t.isDefault === 1 && <p className="text-xs text-accent mt-1">默认模板</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
