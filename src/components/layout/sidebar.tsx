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
  FileText,
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
    ],
  },
  {
    label: "服务商管理",
    href: "/providers",
    icon: <Users className="size-4" />,
  },
  {
    label: "周报管理",
    href: "/weekly-reports",
    icon: <FileText className="size-4" />,
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
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-3">
        {!collapsed && (
          <span className="text-[13px] font-light tracking-wide text-muted-foreground">
            物流部管理系统
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                /* Expandable group */
                <div>
                  <button
                    onClick={() => !collapsed && toggleGroup(item.label)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-accent/8",
                      isGroupActive(item.children) && !collapsed && "text-foreground"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "size-3 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                            expandedGroups[item.label] && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && expandedGroups[item.label] && (
                    <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border/40 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                              "hover:bg-accent/8 hover:text-foreground",
                              isActive(child.href)
                                ? "bg-accent/8 text-foreground"
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
                /* Simple link */
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                    "hover:bg-accent/8 hover:text-foreground",
                    isActive(item.href!)
                      ? "bg-accent/8 text-foreground"
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
