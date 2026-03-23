"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Calculator,
  FileText,
  Trash2,
  Copy,
  Edit3,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type { Simulation } from "@/lib/supabase/types"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"
import { formatDeclarationYear } from "@/lib/format-declaration-year"
import { DashboardHeader } from "@/components/dashboard/header"

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
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

        // Track as last viewed so dashboard and optimisation default to this simulation
        if (typeof window !== "undefined") {
          localStorage.setItem("magifin_last_viewed_simulation_id", id)
        }
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

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const res = await fetch("/api/simulations/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulationId: id }),
      })

      if (!res.ok) {
        console.error("Failed to duplicate simulation")
        setIsDuplicating(false)
        return
      }

      const data = await res.json()
      const duplicatedId = data.simulation?.id

      if (duplicatedId) {
        router.push(`/dashboard/simulations/${duplicatedId}`)
      }
    } catch (error) {
      console.error("Error duplicating simulation:", error)
      setIsDuplicating(false)
    }
  }

  const renameSimulation = async (newName: string) => {
    if (!newName.trim()) return

    try {
      const res = await fetch(`/api/simulations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (res.ok) {
        setSimulation((prev) => prev ? { ...prev, name: newName.trim() } : null)
      }
    } catch (error) {
      console.error("Error renaming simulation:", error)
    }
  }

  const handleRenameSimulation = () => {
    setRenameValue(simulation?.name || "")
    setRenameDialogOpen(true)
  }

  const confirmRename = async () => {
    if (!renameValue.trim() || renameValue === simulation?.name) {
      setRenameDialogOpen(false)
      return
    }
    await renameSimulation(renameValue)
    setRenameDialogOpen(false)
    setRenameValue("")
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
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/dashboard/simulations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux simulations
        </Link>
      </div>

      <DashboardHeader
        title={simulation.name}
        description={`Créée le ${formatDate(simulation.created_at)} - ${formatDeclarationYear(simulation.tax_year - 1)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/wizard?resume=${btoa(JSON.stringify(simulation.wizard_answers))}&simulationId=${id}`}>
                <Calculator className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/results?simulationId=${id}`}>
                Voir résultats
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Plus d'actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRenameSimulation}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Renommer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                  <Copy className="mr-2 h-4 w-4" />
                  {isDuplicating ? "Duplication..." : "Dupliquer"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

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

        {/* Fiscal summary - 2 rows */}
        <div className="space-y-6">
          {/* Row 1: Main metrics */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Revenu imposable</dt>
              <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
                {formatMoney(tax_result.taxableIncome)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Optimisations appliquées</dt>
              <dd className="mt-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-accent">
                −{formatMoney(tax_result.appliedOptimizations.total)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Impôt estimé</dt>
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

          {/* Row 2: Withholding and balance */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/30 p-4">
              <dt className="text-xs text-muted-foreground mb-1">Impôts déjà payés</dt>
              <dd className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
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
                  "font-[family-name:var(--font-heading)] text-lg font-semibold",
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
            Voir optimisation
          </Link>
        </Button>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer la simulation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nouveau nom de la simulation"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmRename()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmRename}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette simulation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La simulation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
