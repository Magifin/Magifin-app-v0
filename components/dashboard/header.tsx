"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

interface DashboardHeaderProps {
  title: string
  description?: string
  /** If false, hides the "Nouvelle simulation" button */
  showNewSimulation?: boolean
  /** Additional actions to render (should NOT include "Nouvelle simulation") */
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  description,
  showNewSimulation = true,
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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {showNewSimulation && (
          <Button asChild>
            <Link href="/wizard?new=true">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle simulation
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/dashboard/profil")}>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
