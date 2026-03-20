"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Calculator, TrendingUp, CheckCircle2, AlertCircle, ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptimizations } from "@/lib/useOptimizations"
import { computeOptimizationsFromAnswers } from "@/lib/computeOptimizationsFromAnswers"
import { formatMoney, formatMoneyRange } from "@/lib/formatMoney"
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mappers/wizardToTaxInput"
import type { Simulation } from "@/lib/supabase/types"
import type { AppliedOptimizations } from "@/lib/fiscal/belgium/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"

function OptimisationContent() {
  const searchParams = useSearchParams()
  const simulationId = searchParams.get("simulationId") // Contextual: specific simulation ID
  
  const { results, hasWizardData } = useOptimizations()
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(true)
  const [liveAppliedOptimizations, setLiveAppliedOptimizations] = useState<AppliedOptimizations | null>(null)
  const [isComputingTax, setIsComputingTax] = useState(false)

  // Fetch simulation: contextual (by ID) or global (latest) or last viewed
  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        let idToFetch = simulationId
        
        // If no simulationId in URL, try to use lastViewedSimulationId
        if (!idToFetch && typeof window !== "undefined") {
          idToFetch = localStorage.getItem("magifin_last_viewed_simulation_id")
        }
        
        if (idToFetch) {
          // CONTEXTUAL: Fetch specific simulation by ID
          const res = await fetch(`/api/simulations/${idToFetch}`)
          const data = await res.json()
          if (res.ok && data.simulation) {
            setCurrentSimulation(data.simulation)
            // Update last viewed when fetching by ID
            localStorage.setItem("magifin_last_viewed_simulation_id", idToFetch)
          } else {
            // Fallback to latest if ID is invalid
            const listRes = await fetch("/api/simulations/list")
            const listData = await listRes.json()
            if (listRes.ok && listData.simulations && listData.simulations.length > 0) {
              setCurrentSimulation(listData.simulations[0])
            }
          }
        } else {
          // GLOBAL: Fetch latest simulation
          const res = await fetch("/api/simulations/list")
          const data = await res.json()
          if (res.ok && data.simulations && data.simulations.length > 0) {
            setCurrentSimulation(data.simulations[0])
          }
        }
      } catch (error) {
        console.error("Error fetching simulation:", error)
      } finally {
        setIsLoadingSimulation(false)
      }
    }

    fetchSimulation()
  }, [simulationId])

  // PATCH 3: Live compute effect for appliedOptimizations
  useEffect(() => {
    if (!currentSimulation?.wizard_answers) {
      setLiveAppliedOptimizations(null)
      return
    }

    const computeLiveAppliedOptimizations = async () => {
      setIsComputingTax(true)
      try {
        const input = mapAnswersToTaxInput(currentSimulation.wizard_answers)
        if (!input) {
          setLiveAppliedOptimizations(null)
          return
        }

        const res = await fetch("/api/tax/compute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })

        const data = await res.json()
        if (res.ok && data.result?.appliedOptimizations) {
          setLiveAppliedOptimizations(data.result.appliedOptimizations)
        }
      } catch (error) {
        console.error("Error computing tax:", error)
        setLiveAppliedOptimizations(null)
      } finally {
        setIsComputingTax(false)
      }
    }

    computeLiveAppliedOptimizations()
  }, [currentSimulation?.wizard_answers])

  // Determine what to show: latest saved simulation or wizard data
  const hasData = currentSimulation || hasWizardData

  // Build display results from saved simulation wizard_answers OR current wizard session
  const displayResults = currentSimulation?.wizard_answers
    ? computeOptimizationsFromAnswers(currentSimulation.wizard_answers)
    : results

  // Section B: potential optimizations from heuristic
  const potentialItems = displayResults.items.filter((i) => i.available)

  // Section A: applied optimizations already integrated in the engine result
  const appliedItems = useMemo(() => {
    const result: Array<{ key: string; title: string; amount: number; reason: string }> = []
    // PATCH 4: Use liveAppliedOptimizations first, fallback to stored value
    const applied = liveAppliedOptimizations ?? currentSimulation?.tax_result?.appliedOptimizations
    if (!applied) return result

    if (applied.childrenCredit > 0) {
      result.push({
        key: "children_credit",
        title: "Enfants à charge",
        amount: applied.childrenCredit,
        reason: "Supplément à la quotité exemptée pour personnes à charge (Art. 132-140 CIR 92).",
      })
    }

    if (applied.pensionCredit > 0) {
      result.push({
        key: "pension_credit",
        title: "Épargne pension",
        amount: applied.pensionCredit,
        reason: "Crédit d'impôt de 30% sur votre épargne pension.",
      })
    }

    if (applied.serviceVouchersCredit > 0) {
      result.push({
        key: "titres_services",
        title: "Titres-services",
        amount: applied.serviceVouchersCredit,
        reason: "Crédit d'impôt de 30% sur vos titres-services.",
      })
    }

    return result
  }, [liveAppliedOptimizations, currentSimulation])

  const hasAnyContent = appliedItems.length > 0 || potentialItems.length > 0

  // Show Modifier/Voir résultat only when content exists
  const showDetailCtas = !isLoadingSimulation && hasData && hasAnyContent

  // PATCH 5: Determine effective simulation ID for back link
  const effectiveSimulationId = simulationId ?? currentSimulation?.id

  return (
    <div>
      {/* Back navigation - preserve simulationId if present */}
      <Link
        href={effectiveSimulationId ? `/results?simulationId=${effectiveSimulationId}` : "/results"}
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
            {currentSimulation
              ? `Détail de vos déductions (simulation du ${new Date(currentSimulation.created_at).toLocaleDateString("fr-BE")})`
              : "Détail de vos déductions et réductions identifiées."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Nouvelle simulation - always visible and first */}
          <Button 
            variant={showDetailCtas ? "outline" : "default"} 
            asChild
          >
            <Link href="/wizard?new=true">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle simulation
            </Link>
          </Button>

          {/* Modifier - only when detail CTAs should show */}
          {showDetailCtas && (
            <Button asChild>
              <Link href={currentSimulation ? `/wizard?resume=${btoa(JSON.stringify(currentSimulation.wizard_answers))}&simulationId=${currentSimulation.id}` : "/wizard?new=true"}>
                <Calculator className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          )}

          {/* Voir résultat - only when detail CTAs should show */}
          {showDetailCtas && currentSimulation && (
            <Button variant="outline" asChild>
              <Link href={`/results?simulationId=${currentSimulation.id}`}>
                Voir résultat
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div>
        <UnsavedSimulationBanner />

        {isLoadingSimulation || isComputingTax ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !hasData ? (
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
            <Link href="/wizard?new=true">
              <Calculator className="mr-2 h-4 w-4" />
              {"Commencer l'analyse"}
            </Link>
          </Button>
        </div>
      ) : !hasAnyContent ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
            {"Aucune optimisation détectée"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {"Répondez au questionnaire pour découvrir vos optimisations fiscales potentielles."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/wizard?new=true">
              <Calculator className="mr-2 h-4 w-4" />
              {"Commencer l'analyse"}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* SECTION A: Applied optimizations */}
          {appliedItems.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
                  Optimisations appliquées
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Déjà intégrées dans votre résultat fiscal
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {appliedItems.map((item) => (
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
                        <span className="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          Appliqué
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                        {formatMoney(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Applied section total */}
              {currentSimulation && (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">Total des optimisations appliquées</p>
                  <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-primary">
                    {formatMoney((liveAppliedOptimizations ?? currentSimulation.tax_result?.appliedOptimizations)?.total || 0)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECTION B: Potential optimizations */}
          {potentialItems.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
                  Optimisations potentielles supplémentaires
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gains estimés, non encore inclus dans le calcul
                </p>
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

              {/* Potential items list */}
              <div className="flex flex-col gap-4">
                {potentialItems.map((item) => (
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
            </div>
          )}

          {/* View full simulation button */}
          {currentSimulation && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/simulations/${currentSimulation.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                  Voir tous les détails de la simulation
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}

export default function OptimisationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <OptimisationContent />
    </Suspense>
  )
}
