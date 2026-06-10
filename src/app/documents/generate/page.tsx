"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { PackingListPDF } from "@/components/documents/packing-list-pdf"
import { CommercialInvoicePDF } from "@/components/documents/commercial-invoice-pdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type DocType = "packing_list" | "commercial_invoice"

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "packing_list", label: "装箱单 Packing List" },
  { value: "commercial_invoice", label: "商业发票 Commercial Invoice" },
]

export default function GenerateDocumentPage() {
  const [docType, setDocType] = useState<DocType>("packing_list")
  const [generating, setGenerating] = useState(false)

  const [plData, setPlData] = useState({
    shipperName: "", shipperAddress: "", shipperContact: "",
    consigneeName: "", consigneeAddress: "", consigneeContact: "",
    invoiceNo: "", date: new Date().toISOString().slice(0, 10),
  })

  const [ciData, setCiData] = useState({
    sellerName: "", sellerAddress: "",
    buyerName: "", buyerAddress: "",
    invoiceNo: "", date: new Date().toISOString().slice(0, 10),
    terms: "FOB", currency: "USD",
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let blob: Blob
      if (docType === "packing_list") {
        blob = await pdf(<PackingListPDF data={{
          shipper: { name: plData.shipperName, address: plData.shipperAddress, contact: plData.shipperContact },
          consignee: { name: plData.consigneeName, address: plData.consigneeAddress, contact: plData.consigneeContact },
          invoiceNo: plData.invoiceNo, date: plData.date,
          items: [{ cartonNo: 1, description: "Sample", qty: 1, gw: 0, nw: 0, length: 0, width: 0, height: 0 }],
        }} />).toBlob()
      } else {
        blob = await pdf(<CommercialInvoicePDF data={{
          seller: { name: ciData.sellerName, address: ciData.sellerAddress },
          buyer: { name: ciData.buyerName, address: ciData.buyerAddress },
          invoiceNo: ciData.invoiceNo, date: ciData.date,
          terms: ciData.terms, currency: ciData.currency,
          items: [{ no: 1, description: "Sample", qty: 1, unitPrice: 0, amount: 0 }],
        }} />).toBlob()
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${docType === "packing_list" ? "Packing_List" : "Commercial_Invoice"}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("生成失败")
    } finally {
      setGenerating(false)
    }
  }

  const inputClass = "flex flex-col gap-1"
  const labelClass = "text-[11px] text-muted-foreground"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">单据生成</h1>

      <div className="flex gap-2">
        {DOC_TYPES.map((t) => (
          <Button key={t.value} variant={docType === t.value ? "default" : "outline"} size="sm" onClick={() => setDocType(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-6">
        {docType === "packing_list" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className={inputClass}><label className={labelClass}>发货人名称</label><Input value={plData.shipperName} onChange={(e) => setPlData((p) => ({ ...p, shipperName: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>发货人地址</label><Input value={plData.shipperAddress} onChange={(e) => setPlData((p) => ({ ...p, shipperAddress: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>联系方式</label><Input value={plData.shipperContact} onChange={(e) => setPlData((p) => ({ ...p, shipperContact: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>收货人名称</label><Input value={plData.consigneeName} onChange={(e) => setPlData((p) => ({ ...p, consigneeName: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>收货人地址</label><Input value={plData.consigneeAddress} onChange={(e) => setPlData((p) => ({ ...p, consigneeAddress: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>联系方式</label><Input value={plData.consigneeContact} onChange={(e) => setPlData((p) => ({ ...p, consigneeContact: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>发票号</label><Input value={plData.invoiceNo} onChange={(e) => setPlData((p) => ({ ...p, invoiceNo: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>日期</label><Input type="date" value={plData.date} onChange={(e) => setPlData((p) => ({ ...p, date: e.target.value }))} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className={inputClass}><label className={labelClass}>卖方名称</label><Input value={ciData.sellerName} onChange={(e) => setCiData((p) => ({ ...p, sellerName: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>卖方地址</label><Input value={ciData.sellerAddress} onChange={(e) => setCiData((p) => ({ ...p, sellerAddress: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>买方名称</label><Input value={ciData.buyerName} onChange={(e) => setCiData((p) => ({ ...p, buyerName: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>买方地址</label><Input value={ciData.buyerAddress} onChange={(e) => setCiData((p) => ({ ...p, buyerAddress: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>发票号</label><Input value={ciData.invoiceNo} onChange={(e) => setCiData((p) => ({ ...p, invoiceNo: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>日期</label><Input type="date" value={ciData.date} onChange={(e) => setCiData((p) => ({ ...p, date: e.target.value }))} /></div>
            <div className={inputClass}><label className={labelClass}>贸易条款</label><select value={ciData.terms} onChange={(e) => setCiData((p) => ({ ...p, terms: e.target.value }))} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground"><option value="FOB">FOB</option><option value="CIF">CIF</option><option value="DDP">DDP</option><option value="EXW">EXW</option></select></div>
            <div className={inputClass}><label className={labelClass}>币种</label><select value={ciData.currency} onChange={(e) => setCiData((p) => ({ ...p, currency: e.target.value }))} className="h-8 rounded-xl border border-border bg-white px-3 text-sm font-light text-foreground"><option value="USD">USD</option><option value="CNY">CNY</option><option value="EUR">EUR</option></select></div>
          </div>
        )}
      </div>

      <Button onClick={handleGenerate} disabled={generating} size="lg">
        {generating ? "生成中..." : "生成 PDF"}
      </Button>
    </div>
  )
}
