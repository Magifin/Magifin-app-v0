"use client"

import { useState } from "react"
import { Save, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getDefaultTaxYear } from "@/lib/fiscal/tax-year"
import type { WizardAnswers } from "@/lib/wizard-store"
import type { TaxResult } from "@/lib/fiscal/belgium/types"

interface SaveSimulationDialogProps {
  wizardAnswers: WizardAnswers
  taxResult: TaxResult
  editingSimulationId?: string | null
  editingSimulationName?: string | null
  onSaved?: () => void
  trigger?: React.ReactNode
}

export function SaveSimulationDialog({
  wizardAnswers,
  taxResult,
  editingSimulationId,
  editingSimulationName,
  onSaved,
  trigger,
}: SaveSimulationDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(editingSimulationName || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch("/api/simulations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulation_id: editingSimulationId ?? null,
          tax_year: wizardAnswers.taxYear ?? getDefaultTaxYear(),
          name: name.trim() || `Simulation ${wizardAnswers.taxYear ?? getDefaultTaxYear()}`,
          wizard_answers: wizardAnswers,
          tax_result: taxResult,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de la sauvegarde")
        setIsSaving(false)
        return
      }

      setOpen(false)
      setName("")
      onSaved?.()
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-accent" />
            {editingSimulationId ? "Mettre à jour la simulation" : "Sauvegarder cette simulation"}
          </DialogTitle>
          <DialogDescription>
            {editingSimulationId ? "Mettez à jour les détails de votre simulation." : "Enregistrez votre simulation pour la retrouver dans votre dashboard."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="simulation-name" className="text-sm font-medium">
              <FileText className="inline-block h-4 w-4 mr-1.5 text-muted-foreground" />
              Nom de la simulation
            </Label>
            <Input
              id="simulation-name"
              placeholder={`Simulation ${wizardAnswers.taxYear ?? getDefaultTaxYear()}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Déclaration</span>
            <strong className="ml-auto">
              {wizardAnswers.taxYear ?? getDefaultTaxYear()}
            </strong>
          </div>

          {/* Summary preview */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Résumé</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Revenu imposable:</span>
              </div>
              <div className="text-right font-medium">
                {new Intl.NumberFormat("fr-BE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(taxResult.taxableIncome)}
              </div>
              <div>
                <span className="text-muted-foreground">Impôt estimé:</span>
              </div>
              <div className="text-right font-medium">
                {new Intl.NumberFormat("fr-BE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(taxResult.estimatedTax)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (editingSimulationId ? "Mise à jour..." : "Sauvegarde...") : (editingSimulationId ? "Mettre à jour" : "Sauvegarder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
