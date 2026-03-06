import type { WizardAnswers } from "@/lib/wizard-store"
import type { TaxInput } from "./types"

const INCOME_BRACKET_MIDPOINTS: Record<string, number> = {
  "0-20000": 10000,
  "20000-35000": 27500,
  "35000-50000": 42500,
  "50000-80000": 65000,
  "80000+": 95000,
}

const REGION_MAP: Record<string, TaxInput["region"]> = {
  Wallonie: "wallonia",
  Bruxelles: "brussels",
  Flandre: "flanders",
}

/**
 * Maps wizard answers to the TaxInput expected by /api/tax/compute.
 * Returns null if the minimum required fields are not filled in.
 */
export function mapAnswersToTaxInput(answers: WizardAnswers): TaxInput | null {
  if (!answers.region || !answers.incomeBracket) return null

  const region = REGION_MAP[answers.region]
  if (!region) return null

  const salaryIncome = INCOME_BRACKET_MIDPOINTS[answers.incomeBracket] ?? 0

  const dependents = answers.children ?? 0

  const pensionContribution =
    answers.pensionSaving === "Oui" && answers.pensionSavingAmount > 0
      ? answers.pensionSavingAmount
      : 0

  return {
    region,
    salaryIncome,
    dependents,
    pensionContribution,
  }
}
