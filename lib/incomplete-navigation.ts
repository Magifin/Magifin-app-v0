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
 * Encodes both the answers and the target stepId in the resume param.
 * The wizard will decode this and navigate directly to the target step.
 */
export function buildIncompleteResumeUrl(
  stepId: string,
  answers: Record<string, any>,
  simulationId?: string
): string {
  // Include the target stepId in the resume data so wizard knows where to navigate
  const resumeData = {
    answers,
    currentStepId: stepId,
  }
  const resume = btoa(JSON.stringify(resumeData))
  const params = new URLSearchParams({ resume })
  if (simulationId) {
    params.append("simulationId", simulationId)
  }
  return `/wizard?${params.toString()}`
}
