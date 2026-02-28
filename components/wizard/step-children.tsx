"use client"

import type { WizardData } from "@/app/wizard/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, X } from "lucide-react"

interface StepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function StepChildren({ data, updateData }: StepProps) {
  const addChild = () => {
    updateData({
      childrenCount: data.childrenCount + 1,
      childrenAges: [...data.childrenAges, 0],
    })
  }

  const removeChild = () => {
    if (data.childrenCount > 0) {
      updateData({
        childrenCount: data.childrenCount - 1,
        childrenAges: data.childrenAges.slice(0, -1),
      })
    }
  }

  const updateAge = (index: number, age: number) => {
    const newAges = [...data.childrenAges]
    newAges[index] = age
    updateData({ childrenAges: newAges })
  }

  const removeSpecificChild = (index: number) => {
    const newAges = data.childrenAges.filter((_, i) => i !== index)
    updateData({
      childrenCount: data.childrenCount - 1,
      childrenAges: newAges,
    })
  }

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Combien d'enfants avez-vous a charge ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les enfants a charge ouvrent droit a des deductions fiscales."}
      </p>

      {/* Counter */}
      <div className="mt-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={removeChild}
          disabled={data.childrenCount === 0}
          aria-label="Retirer un enfant"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          {data.childrenCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={addChild}
          disabled={data.childrenCount >= 10}
          aria-label="Ajouter un enfant"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {data.childrenCount <= 1 ? "enfant" : "enfants"} a charge
        </span>
      </div>

      {/* Ages */}
      {data.childrenCount > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-sm font-medium text-foreground">
            {"Age de chaque enfant"}
          </p>
          <div className="flex flex-col gap-3">
            {data.childrenAges.map((age, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-muted-foreground">
                  Enfant {i + 1}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={25}
                  value={age}
                  onChange={(e) => updateAge(i, parseInt(e.target.value) || 0)}
                  className="w-24"
                  placeholder="Age"
                />
                <span className="text-sm text-muted-foreground">ans</span>
                <button
                  onClick={() => removeSpecificChild(i)}
                  className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Retirer enfant ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
