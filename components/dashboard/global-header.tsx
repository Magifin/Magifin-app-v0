"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountDropdown } from "@/components/account-dropdown"

export function GlobalTopRightHeader() {
  return (
    <div className="fixed right-0 top-0 z-40 hidden lg:flex items-center gap-3 border-b border-border/50 border-l border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md h-16 w-64">
      <Button asChild className="flex-1">
        <Link href="/wizard?new=true">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle simulation
        </Link>
      </Button>
      <AccountDropdown />
    </div>
  )
}

