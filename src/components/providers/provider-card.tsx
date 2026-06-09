"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
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

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="truncate">{provider.name}</CardTitle>
          <StatusBadge status={provider.status} />
        </div>
        {provider.channelName && (
          <p className="text-sm text-muted-foreground">{provider.channelName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {provider.contactPerson && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{provider.contactPerson}</span>
            {provider.contactPhone && (
              <>
                <Phone className="size-3.5 shrink-0" />
                <span className="truncate">{provider.contactPhone}</span>
              </>
            )}
          </div>
        )}
        {provider.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{provider.address}</span>
          </div>
        )}
        {provider.cooperationStartDate && (
          <p className="text-xs text-muted-foreground">
            合作起始: {provider.cooperationStartDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
