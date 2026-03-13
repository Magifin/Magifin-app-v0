"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "@/lib/wizard-store"

/**
 * Reusable banner component that displays when there's unsaved wizard state.
 * Smart logic: 
 * - If wizard has answers but no current step (fresh state), suggests going back
 * - If wizard is mid-progress, allows resuming at correct step
 * - If wizard reached results, shows "Reprendre" to results
 */
export function UnsavedSimulationBanner() {
  const { state } = useWizard()

  // Detect if there's meaningful unsaved state (beyond first step)
  const hasUnsavedState =
    state.answers &&
    Object.values(state.answers).some(
      (v) => v !== null && v !== undefined && v !== 0 && v !== ""
    )

  if (!hasUnsavedState) {
    return null
  }

  // Smart resume logic:
  // 1. If currentStepId is "taxYear" or empty, user was viewing results → go to /results
  // 2. If currentStepId is something else, user was in middle of wizard → go to /wizard
  //    (the wizard will restore to correct step via the store)
  const resumeHref =
    state.currentStepId && state.currentStepId !== "taxYear"
      ? "/wizard"
      : "/results"

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-accent" />
        <p className="text-sm text-card-foreground">
          Vous avez une simulation en cours non sauvegardée.
        </p>
      </div>
      <Button size="sm" asChild className="gap-2">
        <Link href={resumeHref}>
          <ArrowRight className="h-4 w-4" />
          Reprendre
        </Link>
      </Button>
    </div>
  )
}
