"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface BoxSpec {
  id: number;
  sku: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  grossWeightKg: number;
  qtyPerBox: number | null;
  notes: string | null;
}

interface BoxSpecTableProps {
  onSelect?: (spec: BoxSpec) => void;
}

export function BoxSpecTable({ onSelect }: BoxSpecTableProps) {
  const [specs, setSpecs] = useState<BoxSpec[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSpec, setNewSpec] = useState({
    sku: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    grossWeightKg: "",
    qtyPerBox: "1",
    notes: "",
  });

  const loadSpecs = useCallback(async () => {
    try {
      const url = search
        ? `/api/box-specs?sku=${encodeURIComponent(search)}`
        : "/api/box-specs";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSpecs(data);
      }
    } catch {
      // mock 数据
      setSpecs([
        { id: 1, sku: "SKU-001", lengthCm: 60, widthCm: 40, heightCm: 50, grossWeightKg: 15, qtyPerBox: 24, notes: "标准箱" },
        { id: 2, sku: "SKU-002", lengthCm: 50, widthCm: 40, heightCm: 30, grossWeightKg: 8, qtyPerBox: 12, notes: "小箱" },
        { id: 3, sku: "SKU-003", lengthCm: 80, widthCm: 60, heightCm: 40, grossWeightKg: 25, qtyPerBox: 48, notes: "大箱" },
      ]);
    }
  }, [search]);

  useEffect(() => {
    loadSpecs();
  }, [loadSpecs]);

  const handleAddSpec = async () => {
    try {
      const res = await fetch("/api/box-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpec),
      });
      if (res.ok) {
        setDialogOpen(false);
        setNewSpec({
          sku: "",
          lengthCm: "",
          widthCm: "",
          heightCm: "",
          grossWeightKg: "",
          qtyPerBox: "1",
          notes: "",
        });
        loadSpecs();
      }
    } catch {
      // 离线模式，添加到本地
      const spec: BoxSpec = {
        id: specs.length + 1,
        sku: newSpec.sku,
        lengthCm: Number(newSpec.lengthCm),
        widthCm: Number(newSpec.widthCm),
        heightCm: Number(newSpec.heightCm),
        grossWeightKg: Number(newSpec.grossWeightKg),
        qtyPerBox: Number(newSpec.qtyPerBox) || 1,
        notes: newSpec.notes || null,
      };
      setSpecs((prev) => [...prev, spec]);
      setDialogOpen(false);
      setNewSpec({
        sku: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        grossWeightKg: "",
        qtyPerBox: "1",
        notes: "",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索 SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            添加箱规
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加箱规</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input
                  value={newSpec.sku}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, sku: e.target.value })
                  }
                  placeholder="SKU 编码"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label>长 (cm)</Label>
                  <Input
                    type="number"
                    value={newSpec.lengthCm}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, lengthCm: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>宽 (cm)</Label>
                  <Input
                    type="number"
                    value={newSpec.widthCm}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, widthCm: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>高 (cm)</Label>
                  <Input
                    type="number"
                    value={newSpec.heightCm}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, heightCm: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>毛重 (kg)</Label>
                  <Input
                    type="number"
                    value={newSpec.grossWeightKg}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, grossWeightKg: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>每箱数量</Label>
                  <Input
                    type="number"
                    value={newSpec.qtyPerBox}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, qtyPerBox: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>备注</Label>
                <Textarea
                  value={newSpec.notes}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, notes: e.target.value })
                  }
                  placeholder="备注信息"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                取消
              </DialogClose>
              <Button onClick={handleAddSpec}>确认添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>尺寸 (L×W×H cm)</TableHead>
            <TableHead>毛重 (kg)</TableHead>
            <TableHead>每箱数量</TableHead>
            <TableHead>备注</TableHead>
            {onSelect && <TableHead>操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onSelect ? 6 : 5} className="text-center text-muted-foreground">
                暂无箱规数据
              </TableCell>
            </TableRow>
          ) : (
            specs.map((spec) => (
              <TableRow
                key={spec.id}
                className={onSelect ? "cursor-pointer hover:bg-accent" : ""}
                onClick={() => onSelect?.(spec)}
              >
                <TableCell className="font-medium">{spec.sku}</TableCell>
                <TableCell>
                  {spec.lengthCm}×{spec.widthCm}×{spec.heightCm}
                </TableCell>
                <TableCell>{spec.grossWeightKg}</TableCell>
                <TableCell>{spec.qtyPerBox ?? "-"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {spec.notes || "-"}
                </TableCell>
                {onSelect && (
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      选择
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
