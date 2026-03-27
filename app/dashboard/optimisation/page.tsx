"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Calculator, CheckCircle2, AlertCircle, ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptimizations } from "@/lib/useOptimizations"
import { computeOptimizationsFromAnswers, ensureModernOptimizationResult } from "@/lib/computeOptimizationsFromAnswers"
import { buildUnifiedOptimizationItems } from "@/lib/buildUnifiedOptimizationItems"
import { formatMoneyRange, formatMoney } from "@/lib/formatMoney"
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mappers/wizardToTaxInput"
import type { Simulation } from "@/lib/supabase/types"
import type { AppliedOptimizations } from "@/lib/fiscal/belgium/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"
import { DashboardHeader } from "@/components/dashboard/header"
import { getWizardStepForIncomplete, buildIncompleteResumeUrl } from "@/lib/incomplete-navigation"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

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

  // Build display results: prefer persisted optimisations from DB, fallback to recompute for unsaved data
  const displayResults = currentSimulation?.optimisations 
    ? ensureModernOptimizationResult(currentSimulation.optimisations)
    : currentSimulation?.wizard_answers
    ? computeOptimizationsFromAnswers(currentSimulation.wizard_answers)
    : results

  // Build unified optimization items (engine + heuristic)
  const unifiedItems = buildUnifiedOptimizationItems(
    liveAppliedOptimizations ?? currentSimulation?.tax_result?.appliedOptimizations ?? null,
    displayResults
  )

  // Calculate totals from unified items
  const optimizationTotalMin = unifiedItems.reduce((sum, item) => sum + item.amountMin, 0)
  const optimizationTotalMax = unifiedItems.reduce((sum, item) => sum + item.amountMax, 0)

  const hasAnyContent = unifiedItems.length > 0

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

      <DashboardHeader
        title="Optimisation fiscale"
        description={currentSimulation
          ? `Détail de vos déductions (simulation du ${new Date(currentSimulation.created_at).toLocaleDateString("fr-BE")})`
          : "Détail de vos déductions et réductions identifiées."}
      />

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
          {/* Optimizations Accordion */}
          <div className="mb-8">
            {/* Notes */}
            {displayResults.notes.length > 0 && (
              <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4">
                {displayResults.notes.map((note, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {note}
                  </p>
                ))}
              </div>
            )}

            <Accordion type="single" collapsible defaultValue="applied" className="space-y-0">
              {/* Section 1: Applied + Potential */}
              {unifiedItems.length > 0 && (
                <AccordionItem value="applied" className="border-b">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="font-semibold">Ce que vous avez déjà optimisé</span>
                    <span className="ml-auto mr-2 text-sm font-medium text-primary">
                      {formatMoneyRange(optimizationTotalMin, optimizationTotalMax)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {/* Unified items list with badges */}
                    <div className="flex flex-col gap-3">
                      {unifiedItems.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-3"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-card-foreground">
                                {item.title}
                              </p>
                              <span className={`inline-block rounded-full px-1.5 py-0 text-xs font-medium whitespace-nowrap ${
                                item.badge === "Confirmé"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.reason}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-card-foreground">
                              {formatMoneyRange(item.amountMin, item.amountMax)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Section 2: Incomplete */}
              {displayResults.optimisations.incomplete.length > 0 && (
                <AccordionItem value="incomplete" className="border-b">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="font-semibold text-muted-foreground">À compléter</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      {"Certaines optimisations nécessitent des informations supplémentaires."}
                    </p>
                    <div className="flex flex-col gap-2">
                      {displayResults.optimisations.incomplete.map((item) => {
                        const stepId = getWizardStepForIncomplete(item.id)
                        const wizardAnswers = currentSimulation?.wizard_answers || answers
                        const resumeUrl = stepId ? buildIncompleteResumeUrl(stepId, wizardAnswers, currentSimulation?.id) : "/wizard"
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 justify-between rounded-lg border border-border/50 bg-card/30 p-3"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground/60 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-card-foreground">
                                  {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.reason}
                                </p>
                              </div>
                            </div>
                            <Link href={resumeUrl} className="shrink-0">
                              <Button variant="outline" size="xs">
                                Compléter
                              </Button>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Section 3: Upgrade */}
              {displayResults.optimisations.upgrade.length > 0 && (
                <AccordionItem value="upgrade" className="border-b">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <span className="font-semibold">Opportunités d'économies</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      {"Vous pouvez encore optimiser votre situation fiscale."}
                    </p>
                    <div className="flex flex-col gap-3">
                      {displayResults.optimisations.upgrade.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-amber-200/50 bg-amber-50/50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            {item.additionalGain !== undefined && (
                              <div className="text-right shrink-0">
                                <p className="text-xs font-semibold text-amber-700">
                                  +{formatMoney(item.additionalGain)}/an
                                </p>
                              </div>
                            )}
                          </div>
                          {item.additionalBase !== undefined && item.maxAmount !== undefined && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {"Ajoutez "}{formatMoney(item.additionalBase)}{" pour atteindre le plafond"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

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
