"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileTextIcon, DownloadIcon } from "lucide-react";
import type { ContentBlockData } from "./member-section";

interface Template {
  id: number;
  memberName: string;
  template: string | null;
}

interface TemplateLoaderProps {
  onLoad: (blocks: ContentBlockData[]) => void;
}

export function TemplateLoader({ onLoad }: TemplateLoaderProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/member-report-templates")
        .then((res) => res.json())
        .then((data: unknown) => {
          const templates = data as Template[];
          if (Array.isArray(templates)) setTemplates(templates);
        })
        .catch(() => setTemplates([]));
    }
  }, [open]);

  const handleLoad = () => {
    if (!selectedTemplate?.template) return;
    try {
      const blocks: ContentBlockData[] = JSON.parse(selectedTemplate.template);
      onLoad(blocks);
      setOpen(false);
      setSelectedTemplate(null);
    } catch {
      // ignore parse errors
    }
  };

  const previewBlocks = (): ContentBlockData[] => {
    if (!selectedTemplate?.template) return [];
    try {
      return JSON.parse(selectedTemplate.template);
    } catch {
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="xs">
            <FileTextIcon className="size-3" />
            加载模板
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>加载成员模板</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无可用模板
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                    selectedTemplate?.id === t.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.memberName}</span>
                  {t.template && (
                    <Badge variant="secondary" className="text-[10px]">
                      {JSON.parse(t.template).length} 个内容块
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedTemplate && (
            <div className="border rounded-md p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground mb-2">模板预览:</p>
              <div className="space-y-1">
                {previewBlocks().map((block, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-foreground"
                  >
                    <Badge variant="outline" className="text-[10px]">
                      {block.type === "table" ? "表格" : "列表"}
                    </Badge>
                    <span>{block.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">取消</Button>} />
          <Button
            onClick={handleLoad}
            disabled={!selectedTemplate}
          >
            <DownloadIcon className="size-3.5" />
            加载
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
