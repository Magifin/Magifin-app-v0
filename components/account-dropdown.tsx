"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { LogOut, User, FileText, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function AccountDropdown() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  // Extract first letter of email for avatar
  const initial = user.email?.charAt(0).toUpperCase() ?? "U"

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
        aria-label="Ouvrir le menu compte"
        title={user.email ?? "Compte"}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-background shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>

          <nav className="py-1">
            <Link
              href="/dashboard/profil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Mon profil
            </Link>

            <Link
              href="/dashboard/simulations"
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-4 w-4" />
              Mes simulations
            </Link>

            <Link
              href="/dashboard/profil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>

            <div className="border-t border-border py-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
