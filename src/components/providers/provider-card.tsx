"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { User, Phone, MapPin } from "lucide-react";

export interface ProviderCardData {
  id: number;
  name: string;
  channelName: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  cooperationStartDate: string | null;
  notes: string | null;
}

interface ProviderCardProps {
  provider: ProviderCardData;
  onClick?: () => void;
}

const statusStyles: Record<string, string> = {
  active: "bg-accent/8 text-accent",
  合作中: "bg-accent/8 text-accent",
  paused: "bg-secondary text-muted-foreground",
  暂停: "bg-secondary text-muted-foreground",
  terminated: "bg-red-50/60 text-red-400",
  终止: "bg-red-50/60 text-red-400",
};

const statusLabels: Record<string, string> = {
  active: "合作中",
  paused: "暂停",
  terminated: "终止",
};

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  const statusStyle = statusStyles[provider.status] ?? "bg-secondary text-muted-foreground";
  const statusLabel = statusLabels[provider.status] ?? provider.status;

  return (
    <Card
      className="cursor-pointer border-0 shadow-none"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-light text-foreground/80 truncate">
            {provider.name}
          </CardTitle>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-normal ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>
        {provider.channelName && (
          <span className="inline-block w-fit rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs text-muted-foreground/60">
            {provider.channelName}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5">
        {provider.contactPerson && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <User className="size-3 shrink-0" />
            <span className="truncate">{provider.contactPerson}</span>
            {provider.contactPhone && (
              <>
                <Phone className="size-3 shrink-0" />
                <span className="truncate">{provider.contactPhone}</span>
              </>
            )}
          </div>
        )}
        {provider.address && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{provider.address}</span>
          </div>
        )}
        {provider.cooperationStartDate && (
          <p className="text-xs text-muted-foreground/60">
            合作起始: {provider.cooperationStartDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
