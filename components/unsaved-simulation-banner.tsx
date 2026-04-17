"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard, wizardStore } from "@/lib/wizard-store"

/**
 * Reusable banner component that displays ONLY when there's a real unsaved draft.
 * 
 * CANONICAL RULES:
 * - Shows ONLY if user has entered data AND it hasn't been saved yet (hasUnsavedChanges)
 * - Does NOT show for previously saved simulations (unless user made changes since)
 * - Resume logic: routes to /results if already reached results, else /wizard with full state encoded
 */
export function UnsavedSimulationBanner() {
  const { state, hasUnsavedChanges, resetWizard } = useWizard()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Hydrate wizard state from localStorage on mount
  // This allows the banner to detect unsaved drafts
  useEffect(() => {
    wizardStore.hydrate()
    setIsHydrated(true)
  }, [])

  // Only show banner if there's a REAL unsaved draft and it hasn't been dismissed
  const hasUnsavedDraft = isHydrated && hasUnsavedChanges() && !isDismissed

  if (!hasUnsavedDraft) {
    return null
  }

  const handleDismiss = () => {
    // Completely discard the draft
    resetWizard()
    // Mark as dismissed so it doesn't reappear until a new draft is created
    setIsDismissed(true)
  }

  // Resume logic: Always route to /wizard with full state encoded in URL
  // This ensures wizard state is restored regardless of where user was
  const resumeHref = (() => {
    const resumeData = {
      answers: state.answers,
      currentStepId: state.currentStepId,
      completedStepIds: state.completedStepIds,
    }
    return `/wizard?resume=${encodeURIComponent(btoa(JSON.stringify(resumeData)))}`
  })()

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-accent" />
        <p className="text-sm text-card-foreground">
          Vous avez une simulation en cours non sauvegardée.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" asChild className="gap-2">
          <Link href={resumeHref}>
            <ArrowRight className="h-4 w-4" />
            Reprendre ma simulation
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
          title="Supprimer le brouillon"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

