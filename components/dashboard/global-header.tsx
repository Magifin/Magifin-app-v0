"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountDropdown } from "@/components/account-dropdown"

export function GlobalTopRightHeader() {
  return (
    <div className="fixed right-6 top-6 z-40 hidden lg:flex items-center gap-3">
      <Button asChild size="sm" className="h-9">
        <Link href="/wizard?new=true">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle simulation
        </Link>
      </Button>
      <AccountDropdown />
    </div>
  )
}

