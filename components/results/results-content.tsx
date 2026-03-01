"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function calculateEstimate(params: URLSearchParams) {
  let minGain = 0
  let maxGain = 0
  const optimisations: string[] = []

  const children = parseInt(params.get("children") || "0")
  const hasChildcare = params.get("hasChildcare") === "true"
  const childcareCost = parseInt(params.get("childcare") || "0")
  const hasTitresServices = params.get("titresServices") === "true"
  const titresServicesAmount = parseInt(params.get("titresServicesAmount") || "0")
  const hasEpargnesPension = params.get("epargnesPension") === "true"
  const epargnesPensionAmount = parseInt(params.get("epargnesPensionAmount") || "0")

  if (children > 0) {
    const childDeduction = children * 50
    minGain += childDeduction * 0.8
    maxGain += childDeduction * 1.2
    optimisations.push(`Déduction pour ${children} enfant(s) à charge`)
  }

  if (hasChildcare && childcareCost > 0) {
    const childcareDeduction = Math.min(childcareCost, 16.4 * 250) * 0.45
    minGain += childcareDeduction * 0.7
    maxGain += childcareDeduction
    optimisations.push("Frais de garde d'enfants déductibles")
  }

  if (hasTitresServices && titresServicesAmount > 0) {
    const tsReduction = titresServicesAmount * 9 * 0.3
    minGain += tsReduction * 0.9
    maxGain += tsReduction
    optimisations.push("Réduction pour titres-services")
  }

  if (hasEpargnesPension && epargnesPensionAmount > 0) {
    const pensionReduction =
      epargnesPensionAmount <= 1020
        ? epargnesPensionAmount * 0.3
        : Math.min(epargnesPensionAmount, 1310) * 0.25
    minGain += pensionReduction * 0.9
    maxGain += pensionReduction
    optimisations.push("Réduction pour épargne pension")
  }

  const fallbacks = [
    "Vérification de l'épargne pension (plafonds et taux)",
    "Vérification des réductions titres-services",
  ]
  if (optimisations.length === 0) {
    minGain = 100
    maxGain = 400
    optimisations.push(fallbacks[0], fallbacks[1])
  } else if (optimisations.length === 1) {
    optimisations.push(fallbacks[0])
  }

  return {
    minGain: Math.round(minGain),
    maxGain: Math.round(maxGain),
    optimisations,
  }
}

export function ResultsContent() {
  const searchParams = useSearchParams()
  const result = calculateEstimate(searchParams)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/wizard"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier mes réponses
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Accueil
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        {/* Hero estimate */}
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {"Magi a analysé votre situation"}
          </p>

          <p className="mb-3 mt-6 text-sm font-semibold uppercase tracking-widest text-accent">
            Votre estimation
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance">
            {"Vous pourriez récupérer entre"}
          </h1>
          <div className="mt-6 flex items-baseline justify-center gap-3 sm:gap-4">
            <span className="font-[family-name:var(--font-heading)] text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
              {result.minGain}{"\u00A0\u20AC"}
            </span>
            <span className="text-xl font-medium text-muted-foreground sm:text-2xl">et</span>
            <span className="font-[family-name:var(--font-heading)] text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
              {result.maxGain}{"\u00A0\u20AC"}
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {"*Estimation basée sur les informations fournies. Le montant réel peut varier."}
          </p>

          <Button size="lg" className="mt-8 h-12 px-8 text-base" asChild>
            <Link href="/onboarding">
              {"Créer mon espace Magifin"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Gratuit. Sans engagement."}
          </p>

          {/* Impact summary */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {"Impact estimé sur votre situation"}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                "Réduction directe de votre impôt",
                "Optimisations fiscales activables immédiatement",
                "Économies potentielles les prochaines années",
                "Amélioration de votre efficacité fiscale",
              ].map((label, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs text-foreground/80"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Optimisations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {"Optimisations détectées"}
              </h2>
            </div>
            <ul className="flex flex-col gap-3">
              {result.optimisations.slice(0, 2).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-card-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Locked optimisations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {"Optimisations supplémentaires disponibles"}
              </h2>
            </div>
            <ul className="flex flex-col gap-3" aria-hidden="true">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                <div className="h-4 w-3/4 rounded bg-muted-foreground/10 blur-[3px]" />
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                <div className="h-4 w-2/3 rounded bg-muted-foreground/10 blur-[3px]" />
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/30" />
                <div className="h-4 w-4/5 rounded bg-muted-foreground/10 blur-[3px]" />
              </li>
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              {"Créez votre espace gratuit pour débloquer toutes vos optimisations fiscales."}
            </p>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {"Créer mon espace Magifin"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Gratuit. Sans engagement. Suivi complet de votre optimisation.
          </p>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground/70">
            {"Estimation indicative basée sur les informations fournies. Magifin ne remplace pas un conseiller fiscal. Vérifiez toujours votre déclaration avant envoi."}
          </p>
        </div>
      </main>
    </div>
  )
}
