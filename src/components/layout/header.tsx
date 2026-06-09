"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeMap: Record<string, string> = {
  "prices": "价格管理",
  "ups": "UPS价格",
  "air": "空运价格",
  "sea": "海运价格",
  "tools": "工具箱",
  "dim-calculator": "体积计算器",
  "box-specs": "箱规查询",
  "assessment": "供应商考核",
  "timeliness": "时效考核",
  "inspection": "验货考核",
  "comprehensive": "综合考核",
  "providers": "服务商管理",
  "weekly-reports": "周报管理",
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") {
    return [{ label: "数据看板" }]
  }

  const segments = pathname.split("/").filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: "数据看板", href: "/" }]

  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const label = routeMap[segments[i]] || segments[i]
    const isLast = i === segments.length - 1
    items.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  }

  return items
}

export function Header() {
  const pathname = usePathname()
  const breadcrumbs = buildBreadcrumbs(pathname)

  return (
    <header className="flex h-10 items-center px-8">
      <nav className="flex items-center gap-1.5 text-[13px]">
        {breadcrumbs.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="size-2.5 text-muted-foreground/30" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/70 font-light">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  )
}
