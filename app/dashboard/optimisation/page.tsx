"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Calculator, TrendingUp, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptimizations } from "@/lib/useOptimizations"
import { formatMoneyRange } from "@/lib/formatMoney"
import type { Simulation } from "@/lib/supabase/types"

export default function OptimisationPage() {
  const { results, hasWizardData } = useOptimizations()
  const [latestSimulation, setLatestSimulation] = useState<Simulation | null>(null)
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(true)

  // Fetch latest saved simulation
  useEffect(() => {
    const fetchLatestSimulation = async () => {
      try {
        const res = await fetch("/api/simulations/list")
        const data = await res.json()
        if (res.ok && data.simulations && data.simulations.length > 0) {
          setLatestSimulation(data.simulations[0])
        }
      } catch (error) {
        console.error("Error fetching latest simulation:", error)
      } finally {
        setIsLoadingSimulation(false)
      }
    }

    fetchLatestSimulation()
  }, [])

  // Determine what to show: latest saved simulation or wizard data
  const hasData = latestSimulation || hasWizardData
  const displayResults = latestSimulation && latestSimulation.tax_result ? {
    items: latestSimulation.tax_result.items || [],
    totalMin: latestSimulation.tax_result.refundOrBalance || 0,
    totalMax: latestSimulation.tax_result.refundOrBalance || 0,
    notes: [],
    isFullySupported: true,
  } : results

  const availableItems = displayResults.items.filter((i) => i.available)

  return (
    <div>
      {/* Back navigation */}
      <Link
        href="/results"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voir mes résultats
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
            Optimisation fiscale
          </h1>
          <p className="mt-1 text-muted-foreground">
            {latestSimulation
              ? `Détail de vos déductions (simulation du ${new Date(latestSimulation.created_at).toLocaleDateString("fr-BE")})`
              : "Détail de vos déductions et réductions identifiées."}
          </p>
        </div>
        <Button asChild>
          <Link href={latestSimulation ? `/wizard?resume=${btoa(JSON.stringify(latestSimulation.wizard_answers))}` : "/wizard"}>
            <Calculator className="mr-2 h-4 w-4" />
            {hasData ? "Mettre à jour" : "Analyser ma situation"}
          </Link>
        </Button>
      </div>

      {!hasData || isLoadingSimulation ? (
        // Empty state - no wizard data yet
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
            {"Aucune analyse effectuée"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {"Répondez au questionnaire pour découvrir vos optimisations fiscales potentielles."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/wizard">
              <Calculator className="mr-2 h-4 w-4" />
              {"Commencer l'analyse"}
            </Link>
          </Button>
        </div>
      ) : availableItems.length === 0 ? (
        // Data exists but no optimization items
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
            {"Détails d'optimisation indisponibles"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {"Les détails d'optimisation ne sont pas encore disponibles pour cette simulation. Mettez à jour vos informations pour voir plus d'options."}
          </p>
          <Button className="mt-6" asChild>
            <Link href={latestSimulation ? `/wizard?resume=${btoa(JSON.stringify(latestSimulation.wizard_answers))}` : "/wizard"}>
              <Calculator className="mr-2 h-4 w-4" />
              {latestSimulation ? "Mettre à jour cette simulation" : "Commencer l'analyse"}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                {latestSimulation ? "Remboursement estimé" : "Gain total estimé"}
              </span>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-primary">
              {formatMoneyRange(displayResults.totalMin, displayResults.totalMax)}
            </p>
            {!displayResults.isFullySupported && !latestSimulation && (
              <p className="mt-2 text-xs text-muted-foreground">
                {"Estimation partielle. Calculs optimisés pour Wallonie / salarié bientôt disponibles pour votre profil."}
              </p>
            )}
          </div>

          {/* Notes */}
          {displayResults.notes.length > 0 && (
            <div className="mb-6 rounded-xl border border-border/60 bg-muted/30 p-4">
              {displayResults.notes.map((note, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {note}
                </p>
              ))}
            </div>
          )}

          {/* Deduction list */}
          <div className="flex flex-col gap-4">
            {availableItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-card-foreground">
                      {item.title}
                    </p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.precision === "confirmed" 
                        ? "bg-accent/10 text-accent" 
                        : item.precision === "estimated"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {item.precision === "confirmed" ? "Confirmé" : item.precision === "estimated" ? "Estimé" : "Conseil"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.reason}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                    {formatMoneyRange(item.amountMin, item.amountMax)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {availableItems.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-muted-foreground">
                {"Aucune optimisation détectée. Complétez le questionnaire pour affiner l'analyse."}
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/wizard">
                  {"Compléter le questionnaire"}
                </Link>
              </Button>
            </div>
          )}

          {/* View full simulation button */}
          {latestSimulation && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/simulations/${latestSimulation.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                  Voir tous les détails de la simulation
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
