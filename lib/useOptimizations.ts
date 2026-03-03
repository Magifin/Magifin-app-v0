"use client"

import { useMemo } from "react"
import { useWizard } from "@/lib/wizard-store"
import { computeOptimizationsFromAnswers, type OptimizationResult } from "@/lib/computeOptimizationsFromAnswers"
import type { WizardAnswers } from "@/lib/wizard-store"

export interface UseOptimizationsReturn {
  results: OptimizationResult
  answers: WizardAnswers
  hasWizardData: boolean
}

/**
 * Single source of truth hook for optimization results.
 * Both /results and /dashboard/optimisation must use this hook.
 * Ensures totals match everywhere by computing exactly once per render path.
 */
export function useOptimizations(): UseOptimizationsReturn {
  const { state } = useWizard()
  const { answers, completedStepIds } = state

  const hasWizardData = completedStepIds.length > 0

  // Compute optimizations exactly once per render using memoization
  const results = useMemo(() => {
    return computeOptimizationsFromAnswers(answers)
  }, [answers])

  return {
    results,
    answers,
    hasWizardData,
  }
}
