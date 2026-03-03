"use client"

import { Component, type ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"

// Error boundary to catch Analytics crashes in v0 runtime
class AnalyticsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Silently ignore Analytics errors in v0 runtime
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

export function SafeAnalytics() {
  return (
    <AnalyticsErrorBoundary>
      <Analytics />
    </AnalyticsErrorBoundary>
  )
}
