"use client"

import type { WizardData } from "@/app/wizard/page"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Home, XCircle } from "lucide-react"

interface StepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function StepServices({ data, updateData }: StepProps) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Utilisez-vous des titres-services ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les titres-services (aide menagere) donnent droit a une reduction d'impot."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => updateData({ titresServices: true })}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            data.titresServices
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              data.titresServices
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'utilise des titres-services"}
            </p>
          </div>
        </button>

        <button
          onClick={() =>
            updateData({ titresServices: false, titresServicesAmount: 0 })
          }
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            !data.titresServices
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              !data.titresServices
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              Pas de titres-services
            </p>
          </div>
        </button>
      </div>

      {data.titresServices && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Nombre de titres-services achetes par an
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={data.titresServicesAmount || ""}
              onChange={(e) =>
                updateData({
                  titresServicesAmount: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ex: 150"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">titres</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Maximum 170 titres par personne (ou 340 par menage)."}
          </p>
        </div>
      )}
    </div>
  )
}
