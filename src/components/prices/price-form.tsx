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

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

interface PriceFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  submitLabel?: string;
}

export function PriceForm({
  fields,
  onSubmit,
  initialData,
  submitLabel = "提交",
}: PriceFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      const defaults: Record<string, unknown> = {};
      fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.key] = f.defaultValue;
        }
      });
      setFormData(defaults);
    }
  }, [initialData, fields]);

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {fields.map((field) => (
        <div key={field.key} className="grid gap-1.5">
          <Label htmlFor={field.key}>
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.type === "select" ? (
            <Select
              value={(formData[field.key] as string) ?? ""}
              onValueChange={(v) => handleChange(field.key, v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder ?? "请选择"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "textarea" ? (
            <Textarea
              id={field.key}
              placeholder={field.placeholder}
              value={(formData[field.key] as string) ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          ) : (
            <Input
              id={field.key}
              type={field.type}
              step={field.type === "number" ? "0.01" : undefined}
              placeholder={field.placeholder}
              value={(formData[field.key] as string) ?? ""}
              onChange={(e) =>
                handleChange(
                  field.key,
                  field.type === "number" && e.target.value !== ""
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              required={field.required}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
