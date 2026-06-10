"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#7a9e91", "#a3a8b8", "#b8b49e", "#c4b0a8"]

export default function ShipmentStatsPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/shipments/stats")
      .then((res) => res.json())
      .then((json) => setStats(json.data))
  }, [])

  if (!stats) return <div className="text-muted-foreground">加载中...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extralight tracking-tight text-foreground">统计汇总</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle>月度发货量趋势</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly}>
                  <CartesianGrid stroke="#f0eeec" />
                  <XAxis dataKey="month" tick={{ fill: "#6b6560", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: "#6b6560", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                  <Bar dataKey="totalPieces" name="件数" fill="#7a9e91" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>品牌发货占比</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.byBrand} dataKey="totalPieces" nameKey="brand" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={0}>
                    {stats.byBrand.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>渠道运费对比</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byChannel}>
                  <CartesianGrid stroke="#f0eeec" />
                  <XAxis dataKey="channel" tick={{ fill: "#6b6560", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b6560", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 300 }} />
                  <Bar dataKey="totalCost" name="运费" fill="#a3a8b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
