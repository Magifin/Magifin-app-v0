"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { AccountDropdown } from "@/components/account-dropdown"

interface DashboardHeaderProps {
  title: string
  description?: string
  /** Additional actions to render below the title */
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const displayName = profile?.first_name || "Utilisateur"
  const initials = (profile?.first_name || "U")
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
    <div className="mb-8">
      {/* Top row with title and top-right actions */}
      <div className="mb-4 flex items-start justify-between gap-4 sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {/* Top-right actions: Nouvelle simulation + Avatar */}
        <div className="flex shrink-0 items-center gap-3">
          <Button asChild size="sm" className="h-9">
            <Link href="/wizard?new=true">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle simulation
            </Link>
          </Button>
          <AccountDropdown />
        </div>
      </div>

      {/* Additional actions row (below title) */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

