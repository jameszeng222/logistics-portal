"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XIcon } from "lucide-react";

interface DimRule {
  id: number;
  channelName: string;
  dimDivisor: number;
  isDefault: number;
}

export function DimRulesManager() {
  const [rules, setRules] = useState<DimRule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ channelName: "", dimDivisor: "", isDefault: false });
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ channelName: "", dimDivisor: "", isDefault: false });

  const loadRules = useCallback(async () => {
    try {
      const res = await fetch("/api/dim-rules");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRules(data);
        return;
      }
    } catch {
      // fallback to mock
    }
    setRules([
      { id: 1, channelName: "UPS", dimDivisor: 6000, isDefault: 1 },
      { id: 2, channelName: "DHL", dimDivisor: 5000, isDefault: 0 },
      { id: 3, channelName: "空运", dimDivisor: 6000, isDefault: 0 },
      { id: 4, channelName: "海运", dimDivisor: 1000000, isDefault: 0 },
    ]);
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/dim-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName: newRule.channelName,
          dimDivisor: Number(newRule.dimDivisor),
          isDefault: newRule.isDefault,
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        setNewRule({ channelName: "", dimDivisor: "", isDefault: false });
        loadRules();
        return;
      }
    } catch {
      // 离线模式
    }
    const rule: DimRule = {
      id: Math.max(0, ...rules.map((r) => r.id)) + 1,
      channelName: newRule.channelName,
      dimDivisor: Number(newRule.dimDivisor),
      isDefault: newRule.isDefault ? 1 : 0,
    };
    setRules((prev) => [...prev, rule]);
    setShowAdd(false);
    setNewRule({ channelName: "", dimDivisor: "", isDefault: false });
  };

  const startEdit = (rule: DimRule) => {
    setEditingId(rule.id);
    setEditForm({
      channelName: rule.channelName,
      dimDivisor: String(rule.dimDivisor),
      isDefault: rule.isDefault === 1,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ channelName: "", dimDivisor: "", isDefault: false });
  };

  const saveEdit = (id: number) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              channelName: editForm.channelName,
              dimDivisor: Number(editForm.dimDivisor),
              isDefault: editForm.isDefault ? 1 : 0,
            }
          : editForm.isDefault
          ? { ...r, isDefault: 0 }
          : r
      )
    );
    setEditingId(null);
  };

  const deleteRule = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>分泡规则管理</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdd(true)}
        >
          <PlusIcon className="size-4" />
          添加规则
        </Button>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-4 flex items-end gap-3 rounded-lg border border-dashed p-3">
            <div className="space-y-1">
              <Label className="text-xs">渠道名称</Label>
              <Input
                value={newRule.channelName}
                onChange={(e) =>
                  setNewRule({ ...newRule, channelName: e.target.value })
                }
                placeholder="如：UPS"
                className="h-8 w-32"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">除数</Label>
              <Input
                type="number"
                value={newRule.dimDivisor}
                onChange={(e) =>
                  setNewRule({ ...newRule, dimDivisor: e.target.value })
                }
                placeholder="如：6000"
                className="h-8 w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newRule.isDefault}
                onChange={(e) =>
                  setNewRule({ ...newRule, isDefault: e.target.checked })
                }
                className="size-4 rounded"
              />
              <Label className="text-xs">默认</Label>
            </div>
            <Button size="sm" onClick={handleAdd}>
              保存
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setNewRule({ channelName: "", dimDivisor: "", isDefault: false });
              }}
            >
              取消
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道名称</TableHead>
              <TableHead>除数</TableHead>
              <TableHead>默认</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) =>
              editingId === rule.id ? (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Input
                      value={editForm.channelName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, channelName: e.target.value })
                      }
                      className="h-7 w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={editForm.dimDivisor}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dimDivisor: e.target.value })
                      }
                      className="h-7 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={editForm.isDefault}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isDefault: e.target.checked })
                      }
                      className="size-4 rounded"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => saveEdit(rule.id)}
                      >
                        <CheckIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={cancelEdit}
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.channelName}
                  </TableCell>
                  <TableCell>{rule.dimDivisor}</TableCell>
                  <TableCell>
                    {rule.isDefault === 1 && (
                      <Badge variant="secondary">默认</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => startEdit(rule)}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <TrashIcon className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
