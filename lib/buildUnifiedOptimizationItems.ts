import type { AppliedOptimizations } from "@/lib/fiscal/belgium/types"
import type { OptimizationResult } from "@/lib/computeOptimizationsFromAnswers"

export interface UnifiedOptimizationItem {
  key: string
  title: string
  amountMin: number
  amountMax: number
  reason: string
  badge: "Confirmé" | "Estimé"
}

/**
 * Build a unified list of optimization items combining:
 * - engine-based applied optimizations (Confirmé badge)
 * - heuristic items from the new structured model with status="potential" (Estimé badge)
 *
 * Implements overlap handling: if an item is already applied by the engine,
 * the heuristic potential version is removed to avoid showing the same benefit twice.
 *
 * Engine items are listed first, then heuristic items.
 */
export function buildUnifiedOptimizationItems(
  appliedOptimizations: AppliedOptimizations | null | undefined,
  optimizationResult: OptimizationResult
): UnifiedOptimizationItem[] {
  const unified: UnifiedOptimizationItem[] = []

  // SECTION 1: Engine-based items (always first)
  if (appliedOptimizations) {
    if (appliedOptimizations.childrenCredit > 0) {
      unified.push({
        key: "children_credit",
        title: "Enfants à charge",
        amountMin: appliedOptimizations.childrenCredit,
        amountMax: appliedOptimizations.childrenCredit,
        reason: "Supplément à la quotité exemptée pour personnes à charge (Art. 132-140 CIR 92).",
        badge: "Confirmé",
      })
    }

    if (appliedOptimizations.pensionCredit > 0) {
      unified.push({
        key: "pension_credit",
        title: "Épargne pension",
        amountMin: appliedOptimizations.pensionCredit,
        amountMax: appliedOptimizations.pensionCredit,
        reason: "Crédit d'impôt de 30% sur votre épargne pension.",
        badge: "Confirmé",
      })
    }

    if (appliedOptimizations.serviceVouchersCredit > 0) {
      unified.push({
        key: "titres_services",
        title: "Titres-services",
        amountMin: appliedOptimizations.serviceVouchersCredit,
        amountMax: appliedOptimizations.serviceVouchersCredit,
        reason: "Crédit d'impôt de 30% sur vos titres-services.",
        badge: "Confirmé",
      })
    }

    if (appliedOptimizations.childcareDeduction > 0) {
      unified.push({
        key: "childcare_deduction",
        title: "Frais de garde d'enfants",
        amountMin: appliedOptimizations.childcareDeduction,
        amountMax: appliedOptimizations.childcareDeduction,
        reason: "Déduction fiscale de 45% sur vos frais de garde d'enfants.",
        badge: "Confirmé",
      })
    }
  }

  // SECTION 2: Heuristic items with status="potential" (show "Estimé" badge)
  // Apply overlap handling: skip heuristic items that are already covered by applied items
  for (const item of optimizationResult.optimisations.potential) {
    // Skip pension_credit if already applied by engine (to avoid showing same benefit twice)
    if (item.id === "pension_credit" && appliedOptimizations?.pensionCredit > 0) {
      continue
    }

    // Skip service_vouchers if already applied by engine as titres_services
    if (item.id === "service_vouchers" && appliedOptimizations?.serviceVouchersCredit > 0) {
      continue
    }

    // Skip childcare if already applied by engine as childcare_deduction
    if (item.id === "childcare" && appliedOptimizations?.childcareDeduction > 0) {
      continue
    }

    unified.push({
      key: item.id,
      title: item.label,
      amountMin: item.amountMin ?? 0,
      amountMax: item.amountMax ?? 0,
      reason: item.reason,
      badge: "Estimé",
    })
  }

  return unified
}
