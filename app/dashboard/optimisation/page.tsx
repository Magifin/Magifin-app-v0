"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Calculator, CheckCircle2, AlertCircle, ArrowLeft, Edit3, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useOptimizations } from "@/lib/useOptimizations"
import { computeOptimizationsFromAnswers } from "@/lib/computeOptimizationsFromAnswers"
import { buildUnifiedOptimizationItems } from "@/lib/buildUnifiedOptimizationItems"
import { formatMoneyRange } from "@/lib/formatMoney"
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mappers/wizardToTaxInput"
import type { Simulation } from "@/lib/supabase/types"
import type { AppliedOptimizations } from "@/lib/fiscal/belgium/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"
import { DashboardHeader } from "@/components/dashboard/header"

function OptimisationContent() {
  const searchParams = useSearchParams()
  const simulationId = searchParams.get("simulationId") // Contextual: specific simulation ID
  
  const { results, hasWizardData } = useOptimizations()
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(true)
  const [liveAppliedOptimizations, setLiveAppliedOptimizations] = useState<AppliedOptimizations | null>(null)
  const [isComputingTax, setIsComputingTax] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

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

  // Build unified optimization items (engine + heuristic)
  const unifiedItems = buildUnifiedOptimizationItems(
    liveAppliedOptimizations ?? currentSimulation?.tax_result?.appliedOptimizations ?? null,
    displayResults.items
  )

  // Calculate totals from unified items
  const optimizationTotalMin = unifiedItems.reduce((sum, item) => sum + item.amountMin, 0)
  const optimizationTotalMax = unifiedItems.reduce((sum, item) => sum + item.amountMax, 0)

  const hasAnyContent = unifiedItems.length > 0

  // Show Modifier/Voir résultat only when content exists
  const showDetailCtas = !isLoadingSimulation && hasData && hasAnyContent

  // PATCH 5: Determine effective simulation ID for back link
  const effectiveSimulationId = simulationId ?? currentSimulation?.id

  // Rename handler
  const handleRenameSimulation = () => {
    setRenameValue(currentSimulation?.name || "")
    setRenameDialogOpen(true)
  }

  const confirmRename = async () => {
    if (!renameValue.trim() || renameValue === currentSimulation?.name) {
      setRenameDialogOpen(false)
      return
    }

    if (!currentSimulation) return

    try {
      const res = await fetch(`/api/simulations/${currentSimulation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      })

      if (res.ok) {
        setCurrentSimulation((prev) => prev ? { ...prev, name: renameValue.trim() } : null)
      }
    } catch (error) {
      console.error("Error renaming simulation:", error)
    }

    setRenameDialogOpen(false)
    setRenameValue("")
  }

  // Duplicate handler
  const handleDuplicate = async () => {
    if (!currentSimulation) return

    setIsDuplicating(true)
    try {
      const res = await fetch("/api/simulations/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulationId: currentSimulation.id }),
      })

      if (!res.ok) {
        console.error("Failed to duplicate simulation")
        setIsDuplicating(false)
        return
      }

      const data = await res.json()
      const duplicatedId = data.simulation?.id

      if (duplicatedId) {
        window.location.href = `/dashboard/optimisation?simulationId=${duplicatedId}`
      }
    } catch (error) {
      console.error("Error duplicating simulation:", error)
      setIsDuplicating(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!currentSimulation) return

    try {
      const res = await fetch(`/api/simulations/${currentSimulation.id}`, { method: "DELETE" })
      if (res.ok) {
        window.location.href = "/dashboard/simulations"
      }
    } catch (error) {
      console.error("Error deleting simulation:", error)
    }
  }

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
          {/* Unified Optimisations détectées section */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
                Optimisations détectées
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Toutes les optimisations identifiées pour votre situation
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

            {/* Unified items list with badges */}
            <div className="flex flex-col gap-4">
              {unifiedItems.map((item) => (
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
                        item.badge === "Confirmé"
                          ? "bg-accent/10 text-accent"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {item.badge}
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

            {/* Total at the bottom */}
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Total des optimisations</p>
              <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-primary">
                {formatMoneyRange(optimizationTotalMin, optimizationTotalMax)}
              </p>
            </div>
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

          {/* Bottom action bar - only when simulation exists */}
          {currentSimulation && (
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
              <div className="mx-auto max-w-6xl px-6 py-4">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
                  {/* Group 1: Navigation actions */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/wizard?resume=${btoa(JSON.stringify(currentSimulation.wizard_answers))}&simulationId=${currentSimulation.id}`}>
                        <Calculator className="mr-2 h-3.5 w-3.5" />
                        Modifier
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/results?simulationId=${currentSimulation.id}`}>
                        Voir résultats
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/simulations/${currentSimulation.id}`}>
                        Voir optimisation fiscale
                      </Link>
                    </Button>
                  </div>

                  {/* Spacer */}
                  <div className="w-full sm:w-auto" />

                  {/* Group 2: Management actions */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" onClick={handleRenameSimulation}>
                      <Edit3 className="mr-2 h-3.5 w-3.5" />
                      Renommer
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      {isDuplicating ? "Duplication..." : "Dupliquer"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add padding at bottom to prevent content from being hidden behind the action bar */}
          {currentSimulation && <div className="h-28" />}
        </>
      )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer la simulation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nouveau nom de la simulation"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmRename()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmRename}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette simulation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La simulation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
