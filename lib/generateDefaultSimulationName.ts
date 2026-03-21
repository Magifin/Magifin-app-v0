/**
 * Generate a default simulation name based on the current date and tax year
 * Format: "Simulation [TAX_YEAR] - [DD/MM/YYYY]"
 * Example: "Simulation 2026 - 21/03/2026"
 */
export function generateDefaultSimulationName(taxYear?: number): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, "0")
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()
  const dateStr = `${day}/${month}/${year}`
  
  if (taxYear) {
    return `Simulation ${taxYear} - ${dateStr}`
  }
  
  return `Simulation ${dateStr}`
}
