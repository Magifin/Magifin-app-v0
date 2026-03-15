"use client"

import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ProductEntry } from "@/components/landing/product-entry"
import { Footer } from "@/components/landing/footer"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UnsavedSimulationBanner />
      <main>
        <Hero />
        <HowItWorks />
        <ProductEntry />
      </main>
      <Footer />
    </div>
  )
}
