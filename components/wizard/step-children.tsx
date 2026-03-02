"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"

interface StepChildrenProps {
  value: number
  onChange: (value: number) => void
}

export function StepChildren({ value, onChange }: StepChildrenProps) {
  const addChild = () => {
    if (value < 10) {
      onChange(value + 1)
    }
  }

  const removeChild = () => {
    if (value > 0) {
      onChange(value - 1)
    }
  }

  return (
    <div>
      <MagiHint message="Les enfants à charge ouvrent souvent droit à des avantages fiscaux importants." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Combien d'enfants avez-vous à charge ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les enfants à charge ouvrent droit à des déductions fiscales."}
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={removeChild}
          disabled={value === 0}
          aria-label="Retirer un enfant"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          {value}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={addChild}
          disabled={value >= 10}
          aria-label="Ajouter un enfant"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {value <= 1 ? "enfant" : "enfants"} {"à charge"}
        </span>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {"Incluez les enfants de moins de 25 ans fiscalement à votre charge."}
      </p>
    </div>
  )
}
