"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "@/lib/wizard-store"

/**
 * Reusable banner component that displays when there's unsaved wizard state.
 * Intelligently routes to /results if a result exists, or /wizard if still in progress.
 */
export function UnsavedSimulationBanner() {
  const { state } = useWizard()

  // Detect if there's unsaved state
  const hasUnsavedState =
    state.answers &&
    Object.values(state.answers).some(
      (v) => v !== null && v !== undefined && v !== 0 && v !== ""
    )

  if (!hasUnsavedState) {
    return null
  }

  // Smart resume logic:
  // - If currentStepId exists AND is not the first step, user is in wizard progress → go to /wizard
  // - Otherwise, user likely reached results page → go to /results
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
