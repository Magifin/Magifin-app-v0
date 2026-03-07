"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  Home,
  LayoutDashboard,
  Calculator,
  FileText,
  MessageCircle,
  User,
  LogOut,
  FolderOpen,
} from "lucide-react"

const navItems = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mes simulations",
    href: "/dashboard/simulations",
    icon: FolderOpen,
  },
  {
    label: "Optimisation fiscale",
    href: "/dashboard/optimisation",
    icon: Calculator,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Assistant IA",
    href: "/dashboard/assistant",
    icon: MessageCircle,
  },
  {
    label: "Profil",
    href: "/dashboard/profil",
    icon: User,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, profile, signOut, isLoading: authLoading } = useAuth()

  // Use auth profile name
  const displayName = profile?.first_name || "Utilisateur"
  const displayEmail = authUser?.email || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-6 py-5 transition-opacity hover:opacity-80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-sm font-bold text-sidebar-primary-foreground">
            M
          </span>
        </div>
        <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-sidebar-foreground">
          Magifin
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        {authLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sidebar-primary border-t-transparent" />
          </div>
        ) : authUser ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {initials || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">
                {displayName}
              </p>
              {displayEmail && (
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {displayEmail}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent/80"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/sign-up"
              className="flex items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
