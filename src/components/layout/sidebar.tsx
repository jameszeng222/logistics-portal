"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  DollarSign,
  Wrench,
  ClipboardCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plane,
  Ship,
  Truck,
  Ruler,
  Box,
  Clock,
  ShieldCheck,
  BarChart3,
} from "lucide-react"

interface NavChild {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  children?: NavChild[]
}

const navItems: NavItem[] = [
  {
    label: "数据看板",
    href: "/",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "价格管理",
    icon: <DollarSign className="size-4" />,
    children: [
      { label: "UPS价格", href: "/prices/ups", icon: <Truck className="size-4" /> },
      { label: "空运价格", href: "/prices/air", icon: <Plane className="size-4" /> },
      { label: "海运价格", href: "/prices/sea", icon: <Ship className="size-4" /> },
    ],
  },
  {
    label: "工具箱",
    icon: <Wrench className="size-4" />,
    children: [
      { label: "体积计算器", href: "/tools/dim-calculator", icon: <Ruler className="size-4" /> },
      { label: "箱规查询", href: "/tools/box-specs", icon: <Box className="size-4" /> },
    ],
  },
  {
    label: "供应商考核",
    icon: <ClipboardCheck className="size-4" />,
    children: [
      { label: "时效考核", href: "/assessment/timeliness", icon: <Clock className="size-4" /> },
      { label: "验货考核", href: "/assessment/inspection", icon: <ShieldCheck className="size-4" /> },
      { label: "综合考核", href: "/assessment/comprehensive", icon: <BarChart3 className="size-4" /> },
      { label: "服务商列表", href: "/providers", icon: <Users className="size-4" /> },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "价格管理": true,
    "工具箱": true,
    "供应商考核": true,
  })
  const pathname = usePathname()

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const isGroupActive = (children?: NavChild[]) => {
    if (!children) return false
    return children.some((child) => pathname.startsWith(child.href))
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-14" : "w-52"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <span className="text-[12px] font-light tracking-[0.08em] text-muted-foreground uppercase">
            Logistics
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => !collapsed && toggleGroup(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                      isGroupActive(item.children) && !collapsed && "text-foreground"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-light">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "size-3 shrink-0 text-muted-foreground transition-transform duration-200",
                            expandedGroups[item.label] && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && expandedGroups[item.label] && (
                    <ul className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border/40 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-light transition-colors",
                              "hover:bg-secondary/60 hover:text-foreground",
                              isActive(child.href)
                                ? "text-foreground bg-secondary/80"
                                : "text-muted-foreground"
                            )}
                          >
                            <span className="shrink-0">{child.icon}</span>
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-light transition-colors",
                    "hover:bg-secondary/60 hover:text-foreground",
                    isActive(item.href!)
                      ? "bg-secondary/80 text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
