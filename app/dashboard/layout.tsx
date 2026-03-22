"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav"
import { GlobalTopRightHeader } from "@/components/dashboard/global-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      {/* Global top-right header */}
      <GlobalTopRightHeader />

      {/* Main content */}
      <div className="flex flex-1 flex-col pr-64 lg:pr-0">
        {/* Mobile nav */}
        <DashboardMobileNav />

        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
