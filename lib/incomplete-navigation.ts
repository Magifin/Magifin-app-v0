/**
 * Maps incomplete optimization item keys to their corresponding wizard step IDs
 */
export const INCOMPLETE_TO_STEP_MAP: Record<string, string> = {
  pension_incomplete: "pension",
  mortgage_incomplete: "mortgage",
  childcare_incomplete: "childcare",
  srd_insurance_incomplete: "mortgageInsurance",
}

/**
 * Get the wizard step ID for an incomplete optimization item
 */
export function getWizardStepForIncomplete(itemId: string): string | null {
  return INCOMPLETE_TO_STEP_MAP[itemId] ?? null
}

/**
 * Build a wizard resume URL for a specific step
 * @param stepId - The wizard step ID to navigate to
 * @param answers - Current wizard answers to preserve
 * @param simulationId - Optional simulation ID for edit mode
 */
export function buildIncompleteResumeUrl(
  stepId: string,
  answers: Record<string, any>,
  simulationId?: string
): string {
  const resume = btoa(JSON.stringify(answers))
  const params = new URLSearchParams({ resume })
  if (simulationId) {
    params.append("simulationId", simulationId)
  }
  return `/wizard?${params.toString()}`
}
