"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProviderCard, type ProviderCardData } from "@/components/providers/provider-card";
import { ProviderForm, type ChannelOption, type ProviderFormData } from "@/components/providers/provider-form";
import { Plus, Search } from "lucide-react";

// Mock data
const MOCK_CHANNELS: ChannelOption[] = [
  { id: 1, name: "UPS" },
  { id: 2, name: "空运" },
  { id: 3, name: "海运" },
];

const MOCK_PROVIDERS: ProviderCardData[] = [
  {
    id: 1,
    name: "华运达国际物流",
    channelName: "UPS",
    contactPerson: "张经理",
    contactPhone: "138-0000-1111",
    email: "zhang@huayunda.com",
    address: "深圳市宝安区XX路88号",
    status: "active",
    cooperationStartDate: "2023-03-15",
    notes: "主要UPS代理",
  },
  {
    id: 2,
    name: "中远达货运",
    channelName: "UPS",
    contactPerson: "李总",
    contactPhone: "139-0000-2222",
    email: "li@zhongyuanda.com",
    address: "广州市白云区YY路66号",
    status: "active",
    cooperationStartDate: "2023-06-01",
    notes: "",
  },
  {
    id: 3,
    name: "天翼空运",
    channelName: "空运",
    contactPerson: "王经理",
    contactPhone: "137-0000-3333",
    email: "wang@tianyi-air.com",
    address: "上海市浦东新区ZZ路99号",
    status: "paused",
    cooperationStartDate: "2022-11-20",
    notes: "暂停合作，待重新评估",
  },
  {
    id: 4,
    name: "海星物流",
    channelName: "海运",
    contactPerson: "赵总",
    contactPhone: "136-0000-4444",
    email: "zhao@haistar.com",
    address: "宁波市北仑区AA路55号",
    status: "active",
    cooperationStartDate: "2024-01-10",
    notes: "",
  },
  {
    id: 5,
    name: "飞达国际",
    channelName: "空运",
    contactPerson: "陈经理",
    contactPhone: "135-0000-5555",
    email: "chen@feida.com",
    address: "杭州市萧山区BB路33号",
    status: "terminated",
    cooperationStartDate: "2021-08-01",
    notes: "服务质量不达标，已终止",
  },
  {
    id: 6,
    name: "远航海运",
    channelName: "海运",
    contactPerson: "刘总",
    contactPhone: "134-0000-6666",
    email: "liu@yuanhang.com",
    address: "厦门市湖里区CC路77号",
    status: "active",
    cooperationStartDate: "2023-09-05",
    notes: "",
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "合作中" },
  { value: "paused", label: "暂停" },
  { value: "terminated", label: "终止" },
];

export default function ProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderCardData[]>(MOCK_PROVIDERS);
  const [channels, setChannels] = useState<ChannelOption[]>(MOCK_CHANNELS);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  useEffect(() => {
    // Try to fetch real data
    fetch("/api/providers")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as ProviderCardData[] | undefined;
        if (data && data.length > 0) setProviders(data);
      })
      .catch(() => {});

    fetch("/api/channels")
      .then((r) => r.json())
      .then((res) => {
        const data = (res as Record<string, unknown>).data as ChannelOption[] | undefined;
        if (data && data.length > 0) setChannels(data);
      })
      .catch(() => {});
  }, []);

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (filterChannel !== "all" && p.channelName !== filterChannel) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterSearch && !p.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      return true;
    });
  }, [providers, filterChannel, filterStatus, filterSearch]);

  const handleAdd = async (data: ProviderFormData) => {
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = (await res.json()) as Record<string, unknown>;
        const newProvider = result.data as ProviderCardData;
        setProviders((prev) => [...prev, newProvider]);
        setDialogOpen(false);
        return;
      }
    } catch {
      // fallback: add locally
    }
    setProviders((prev) => [
      ...prev,
      {
        ...data,
        id: Date.now(),
        channelName: channels.find((c) => c.id === data.channelId)?.name ?? null,
      },
    ]);
    setDialogOpen(false);
  };

  const handleCardClick = (id: number) => {
    router.push(`/providers/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extralight tracking-tight text-foreground">服务商列表</h1>
        <Button
          variant="outline"
          className="h-9 rounded-xl border-border bg-transparent hover:bg-secondary/60 text-muted-foreground"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-1.5 size-3.5" />
          新增服务商
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">渠道</Label>
          <Select value={filterChannel} onValueChange={(v) => v && setFilterChannel(v)}>
            <SelectTrigger className="h-9 w-32 rounded-xl border-border bg-white text-foreground font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部渠道</SelectItem>
              {channels.map((ch) => (
                <SelectItem key={ch.id} value={ch.name}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">状态</Label>
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
            <SelectTrigger className="h-9 w-32 rounded-xl border-border bg-white text-foreground font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">搜索</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-48 rounded-xl border-border bg-white pl-8 text-foreground font-light placeholder:text-muted-foreground"
              placeholder="搜索服务商名称"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Provider cards grid */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onClick={() => handleCardClick(provider.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-muted-foreground">
          暂无符合条件的服务商
        </div>
      )}

      {/* Add provider dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-extralight tracking-tight text-foreground">新增服务商</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">填写以下信息添加新的服务商</DialogDescription>
          </DialogHeader>
          <ProviderForm
            channels={channels}
            onSubmit={handleAdd}
            onCancel={() => setDialogOpen(false)}
            submitLabel="添加"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
