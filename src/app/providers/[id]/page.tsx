"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/providers/status-badge";
import { ProviderForm, type ChannelOption, type ProviderFormData } from "@/components/providers/provider-form";
import { ArrowLeft, Pencil, Clock, ShieldCheck, TrendingUp } from "lucide-react";

// Types
interface StatusLogEntry {
  id: number;
  oldStatus: string | null;
  newStatus: string;
  reason: string | null;
  changedAt: string | null;
}

interface AssessmentData {
  avgTimeliness: number;
  totalRecords: number;
  inspectionRate: number;
  onTimeRate: number;
}

interface ProviderDetail {
  id: number;
  name: string;
  channelId: number | null;
  channelName: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  cooperationStartDate: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  prices: unknown[];
  assessment: AssessmentData;
  statusLog: StatusLogEntry[];
}

// Mock data
const MOCK_CHANNELS: ChannelOption[] = [
  { id: 1, name: "UPS" },
  { id: 2, name: "空运" },
  { id: 3, name: "海运" },
];

const MOCK_DETAIL: ProviderDetail = {
  id: 1,
  name: "华运达国际物流",
  channelId: 1,
  channelName: "UPS",
  contactPerson: "张经理",
  contactPhone: "138-0000-1111",
  email: "zhang@huayunda.com",
  address: "深圳市宝安区XX路88号",
  status: "active",
  cooperationStartDate: "2023-03-15",
  notes: "主要UPS代理",
  createdAt: "2023-03-15T00:00:00",
  updatedAt: "2024-12-01T00:00:00",
  prices: [
    { id: 1, priceType: "agent", agentName: "华运达", destinationRegion: "北美", zone: 1, unitPrice: 45.0, peakSurcharge: 5.0, fuelSurcharge: 3.5, effectiveDate: "2025-01-01" },
    { id: 2, priceType: "agent", agentName: "华运达", destinationRegion: "北美", zone: 2, unitPrice: 50.0, peakSurcharge: 5.0, fuelSurcharge: 3.5, effectiveDate: "2025-01-01" },
    { id: 3, priceType: "agent", agentName: "华运达", destinationRegion: "欧洲", zone: 2, unitPrice: 55.0, peakSurcharge: 6.0, fuelSurcharge: 4.0, effectiveDate: "2025-01-01" },
  ],
  assessment: {
    avgTimeliness: 5.2,
    totalRecords: 156,
    inspectionRate: 85,
    onTimeRate: 92,
  },
  statusLog: [
    { id: 1, oldStatus: null, newStatus: "active", reason: "开始合作", changedAt: "2023-03-15T00:00:00" },
    { id: 2, oldStatus: "active", newStatus: "paused", reason: "服务质量下降，暂停评估", changedAt: "2024-06-01T00:00:00" },
    { id: 3, oldStatus: "paused", newStatus: "active", reason: "整改合格，恢复合作", changedAt: "2024-08-15T00:00:00" },
  ],
};

const STATUS_LABEL: Record<string, string> = {
  active: "合作中",
  paused: "暂停",
  terminated: "终止",
};

