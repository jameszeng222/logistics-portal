"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChannelOption {
  id: number;
  name: string;
}

export interface ProviderFormData {
  name: string;
  channelId: number | null;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  status: string;
  cooperationStartDate: string;
  notes: string;
  reason?: string;
}

interface ProviderFormProps {
  channels: ChannelOption[];
  initialData?: Partial<ProviderFormData>;
  onSubmit: (data: ProviderFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}

const STATUS_OPTIONS = [
  { value: "active", label: "合作中" },
  { value: "paused", label: "暂停" },
  { value: "terminated", label: "终止" },
];

export function ProviderForm({
  channels,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "提交",
  isEdit = false,
}: ProviderFormProps) {
  const [formData, setFormData] = useState<ProviderFormData>({
    name: "",
    channelId: null,
    contactPerson: "",
    contactPhone: "",
    email: "",
    address: "",
    status: "active",
    cooperationStartDate: "",
    notes: "",
    reason: "",
  });

  const [showReason, setShowReason] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        reason: "",
      }));
    }
  }, [initialData]);

  const handleChange = (key: keyof ProviderFormData, value: string | number | null) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      // Show reason field when status changes in edit mode
      if (isEdit && key === "status" && value !== initialData?.status) {
        setShowReason(true);
      } else if (isEdit && key === "status" && value === initialData?.status) {
        setShowReason(false);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && showReason && !formData.reason?.trim()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">
          服务商名称 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="请输入服务商名称"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label>渠道</Label>
        <Select
          value={formData.channelId != null ? String(formData.channelId) : ""}
          onValueChange={(v) => handleChange("channelId", v ? Number(v) : null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择渠道" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((ch) => (
              <SelectItem key={ch.id} value={String(ch.id)}>
                {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="contactPerson">联系人</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
            placeholder="联系人姓名"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contactPhone">联系电话</Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            placeholder="联系电话"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="邮箱地址"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="address">地址</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="地址"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>状态</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger className="w-full">
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
        <div className="grid gap-1.5">
          <Label htmlFor="cooperationStartDate">合作起始日期</Label>
          <Input
            id="cooperationStartDate"
            type="date"
            value={formData.cooperationStartDate}
            onChange={(e) => handleChange("cooperationStartDate", e.target.value)}
          />
        </div>
      </div>

      {showReason && (
        <div className="grid gap-1.5">
          <Label htmlFor="reason">
            变更原因 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="请输入状态变更原因"
            required
          />
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="备注信息"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
