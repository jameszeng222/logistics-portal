"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ContentBlock } from "./content-block";
import { TemplateLoader } from "./template-loader";
import { PlusIcon, ChevronDownIcon, FileTextIcon } from "lucide-react";

export interface ContentBlockData {
  type: "table" | "list";
  title: string;
  columns?: string[];
  rows?: string[][];
  items?: string[];
}

export interface MemberData {
  id?: number;
  memberName: string;
  color: string;
  contentBlocks: ContentBlockData[];
}

interface MemberSectionProps {
  member: MemberData;
  onChange: (member: MemberData) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

export function MemberSection({
  member,
  onChange,
  onRemove,
  readOnly = false,
}: MemberSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateBlocks = (blocks: ContentBlockData[]) => {
    onChange({ ...member, contentBlocks: blocks });
  };

  const addBlock = (type: "table" | "list") => {
    const newBlock: ContentBlockData =
      type === "table"
        ? { type: "table", title: "新表格", columns: ["列1", "列2"], rows: [["", ""]] }
        : { type: "list", title: "新列表", items: [""] };
    updateBlocks([...member.contentBlocks, newBlock]);
  };

  const updateBlock = (index: number, block: ContentBlockData) => {
    const blocks = [...member.contentBlocks];
    blocks[index] = block;
    updateBlocks(blocks);
  };

  const removeBlock = (index: number) => {
    updateBlocks(member.contentBlocks.filter((_, i) => i !== index));
  };

  const loadTemplate = (blocks: ContentBlockData[]) => {
    updateBlocks([...member.contentBlocks, ...blocks]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger>
          <div className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <ChevronDownIcon
              className={`size-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
            <div
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: member.color || "#6b7280" }}
            />
            <span className="font-medium text-sm">{member.memberName}</span>
            <span className="text-xs text-muted-foreground">
              ({member.contentBlocks.length} 个内容块)
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="p-4 space-y-3">
            {!readOnly && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => addBlock("table")}
                >
                  <PlusIcon className="size-3" />
                  添加表格
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => addBlock("list")}
                >
                  <PlusIcon className="size-3" />
                  添加列表
                </Button>
                <TemplateLoader onLoad={loadTemplate} />
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">颜色:</label>
                  <Input
                    type="color"
                    value={member.color || "#6b7280"}
                    onChange={(e) =>
                      onChange({ ...member, color: e.target.value })
                    }
                    className="h-6 w-8 p-0 border-0 cursor-pointer"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onRemove}
                  className="text-destructive"
                >
                  移除成员
                </Button>
              </div>
            )}
            {member.contentBlocks.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-6">
                <FileTextIcon className="size-8 mx-auto mb-2 opacity-40" />
                暂无内容块
              </div>
            ) : (
              member.contentBlocks.map((block, index) => (
                <ContentBlock
                  key={index}
                  block={block}
                  onChange={(b) => updateBlock(index, b)}
                  onRemove={() => removeBlock(index)}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
