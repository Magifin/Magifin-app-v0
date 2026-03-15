"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "@/lib/wizard-store"

/**
 * Reusable banner component that displays ONLY when there's a real unsaved draft.
 * 
 * CANONICAL RULES:
 * - Shows ONLY if user has entered data AND it hasn't been saved yet (hasUnsavedChanges)
 * - Does NOT show for previously saved simulations (unless user made changes since)
 * - Resume logic: routes to /results if already reached results, else /wizard with full state encoded
 */
export function UnsavedSimulationBanner() {
  const { state, hasUnsavedChanges } = useWizard()

  // Only show banner if there's a REAL unsaved draft
  const hasUnsavedDraft = hasUnsavedChanges()

  if (!hasUnsavedDraft) {
    return null
  }

  // Smart resume logic:
  // 1. If currentStepId is "taxYear", user was viewing results → go to /results (state in localStorage)
  // 2. If currentStepId is anything else, user was in wizard → go to /wizard with state encoded in URL
  //    (ensures state persists even if localStorage is cleared)
  const resumeHref = (() => {
    if (state.currentStepId === "taxYear") {
      return "/results"
    }
    // Encode full state in URL so wizard can restore it
    const resumeData = {
      answers: state.answers,
      currentStepId: state.currentStepId,
      completedStepIds: state.completedStepIds,
    }
    return `/wizard?resume=${btoa(JSON.stringify(resumeData))}`
  })()

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
          Reprendre ma simulation
        </Link>
      </Button>
    </div>
  )
}

