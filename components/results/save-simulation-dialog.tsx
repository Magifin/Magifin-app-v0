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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDefaultTaxYear, getAvailableTaxYears } from "@/lib/supabase/types"
import type { WizardAnswers } from "@/lib/wizard-store"
import type { TaxResult } from "@/lib/fiscal/belgium/types"

interface SaveSimulationDialogProps {
  wizardAnswers: WizardAnswers
  taxResult: TaxResult
  onSaved?: () => void
  trigger?: React.ReactNode
}

export function SaveSimulationDialog({
  wizardAnswers,
  taxResult,
  onSaved,
  trigger,
}: SaveSimulationDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [taxYear, setTaxYear] = useState<string>(String(getDefaultTaxYear()))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableYears = getAvailableTaxYears()

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch("/api/simulations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tax_year: parseInt(taxYear, 10),
          name: name.trim() || `Simulation ${taxYear}`,
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
            Sauvegarder cette simulation
          </DialogTitle>
          <DialogDescription>
            Enregistrez votre simulation pour la retrouver dans votre dashboard.
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
              placeholder={`Simulation ${taxYear}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="tax-year" className="text-sm font-medium">
              <Calendar className="inline-block h-4 w-4 mr-1.5 text-muted-foreground" />
              Année fiscale
            </Label>
            <Select value={taxYear} onValueChange={setTaxYear}>
              <SelectTrigger id="tax-year" className="mt-2">
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              L&apos;année fiscale pour laquelle vous faites cette simulation
            </p>
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
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
