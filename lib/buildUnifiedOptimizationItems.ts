import type { AppliedOptimizations } from "@/lib/fiscal/belgium/types"
import type { OptimizationItem } from "@/lib/computeOptimizationsFromAnswers"

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
 * - heuristic items with available === true and precision !== "advisory" (Confirmé/Estimé badge)
 *
 * Engine items are listed first, then heuristic items.
 */
export function buildUnifiedOptimizationItems(
  appliedOptimizations: AppliedOptimizations | null | undefined,
  heuristicItems: OptimizationItem[]
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
  }

  // SECTION 2: Heuristic items (available only, exclude advisory)
  for (const item of heuristicItems) {
    if (item.available && item.precision !== "advisory") {
      unified.push({
        key: item.key,
        title: item.title,
        amountMin: item.amountMin,
        amountMax: item.amountMax,
        reason: item.reason,
        badge: item.precision === "confirmed" ? "Confirmé" : "Estimé",
      })
    }
  }

  return unified
}
