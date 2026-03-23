import type { OptimizationItem, StructuredOptimizationItem, StructuredOptimizationResult, AppliedOptimizations } from "@/lib/fiscal/belgium/types"

/**
 * Converts flat OptimizationItem array into structured 4-bucket model.
 * 
 * Bucket mapping:
 * - applied: heuristic items where available === true AND precision !== "advisory"
 * - potential: heuristic items where available === false AND precision === "advisory"
 * - incomplete: items with conditional data missing (future expansion)
 * - ineligible: items where region/status doesn't match full support (future expansion)
 * 
 * @param heuristicItems Flat array from computeOptimizationsFromAnswers
 * @param appliedOptimizations Credits from tax engine
 * @returns Structured result with 4 buckets and totals
 */
export function structureOptimizationItems(
  heuristicItems: OptimizationItem[],
  appliedOptimizations: AppliedOptimizations | null | undefined
): StructuredOptimizationResult {
  const result: StructuredOptimizationResult = {
    applied: [],
    potential: [],
    incomplete: [],
    ineligible: [],
    totals: {
      applied: 0,
      potentialMin: 0,
      potentialMax: 0,
    },
  }

  // Add engine-based credits to "applied" bucket
  if (appliedOptimizations) {
    if (appliedOptimizations.pensionCredit > 0) {
      result.applied.push({
        id: "pension_credit",
        category: "pension",
        label: "Épargne pension",
        status: "applied",
        confidence: "confirmed",
        amount: appliedOptimizations.pensionCredit,
        reason: "Crédit d'impôt de 30% sur votre épargne pension.",
      })
      result.totals.applied += appliedOptimizations.pensionCredit
    }

    if (appliedOptimizations.childrenCredit > 0) {
      result.applied.push({
        id: "children_credit",
        category: "family",
        label: "Enfants à charge",
        status: "applied",
        confidence: "confirmed",
        amount: appliedOptimizations.childrenCredit,
        reason: "Supplément à la quotité exemptée pour personnes à charge (Art. 132-140 CIR 92).",
      })
      result.totals.applied += appliedOptimizations.childrenCredit
    }

    if (appliedOptimizations.serviceVouchersCredit > 0) {
      result.applied.push({
        id: "titres_services",
        category: "other",
        label: "Titres-services",
        status: "applied",
        confidence: "confirmed",
        amount: appliedOptimizations.serviceVouchersCredit,
        reason: "Crédit d'impôt de 30% sur vos titres-services.",
      })
      result.totals.applied += appliedOptimizations.serviceVouchersCredit
    }
  }

  // Process heuristic items
  for (const item of heuristicItems) {
    const structuredItem: StructuredOptimizationItem = {
      id: item.key,
      category: item.category,
      label: item.title,
      status: "applied", // default, will be overridden below
      confidence: item.precision,
      amountMin: item.amountMin,
      amountMax: item.amountMax,
      reason: item.reason,
    }

    if (item.available && item.precision !== "advisory") {
      // Applied: confirmed or estimated and available
      structuredItem.status = "applied"
      result.applied.push(structuredItem)
      result.totals.applied += item.amountMin // use min for totals
    } else if (!item.available && item.precision === "advisory") {
      // Potential: not yet available (e.g., no pension savings yet)
      structuredItem.status = "potential"
      result.potential.push(structuredItem)
      result.totals.potentialMin += item.amountMin
      result.totals.potentialMax += item.amountMax
    } else if (item.precision === "estimated" && !item.available) {
      // Incomplete: estimated but missing data
      structuredItem.status = "incomplete"
      result.incomplete.push(structuredItem)
    } else if (item.precision === "advisory" && item.available === false) {
      // Ineligible or advisory-only
      structuredItem.status = "ineligible"
      result.ineligible.push(structuredItem)
    }
  }

  return result
}
