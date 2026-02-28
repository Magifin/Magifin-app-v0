"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  LayoutDashboard,
  Calculator,
  FileText,
  MessageCircle,
  User,
} from "lucide-react"

const navItems = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Fiscalite", href: "/dashboard/optimisation", icon: Calculator },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Assistant", href: "/dashboard/assistant", icon: MessageCircle },
  { label: "Profil", href: "/dashboard/profil", icon: User },
]

export function DashboardMobileNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border/50 lg:hidden">
      {/* Header */}
      <Link href="/" className="flex items-center gap-2 px-4 py-3 transition-opacity hover:opacity-80">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">M</span>
        </div>
        <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
          Magifin
        </span>
      </Link>

      {/* Nav tabs */}
      <nav className="flex overflow-x-auto px-2 pb-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
