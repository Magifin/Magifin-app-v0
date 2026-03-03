// Lightweight tracking utility for Magifin analytics events
// Events are logged to console for now; can be extended to send to analytics service

export type TrackEvent =
  | "click_create_space"
  | "click_insurance_cta"
  | "wizard_step_clicked"
  | "wizard_pension_no_clicked"
  | "wizard_mortgage_insurance_no_clicked"
  | "wizard_completed"
  | "wizard_started"
  | "wizard_view_results_clicked"
  | "account_created"

export function track(eventName: TrackEvent, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return

  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  // Log to console in development
  console.log("[track]", eventName, payload ?? {})

  // Future: Send to analytics service
  // Example: window.analytics?.track(eventName, payload)
}
