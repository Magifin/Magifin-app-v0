"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

const steps = [
  "Sauvegarde de votre analyse fiscale",
  "Activation de votre suivi financier",
  "Préparation de votre espace personnel",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Progress through each step
    timers.push(setTimeout(() => setActiveStep(1), 900))
    timers.push(setTimeout(() => setActiveStep(2), 1800))
    timers.push(
      setTimeout(() => {
        setActiveStep(3)
        setCompleted(true)
      }, 2700)
    )

    // Redirect after completion
    timers.push(setTimeout(() => router.push("/welcome"), 3400))

    return () => timers.forEach(clearTimeout)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-base font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground">
            Magifin
          </span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl text-balance">
            {"Création de votre espace Magifin"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {"Nous préparons tout pour vous\u2026"}
          </p>
        </div>

        {/* Steps */}
        <div className="flex w-full max-w-xs flex-col gap-4">
          {steps.map((label, i) => {
            const isDone = activeStep > i
            const isCurrent = activeStep === i

            return (
              <div
                key={i}
                className={`flex items-center gap-3 transition-opacity duration-500 ${
                  isDone || isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={`text-sm transition-colors duration-500 ${
                    isDone
                      ? "font-medium text-foreground"
                      : isCurrent
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: completed ? "100%" : `${(activeStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
