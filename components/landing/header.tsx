"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-foreground">
            Magifin
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Comment ça marche
          </Link>
          <Link
            href="#products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Produits
          </Link>
          <Link
            href="/wizard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Optimisation fiscale
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Se connecter</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/wizard">Commencer</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Comment ça marche
            </Link>
            <Link
              href="#products"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Produits
            </Link>
            <Link
              href="/wizard"
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Optimisation fiscale
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/wizard">Commencer</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
