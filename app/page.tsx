// test v0 pro pipeline
"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ProductEntry } from "@/components/landing/product-entry"
import { Footer } from "@/components/landing/footer"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"
import { useWizard, wizardStore } from "@/lib/wizard-store"

export default function Home() {
  const { state, hasUnsavedChanges } = useWizard()
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate wizard state to detect if banner will show
  useEffect(() => {
    wizardStore.hydrate()
    setIsHydrated(true)
  }, [])

  const isBannerVisible = isHydrated && hasUnsavedChanges()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16">
        <UnsavedSimulationBanner />
      </div>
      <main className={isBannerVisible ? "[&>*:first-child]:pt-0" : ""}>
        <Hero />
        <HowItWorks />
        <ProductEntry />
      </main>
      <Footer />
    </div>
  )
}
