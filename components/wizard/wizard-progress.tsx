import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardProgressProps {
  steps: string[]
  currentStep: number
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="border-b border-border/50 bg-card px-6 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step labels - hidden on mobile, shown on desktop */}
        <div className="hidden items-center justify-between sm:flex">
          {steps.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  i < currentStep
                    ? "bg-primary text-primary-foreground"
                    : i === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {i < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  i <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile: just step count */}
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-sm font-medium text-foreground">
            {steps[currentStep]}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>
    </div>
  )
}