export default function ProviderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<ProviderDetail>(MOCK_DETAIL);
  const [channels, setChannels] = useState<ChannelOption[]>(MOCK_CHANNELS);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/providers/${id}`)
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as ProviderDetail | undefined;
        if (data) setDetail(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/channels")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as ChannelOption[] | undefined;
        if (data && data.length > 0) setChannels(data);
      })
      .catch(() => {});
  }, [id]);

  const handleEdit = async (data: ProviderFormData) => {
    try {
      const res = await fetch(`/api/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = (await res.json()) as Record<string, unknown>;
        const updated = result.data as Partial<ProviderDetail>;
        setDetail((prev) => ({
          ...prev,
          ...updated,
          channelName: channels.find((c) => c.id === data.channelId)?.name ?? prev.channelName,
        }));
        setEditOpen(false);
        return;
      }
    } catch {
      // fallback: update locally
    }
    setDetail((prev) => ({
      ...prev,
      ...data,
      channelName: channels.find((c) => c.id === data.channelId)?.name ?? prev.channelName,
    }));
    setEditOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/providers")}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{detail.name}</h1>
        <StatusBadge status={detail.status} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="prices">价格记录</TabsTrigger>
          <TabsTrigger value="assessment">考核评分</TabsTrigger>
          <TabsTrigger value="status-log">状态变更</TabsTrigger>
        </TabsList>

        {/* 基本信息 Tab */}
        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>基本信息</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-1 size-3.5" />
                  编辑
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField label="服务商名称" value={detail.name} />
                <InfoField label="渠道" value={detail.channelName} />
                <InfoField label="联系人" value={detail.contactPerson} />
                <InfoField label="联系电话" value={detail.contactPhone} />
                <InfoField label="邮箱" value={detail.email} />
                <InfoField label="地址" value={detail.address} />
                <InfoField label="合作起始日期" value={detail.cooperationStartDate} />
                <InfoField label="备注" value={detail.notes} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 价格记录 Tab */}
        <TabsContent value="prices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>价格记录</CardTitle>
              <CardDescription>
                {detail.channelName ? `${detail.channelName}渠道相关价格` : "关联价格"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detail.prices && detail.prices.length > 0 ? (
                <PriceTable prices={detail.prices} channelName={detail.channelName} />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  暂无价格记录
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 考核评分 Tab */}
        <TabsContent value="assessment" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AssessmentCard
              icon={<Clock className="size-5" />}
              title="平均时效"
              value={detail.assessment.avgTimeliness > 0 ? `${detail.assessment.avgTimeliness.toFixed(1)} 天` : "-"}
              description="发货到签收平均天数"
            />
            <AssessmentCard
              icon={<TrendingUp className="size-5" />}
              title="准时率"
              value={detail.assessment.onTimeRate > 0 ? `${detail.assessment.onTimeRate}%` : "-"}
              description="按时送达比例"
            />
            <AssessmentCard
              icon={<ShieldCheck className="size-5" />}
              title="验货率"
              value={detail.assessment.inspectionRate > 0 ? `${detail.assessment.inspectionRate}%` : "-"}
              description="验货通过比例"
            />
            <AssessmentCard
              icon={<TrendingUp className="size-5" />}
              title="总记录数"
              value={String(detail.assessment.totalRecords)}
              description="发货记录总数"
            />
          </div>
        </TabsContent>

        {/* 状态变更 Tab */}
        <TabsContent value="status-log" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>状态变更记录</CardTitle>
            </CardHeader>
            <CardContent>
              {detail.statusLog && detail.statusLog.length > 0 ? (
                <div className="relative space-y-0">
                  {detail.statusLog.map((log, index) => (
                    <div key={log.id} className="relative flex gap-4 pb-6">
                      {/* Timeline line */}
                      {index < detail.statusLog.length - 1 && (
                        <div className="absolute left-[7px] top-5 h-full w-px bg-border" />
                      )}
                      {/* Timeline dot */}
                      <div className="mt-1.5 size-3.5 shrink-0 rounded-full bg-primary" />
                      {/* Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={log.newStatus} />
                          {log.oldStatus && (
                            <>
                              <span className="text-xs text-muted-foreground">由</span>
                              <StatusBadge status={log.oldStatus} />
                            </>
                          )}
                        </div>
                        {log.reason && (
                          <p className="text-sm text-muted-foreground">{log.reason}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {log.changedAt ? new Date(log.changedAt).toLocaleString("zh-CN") : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  暂无状态变更记录
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑服务商</DialogTitle>
            <DialogDescription>修改服务商信息</DialogDescription>
          </DialogHeader>
          <ProviderForm
            channels={channels}
            initialData={{
              name: detail.name,
              channelId: detail.channelId,
              contactPerson: detail.contactPerson ?? "",
              contactPhone: detail.contactPhone ?? "",
              email: detail.email ?? "",
              address: detail.address ?? "",
              status: detail.status,
              cooperationStartDate: detail.cooperationStartDate ?? "",
              notes: detail.notes ?? "",
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditOpen(false)}
            submitLabel="保存"
            isEdit
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper components

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function AssessmentCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-0">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceTable({
  prices,
  channelName,
}: {
  prices: unknown[];
  channelName: string | null;
}) {
  const name = channelName?.toLowerCase() ?? "";

  if (name.includes("空运") || name.includes("air")) {
    const airData = prices as Array<Record<string, unknown>>;
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>始发国</TableHead>
            <TableHead>始发机场</TableHead>
            <TableHead>目的国</TableHead>
            <TableHead>目的机场</TableHead>
            <TableHead>单价 (¥/kg)</TableHead>
            <TableHead>最低收费</TableHead>
            <TableHead>生效日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {airData.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{String(p.originCountry ?? "-")}</TableCell>
              <TableCell>{String(p.originAirport ?? "-")}</TableCell>
              <TableCell>{String(p.destCountry ?? "-")}</TableCell>
              <TableCell>{String(p.destAirport ?? "-")}</TableCell>
              <TableCell>¥{Number(p.unitPrice ?? 0).toFixed(2)}</TableCell>
              <TableCell>¥{Number(p.minCharge ?? 0).toFixed(2)}</TableCell>
              <TableCell>{String(p.effectiveDate ?? "-")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (name.includes("海运") || name.includes("sea")) {
    const seaData = prices as Array<Record<string, unknown>>;
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>始发港</TableHead>
            <TableHead>目的港</TableHead>
            <TableHead>单价 (¥/CBM)</TableHead>
            <TableHead>最低收费</TableHead>
            <TableHead>生效日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seaData.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{String(p.originPort ?? "-")}</TableCell>
              <TableCell>{String(p.destPort ?? "-")}</TableCell>
              <TableCell>¥{Number(p.unitPrice ?? 0).toFixed(2)}</TableCell>
              <TableCell>¥{Number(p.minCharge ?? 0).toFixed(2)}</TableCell>
              <TableCell>{String(p.effectiveDate ?? "-")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // UPS or unknown - generic table
  const genericData = prices as Array<Record<string, unknown>>;
  if (genericData.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        暂无价格记录
      </div>
    );
  }

  const keys = Object.keys(genericData[0]).filter(
    (k) => !["id", "createdAt", "notes"].includes(k)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {keys.map((k) => (
            <TableHead key={k}>{k}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {genericData.map((p, i) => (
          <TableRow key={i}>
            {keys.map((k) => (
              <TableCell key={k}>{String(p[k] ?? "-")}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
