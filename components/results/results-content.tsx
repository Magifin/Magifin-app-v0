"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FileWarning,
  ArrowLeft,
  TrendingUp,
  ListChecks,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function calculateEstimate(params: URLSearchParams) {
  let minGain = 0
  let maxGain = 0
  const optimisations: string[] = []
  const documents: string[] = []
  const actions: string[] = []

  const children = parseInt(params.get("children") || "0")
  const hasChildcare = params.get("hasChildcare") === "true"
  const childcareCost = parseInt(params.get("childcare") || "0")
  const hasTitresServices = params.get("titresServices") === "true"
  const titresServicesAmount = parseInt(params.get("titresServicesAmount") || "0")
  const hasEpargnesPension = params.get("epargnesPension") === "true"
  const epargnesPensionAmount = parseInt(params.get("epargnesPensionAmount") || "0")

  // Children deductions
  if (children > 0) {
    const childDeduction = children * 50
    minGain += childDeduction * 0.8
    maxGain += childDeduction * 1.2
    optimisations.push(`Déduction pour ${children} enfant(s) à charge`)
    documents.push("Composition de ménage officielle")
  }

  // Childcare
  if (hasChildcare && childcareCost > 0) {
    const childcareDeduction = Math.min(childcareCost, 16.4 * 250) * 0.45
    minGain += childcareDeduction * 0.7
    maxGain += childcareDeduction
    optimisations.push("Frais de garde d\u2019enfants déductibles")
    documents.push("Attestations fiscales des crèches / gardiennes")
    actions.push("Demander les attestations de garde (formulaire 281.86)")
  }

  // Titres-services
  if (hasTitresServices && titresServicesAmount > 0) {
    const tsReduction = titresServicesAmount * 9 * 0.3
    minGain += tsReduction * 0.9
    maxGain += tsReduction
    optimisations.push("Réduction pour titres-services")
    documents.push("Attestation fiscale titres-services")
  }

  // Pension savings
  if (hasEpargnesPension && epargnesPensionAmount > 0) {
    const pensionReduction =
      epargnesPensionAmount <= 1020
        ? epargnesPensionAmount * 0.3
        : Math.min(epargnesPensionAmount, 1310) * 0.25
    minGain += pensionReduction * 0.9
    maxGain += pensionReduction
    optimisations.push("Réduction pour épargne pension")
    documents.push("Attestation 281.60 de votre banque")
  }

  // Add baseline for missed common deductions
  if (optimisations.length === 0) {
    minGain = 100
    maxGain = 400
    optimisations.push("Analyse complète de votre profil recommandée")
    actions.push("Créer votre espace pour une analyse approfondie")
  }

  actions.push("Vérifier vos documents avant la déclaration")
  actions.push("Créer votre espace Magifin pour un suivi complet")

  return {
    minGain: Math.round(minGain),
    maxGain: Math.round(maxGain),
    optimisations,
    documents,
    actions,
  }
}

export function ResultsContent() {
  const searchParams = useSearchParams()
  const result = calculateEstimate(searchParams)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/wizard"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Modifier mes réponses
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {/* Hero estimate */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
            Votre estimation
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance">
            {"Vous pourriez récupérer entre"}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="font-[family-name:var(--font-heading)] text-5xl font-bold text-primary sm:text-6xl">
              {result.minGain}{"\u00A0€"}
            </span>
            <span className="text-2xl text-muted-foreground">et</span>
            <span className="font-[family-name:var(--font-heading)] text-5xl font-bold text-primary sm:text-6xl">
              {result.maxGain}{"\u00A0€"}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {"*Estimation basée sur les informations fournies. Le montant réel peut varier."}
          </p>
        </div>

        {/* Results sections */}
        <div className="grid gap-6 md:grid-cols-3">
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
              {result.optimisations.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-card-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                Documents manquants
              </h2>
            </div>
            <ul className="flex flex-col gap-3">
              {result.documents.length > 0 ? (
                result.documents.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  Aucun document requis pour le moment
                </li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ListChecks className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {"Actions recommandées"}
              </h2>
            </div>
            <ul className="flex flex-col gap-3">
              {result.actions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm text-card-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/dashboard">
              {"Créer mon espace Magifin"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Gratuit. Sans engagement. Suivi complet de votre optimisation.
          </p>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground/70">
            {"Estimation indicative basée sur les informations fournies. Magifin ne remplace pas un conseiller fiscal. Vérifiez toujours votre déclaration avant envoi."}
          </p>
        </div>
      </main>
    </div>
  )
}
