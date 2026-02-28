"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { WizardProgress } from "@/components/wizard/wizard-progress"
import { StepSituation } from "@/components/wizard/step-situation"
import { StepChildren } from "@/components/wizard/step-children"
import { StepChildcare } from "@/components/wizard/step-childcare"
import { StepServices } from "@/components/wizard/step-services"
import { StepPension } from "@/components/wizard/step-pension"
import { Button } from "@/components/ui/button"

export interface WizardData {
  situation: string
  childrenCount: number
  childrenAges: number[]
  childcareCost: number
  hasChildcare: boolean
  titresServices: boolean
  titresServicesAmount: number
  epargnesPension: boolean
  epargnesPensionAmount: number
}

const STEPS = [
  "Situation du ménage",
  "Enfants",
  "Frais de garde",
  "Titres-services",
  "Épargne pension",
]

const defaultData: WizardData = {
  situation: "",
  childrenCount: 0,
  childrenAges: [],
  childcareCost: 0,
  hasChildcare: false,
  titresServices: false,
  titresServicesAmount: 0,
  epargnesPension: false,
  epargnesPensionAmount: 0,
}

export default function WizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<WizardData>(defaultData)

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      const params = new URLSearchParams()
      params.set("situation", data.situation)
      params.set("children", String(data.childrenCount))
      params.set("childcare", String(data.childcareCost))
      params.set("hasChildcare", String(data.hasChildcare))
      params.set("titresServices", String(data.titresServices))
      params.set("titresServicesAmount", String(data.titresServicesAmount))
      params.set("epargnesPension", String(data.epargnesPension))
      params.set("epargnesPensionAmount", String(data.epargnesPensionAmount))
      router.push(`/results?${params.toString()}`)
    }
  }

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return data.situation !== ""
      case 1:
        return true
      case 2:
        return true
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepSituation data={data} updateData={updateData} />
      case 1:
        return <StepChildren data={data} updateData={updateData} />
      case 2:
        return <StepChildcare data={data} updateData={updateData} />
      case 3:
        return <StepServices data={data} updateData={updateData} />
      case 4:
        return <StepPension data={data} updateData={updateData} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <WizardProgress steps={STEPS} currentStep={currentStep} />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        <div className="flex-1">{renderStep()}</div>

        <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-10">
          <Button
            variant="ghost"
            onClick={back}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Précédent"}
          </Button>
          <Button onClick={next} disabled={!canProceed()}>
            {currentStep === STEPS.length - 1 ? "Voir les résultats" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  )
}
