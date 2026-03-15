"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WizardStep } from "@/lib/wizard-store"

interface WizardProgressProps {
  steps: WizardStep[]
  currentStepId: string
  completedStepIds: string[]
  onStepClick: (stepId: string) => void
}

export function WizardProgress({
  steps,
  currentStepId,
  completedStepIds,
  onStepClick,
}: WizardProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)
  const progress = ((currentIndex + 1) / steps.length) * 100

  const isStepClickable = (stepId: string, index: number): boolean => {
    // Can click completed steps or current step
    if (completedStepIds.includes(stepId)) return true
    if (stepId === currentStepId) return true
    return false
  }

  return (
    <div className="border-b border-border/50 bg-card px-6 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step labels - hidden on mobile, shown on desktop */}
        <div className="hidden items-center justify-between gap-1 sm:flex">
          {steps.map((step, i) => {
            const isCompleted = completedStepIds.includes(step.id)
            const isCurrent = step.id === currentStepId
            const clickable = isStepClickable(step.id, i)

            return (
              <button
                key={step.id}
                onClick={() => clickable && onStepClick(step.id)}
                disabled={!clickable}
                className={cn(
                  "flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors",
                  clickable
                    ? "cursor-pointer hover:bg-muted/50"
                    : "cursor-not-allowed opacity-60"
                )}
                title={step.title}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium truncate max-w-[80px]",
                    isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.shortTitle}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile: current step name + count */}
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-sm font-medium text-foreground">
            {steps[currentIndex]?.title || ""}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {steps.length}
          </span>
        </div>
      </div>
    </div>
  )
}
