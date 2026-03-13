"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Calculator,
  FileText,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type { Simulation } from "@/lib/supabase/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"

export default function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(`/auth/login?redirect=/dashboard/simulations/${id}`)
      return
    }

    const fetchSimulation = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/simulations/${id}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Simulation non trouvée")
          return
        }

        setSimulation(data.simulation)
      } catch (err) {
        setError("Erreur de connexion")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimulation()
  }, [id, user, authLoading, router])

  // Timeout fallback: if still loading after 2 seconds, force resolution to prevent infinite spinner
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        if (!simulation && !error) {
          setError("Délai d'attente dépassé")
        }
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, simulation, error])

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/simulations/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/dashboard/simulations")
      }
    } catch {
      // Silently fail
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !simulation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive">{error || "Simulation non trouvée"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/simulations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux simulations
          </Link>
        </Button>
      </div>
    )
  }

  const { tax_result, wizard_answers } = simulation

  return (
    <div>
      <UnsavedSimulationBanner />

      {/* Header with navigation */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard/simulations"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux simulations
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href={`/dashboard/optimisation?simulationId=${id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Optimisation fiscale
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
                    {simulation.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Déclaration {simulation.tax_year} · revenus {simulation.tax_year - 1}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Créée le {formatDate(simulation.created_at)}</span>
                </div>
              </div>
            </div>
            {simulation.description && (
              <p className="mt-3 text-muted-foreground">{simulation.description}</p>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive/5">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette simulation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La simulation sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tax Result Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Calculator className="h-5 w-5" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
            Résultat fiscal
          </h2>
        </div>

        {/* Tax breakdown */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Revenu imposable</dt>
            <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
              {formatMoney(tax_result.taxableIncome)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ajustements fiscaux automatiques</dt>
            <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-accent">
              -{formatMoney(tax_result.deductionsApplied)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{"Impôt estimé"}</dt>
            <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
              {formatMoney(tax_result.estimatedTax)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Taux effectif</dt>
            <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
              {(tax_result.effectiveTaxRate * 100).toFixed(1)}%
            </dd>
          </div>
        </dl>

        {/* Withholding and balance summary */}
        {(tax_result.taxesAlreadyPaid > 0 || tax_result.refundOrBalance !== 0) && (
          <div className="mt-6 border-t border-border pt-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-4">
                <dt className="text-xs text-muted-foreground mb-1">Impôts déjà payés</dt>
                <dd className="font-[family-name:var(--font-heading)] text-xl font-semibold text-card-foreground">
                  {formatMoney(tax_result.taxesAlreadyPaid)}
                </dd>
              </div>
              <div
                className={cn(
                  "rounded-lg p-4",
                  tax_result.refundOrBalance >= 0
                    ? "bg-accent/10"
                    : "bg-destructive/10"
                )}
              >
                <dt
                  className={cn(
                    "text-xs mb-1",
                    tax_result.refundOrBalance >= 0
                      ? "text-accent"
                      : "text-destructive"
                  )}
                >
                  {tax_result.refundOrBalance >= 0
                    ? "Remboursement estimé"
                    : "Montant encore dû"}
                </dt>
                <dd
                  className={cn(
                    "font-[family-name:var(--font-heading)] text-xl font-semibold",
                    tax_result.refundOrBalance >= 0
                      ? "text-accent"
                      : "text-destructive"
                  )}
                >
                  {tax_result.refundOrBalance >= 0
                    ? formatMoney(tax_result.refundOrBalance)
                    : "−" + formatMoney(Math.abs(tax_result.refundOrBalance))}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Optimization Items from saved simulation */}
      {tax_result.items && tax_result.items.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-card-foreground">
            Optimisations identifiées
          </h2>
          <div className="flex flex-col gap-3">
            {tax_result.items.filter((item: { available: boolean }) => item.available).map((item: { key: string; label: string; details: string; savingsMin: number; savingsMax: number }) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.details}</p>
                </div>
                <div className="text-right">
                  <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-accent">
                    {item.savingsMin === item.savingsMax
                      ? formatMoney(item.savingsMin)
                      : `${formatMoney(item.savingsMin)} - ${formatMoney(item.savingsMax)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wizard Answers Summary */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-[family-name:var(--font-heading)] font-bold text-card-foreground">
          Données de la simulation
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wizard_answers.region && (
            <div>
              <dt className="text-xs text-muted-foreground">Région</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {wizard_answers.region}
              </dd>
            </div>
          )}
          {wizard_answers.status && (
            <div>
              <dt className="text-xs text-muted-foreground">Statut</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {wizard_answers.status}
              </dd>
            </div>
          )}
          {wizard_answers.annualGrossIncome > 0 && (
            <div>
              <dt className="text-xs text-muted-foreground">Revenu brut annuel</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {formatMoney(wizard_answers.annualGrossIncome)}
              </dd>
            </div>
          )}
          {wizard_answers.incomeBracket && (
            <div>
              <dt className="text-xs text-muted-foreground">Tranche de revenu</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {wizard_answers.incomeBracket}
              </dd>
            </div>
          )}
          {wizard_answers.children > 0 && (
            <div>
              <dt className="text-xs text-muted-foreground">Enfants à charge</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {wizard_answers.children}
              </dd>
            </div>
          )}
          {wizard_answers.pensionSaving === "Oui" && wizard_answers.pensionSavingAmount > 0 && (
            <div>
              <dt className="text-xs text-muted-foreground">Épargne pension</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {formatMoney(wizard_answers.pensionSavingAmount)}
              </dd>
            </div>
          )}
          {wizard_answers.housingStatus && (
            <div>
              <dt className="text-xs text-muted-foreground">Logement</dt>
              <dd className="mt-1 text-sm font-medium text-card-foreground">
                {wizard_answers.housingStatus}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Navigation CTA */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/optimisation?simulationId=${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
            Voir optimisations
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/wizard?resume=${btoa(JSON.stringify(wizard_answers))}&simulationId=${id}`}>
            <Calculator className="mr-2 h-4 w-4" />
            {"Mettre à jour cette simulation"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
