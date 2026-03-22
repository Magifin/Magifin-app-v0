"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  Calendar,
  Trash2,
  ArrowRight,
  AlertCircle,
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
import { getDefaultTaxYear } from "@/lib/supabase/types"
import { useWizard } from "@/lib/wizard-store"
import { cn } from "@/lib/utils"
import { UnsavedSimulationBanner } from "@/components/unsaved-simulation-banner"
import { DashboardHeader } from "@/components/dashboard/header"

interface SimulationListItem {
  id: string
  tax_year: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  wizard_answers: any
  tax_result: {
    taxableIncome: number
    estimatedTax: number
    effectiveTaxRate: number
    refundOrBalance?: number
  }
}

export default function SimulationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { state } = useWizard()

  const [simulations, setSimulations] = useState<SimulationListItem[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)

  // Fetch available years
  const fetchYears = useCallback(async () => {
    try {
      const res = await fetch("/api/simulations/years")
      const data = await res.json()
      if (res.ok && data.years) {
        setAvailableYears(data.years)
        // Default to first available year or current year
        const yearToSelect = data.years.length > 0 ? data.years[0] : getDefaultTaxYear()
        setSelectedYear(yearToSelect)
      } else {
        // No simulations yet - still set default year
        setAvailableYears([])
        setSelectedYear(getDefaultTaxYear())
      }
    } catch (e) {
      // Silently fail - will use default year
      setSelectedYear(getDefaultTaxYear())
    }
  }, [])

  // Fetch simulations for selected year
  const fetchSimulations = useCallback(async () => {
    if (!selectedYear) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const url = `/api/simulations/list?tax_year=${selectedYear}`
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/dashboard/simulations")
          return
        }
        setError(data.error || "Erreur lors du chargement")
        setIsLoading(false)
        setInitialized(true)
        return
      }

      setSimulations(data.simulations || [])
      setIsLoading(false)
      setInitialized(true)
    } catch (e) {
      setError("Erreur de connexion")
      setIsLoading(false)
      setInitialized(true)
    }
  }, [selectedYear, router])

  // Delete simulation - preserve selected year filter
  const deleteSimulation = async (id: string) => {
    try {
      const res = await fetch(`/api/simulations/${id}`, { method: "DELETE" })
      if (res.ok) {
        // Remove from local state immediately
        setSimulations((prev) => prev.filter((s) => s.id !== id))
        
        // Refresh available years
        try {
          const yearsRes = await fetch("/api/simulations/years")
          const yearsData = await yearsRes.json()
          if (yearsRes.ok && yearsData.years) {
            setAvailableYears(yearsData.years)
          }
        } catch {
          // Silently fail
        }
        
        // Re-fetch simulations for the CURRENT selected year (preserves filter)
        if (selectedYear !== null) {
          try {
            const simRes = await fetch(`/api/simulations/list?tax_year=${selectedYear}`)
            const simData = await simRes.json()
            if (simRes.ok) {
              setSimulations(simData.simulations || [])
            }
          } catch {
            // Silently fail
          }
        }
      }
    } catch {
      // Silently fail
    }
  }

  // Duplicate simulation - creates a new simulation immediately and refreshes list
  const duplicateSimulation = async (id: string) => {
    try {
      const res = await fetch("/api/simulations/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulationId: id }),
      })

      if (!res.ok) {
        console.error("Failed to duplicate simulation")
        return
      }

      // Refresh the simulations list to show the duplicated simulation
      if (selectedYear !== null) {
        try {
          const simRes = await fetch(`/api/simulations/list?tax_year=${selectedYear}`)
          const simData = await simRes.json()
          if (simRes.ok) {
            setSimulations(simData.simulations || [])
          }
        } catch {
          // Silently fail - list won't update but duplication succeeded
        }
      }
    } catch (error) {
      console.error("Error duplicating simulation:", error)
    }
  }

  // Rename simulation
  const renameSimulation = async (id: string, newName: string) => {
    if (!newName.trim()) return

    try {
      const res = await fetch(`/api/simulations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (res.ok) {
        // Update local state
        setSimulations((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: newName.trim() } : s))
        )
      }
    } catch (error) {
      console.error("Error renaming simulation:", error)
    }
  }

  const handleRenameSimulation = (id: string, currentName: string) => {
    setRenamingId(id)
    setRenameValue(currentName)
    setRenameDialogOpen(true)
  }

  const confirmRename = async () => {
    if (!renamingId) return
    if (!renameValue.trim() || renameValue === simulations.find(s => s.id === renamingId)?.name) {
      setRenameDialogOpen(false)
      return
    }
    await renameSimulation(renamingId, renameValue)
    setRenameDialogOpen(false)
    setRenamingId(null)
    setRenameValue("")
  }

  // Initialize years and auth check
  useEffect(() => {
    if (!authLoading && user) {
      fetchYears()
    }
  }, [authLoading, user, fetchYears])

  // Fetch simulations when year is selected - use minimal dependencies
  useEffect(() => {
    if (selectedYear !== null && user) {
      fetchSimulations()
    }
  }, [selectedYear, user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/dashboard/simulations")
    }
  }, [authLoading, user, router])

  // Timeout fallback: if still loading after 2 seconds, force initialized state
  useEffect(() => {
    if (isLoading && !initialized) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        setInitialized(true)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, initialized])

  // Show auth spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // If not authenticated, show redirect message while redirect processes
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr))
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generate year tabs (available years + default year if not present)
  const yearTabs = [...new Set([...availableYears, getDefaultTaxYear()])].sort(
    (a, b) => b - a
  )

  return (
    <div>
      <UnsavedSimulationBanner />

      <DashboardHeader
        title="Mes simulations"
        description="Retrouvez et gérez toutes vos simulations fiscales."
      />

      {/* Year filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {yearTabs.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              selectedYear === year
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            {year}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !initialized && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && simulations.length === 0 && initialized && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
            Aucune simulation pour {selectedYear}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Créez une nouvelle simulation pour estimer vos économies fiscales.
          </p>
          <Button asChild className="mt-6">
            <Link href="/wizard?new=true">
              <Plus className="mr-2 h-4 w-4" />
              Créer une simulation
            </Link>
          </Button>
        </div>
      )}

      {/* Simulations list */}
      {!isLoading && !error && simulations.length > 0 && initialized && (
        <div className="flex flex-col gap-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              onClick={() => router.push(`/dashboard/simulations/${sim.id}`)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] font-semibold text-card-foreground">
                        {sim.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Créée le {formatDate(sim.created_at)}
                      </p>
                    </div>
                  </div>
                  {sim.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {sim.description}
                    </p>
                  )}
                </div>

                {/* Tax summary */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Impôt estimé</p>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                      {formatMoney(sim.tax_result.estimatedTax)}
                    </p>
                  </div>
                  {sim.tax_result.refundOrBalance !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {sim.tax_result.refundOrBalance >= 0
                          ? "Remboursement"
                          : "À payer"}
                      </p>
                      <p
                        className={cn(
                          "font-[family-name:var(--font-heading)] text-lg font-semibold",
                          sim.tax_result.refundOrBalance >= 0
                            ? "text-accent"
                            : "text-destructive"
                        )}
                      >
                        {sim.tax_result.refundOrBalance >= 0
                          ? formatMoney(sim.tax_result.refundOrBalance)
                          : formatMoney(Math.abs(sim.tax_result.refundOrBalance))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/wizard?resume=${btoa(JSON.stringify(sim.wizard_answers))}&simulationId=${sim.id}`}>
                      Modifier
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/simulations/${sim.id}`)
                    }}
                  >
                    Voir résultats
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Plus d'actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameSimulation(sim.id, sim.name)
                        }}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSimulation(sim.id)
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDialogId(sim.id)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette simulation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La simulation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteDialogId) {
                deleteSimulation(deleteDialogId)
                setDeleteDialogId(null)
              }
            }}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
