"use client"

// Cache invalidation: TrendingUp icon fix
import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Edit3,
  Lock,
  Calculator,
  Save,
  Calendar,
  LayoutDashboard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AccountDropdown } from "@/components/account-dropdown"
import { useWizard, wizardStore, getLastCompletedStepId } from "@/lib/wizard-store"
import type { WizardAnswers } from "@/lib/wizard-store"
import { computeOptimizationsFromAnswers } from "@/lib/computeOptimizationsFromAnswers"
import { buildUnifiedOptimizationItems } from "@/lib/buildUnifiedOptimizationItems"
import { formatMoney, formatMoneyRange } from "@/lib/formatMoney"
import { track } from "@/lib/track"
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mapAnswersToTaxInput"
import { formatDeclarationYear } from "@/lib/format-declaration-year"
import { Button } from "@/components/ui/button"
import { SaveSimulationDialog } from "@/components/results/save-simulation-dialog"
import { cn } from "@/lib/utils"
import type { TaxResult } from "@/lib/fiscal/belgium/types"

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=results&utm_campaign=insurance"

export function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const simulationId = searchParams.get("simulationId")
  const { state, markAsSaved } = useWizard()
  const { answers, completedStepIds, editingSimulationId } = state
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  const [taxResult, setTaxResult] = useState<TaxResult | null>(null)
  const [taxLoading, setTaxLoading] = useState(false)
  const [taxError, setTaxError] = useState<string | null>(null)

  // Saved simulation mode: local state only — NEVER written to wizard store
  const [simulationAnswers, setSimulationAnswers] = useState<WizardAnswers | null>(null)
  const [simulationLoading, setSimulationLoading] = useState(false)

  // Effective answers: saved simulation or current wizard session
  const activeAnswers = simulationAnswers ?? answers
  const results = useMemo(
    () => computeOptimizationsFromAnswers(activeAnswers),
    [activeAnswers]
  )

  // Hydrate wizard store only in current session mode
  useEffect(() => {
    if (!simulationId) {
      wizardStore.hydrate()
    }
  }, [simulationId])

  // Saved simulation mode: fetch from API, store locally, NEVER touch wizard store
  useEffect(() => {
    if (!simulationId) {
      setSimulationAnswers(null)
      return
    }
    setSimulationLoading(true)
    setTaxResult(null)
    setSimulationAnswers(null)
    fetch(`/api/simulations/${simulationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.simulation) {
          setSimulationAnswers(data.simulation.wizard_answers as WizardAnswers)
          // Track last viewed simulation
          if (typeof window !== "undefined") {
            localStorage.setItem("magifin_last_viewed_simulation_id", simulationId)
          }
        }
      })
      .catch(() => {})
      .finally(() => setSimulationLoading(false))
  }, [simulationId])

  // Ensure auth initializes within reasonable time (max 2 seconds)
  useEffect(() => {
    if (!authLoading) {
      setAuthInitialized(true)
    } else {
      setAuthInitialized(false)
    }
    
    const timeout = setTimeout(() => {
      setAuthInitialized(true)
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [authLoading, authUser])

  useEffect(() => {
    // Compute effective answers (from saved simulation or current session)
    const effectiveAnswers = simulationId ? simulationAnswers : answers

    if (!effectiveAnswers || Object.keys(effectiveAnswers).length === 0) return
    if (!effectiveAnswers.taxYear) return

    const input = mapAnswersToTaxInput(effectiveAnswers)
    if (!input) return

    setTaxLoading(true)
    setTaxError(null)

    fetch("/api/tax/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setTaxResult(data.result as TaxResult)
        } else {
          setTaxError(data.error ?? "Erreur de calcul")
        }
      })
      .catch(() => setTaxError("Impossible de calculer l'impôt"))
      .finally(() => setTaxLoading(false))
  }, [answers, simulationId, simulationAnswers])

  // Compute optimizations using the correct source of truth
  const displayResults = useMemo(() => {
    return computeOptimizationsFromAnswers(activeAnswers)
  }, [activeAnswers])

  // Build unified optimization items (engine + heuristic)
  const unifiedItems = buildUnifiedOptimizationItems(
    taxResult?.appliedOptimizations ?? null,
    displayResults.items
  )
  
  // Calculate totals from unified items
  const optimizationTotalMin = unifiedItems.reduce((sum, item) => sum + item.amountMin, 0)
  const optimizationTotalMax = unifiedItems.reduce((sum, item) => sum + item.amountMax, 0)

  // Consistent auth check used throughout the app
  const isAuthenticated = authInitialized && !!authUser

  const handleModifyAnswers = () => {
    if (simulationId) {
      // Saved simulation mode: must always use the saved simulation answers.
      // Never fall through to session mode while the async data is still loading.
      if (!simulationAnswers) return

      const resumeData = {
        answers: simulationAnswers?.wizard_answers ?? simulationAnswers,
        currentStepId: "taxYear",
        completedStepIds: [],
      }

      router.push(`/wizard?resume=${encodeURIComponent(btoa(JSON.stringify(resumeData)))}&simulationId=${simulationId}`)
    } else {
      // Session mode: keep current behavior unchanged
      const resumeData = {
        answers,
        currentStepId: editingSimulationId
          ? "taxYear"
          : getLastCompletedStepId(completedStepIds, answers),
        completedStepIds,
      }

      router.push(`/wizard?resume=${encodeURIComponent(btoa(JSON.stringify(resumeData)))}`)
    }
  }

  const handleCreateSpace = () => {
    track("click_create_space")
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "results_page" })
  }

  const handleSimulationSaved = () => {
    setSavedSuccess(true)
    markAsSaved()
    track("simulation_saved")
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Determine left card title
  const leftCardTitle =
    !results.isFullySupported || unifiedItems.length > 0
      ? "Débloquez votre optimisation fiscale complète"
      : "Vérification complète de vos droits fiscaux"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:items-center sm:justify-between sm:flex-row">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={handleModifyAnswers}
              disabled={!!simulationId && simulationAnswers === null}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <span className="text-border">|</span>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </Link>
                <span className="text-border">|</span>
              </>
            )}
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Accueil
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && <AccountDropdown />}
            {/* Save button for authenticated users */}
            {authInitialized && !!authUser && taxResult && !simulationId && (
              <SaveSimulationDialog
                wizardAnswers={answers}
                taxResult={taxResult}
                editingSimulationId={editingSimulationId}
                onSaved={handleSimulationSaved}
                trigger={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Sauvegarder</span>
                  </Button>
                }
              />
            )}
            {/* Login link for unauthenticated users */}
            {authInitialized && !authUser && (
              <Link
                href="/auth/login?redirect=/results"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Save success toast */}
      {savedSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Simulation sauvegardée</span>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        {/* Hero estimate - totals and final balance (RESTORED) */}
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Votre situation analysée
          </p>

              {activeAnswers.taxYear && (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDeclarationYear(activeAnswers.taxYear - 1)}</span>
                </div>
              )}

          <p className="mb-3 mt-6 text-sm font-semibold uppercase tracking-widest text-accent">
            Votre estimation fiscale
          </p>
          
          {/* Primary focus: show final balance/result */}
          {taxResult && !taxLoading && (
            <>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance mb-2">
                {taxResult.refundOrBalance >= 0
                  ? "Remboursement estimé"
                  : "Montant estimé à payer"}
              </h1>
              <div className="mt-6 flex items-baseline justify-center gap-3 sm:gap-4">
                <span className="font-[family-name:var(--font-heading)] text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
                  {formatMoney(Math.abs(taxResult.refundOrBalance))}
                </span>
              </div>
            </>
          )}

          {!taxResult && !taxLoading && !taxError && !simulationLoading && (
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Complétez vos informations
            </h1>
          )}

          <p className="mt-4 text-sm text-muted-foreground">
            {"*Estimation basée sur les informations fournies. Le montant réel peut varier."}
          </p>

          {!isAuthenticated && (
            <>
              <Button
                size="lg"
                className="mt-8 h-12 px-8 text-base"
                asChild
                onClick={handleCreateSpace}
              >
                <Link href="/auth/sign-up?from=results">
                  {"Créer mon espace Magifin"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {"Gratuit · Sans engagement · 5 minutes"}
              </p>
            </>
          )}

          {isAuthenticated && (
            <div className="mt-8 flex flex-col gap-3">
              <Button
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/dashboard">
                  {"Accéder au tableau de bord"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href={simulationId ? `/dashboard/optimisation?simulationId=${simulationId}` : "/dashboard/optimisation"}>
                  {"Voir mes optimisations"}
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Cards grid - Left: Optimizations | Right: Insurance */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left: Unlock optimisations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {leftCardTitle}
              </h2>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-card-foreground">
                  {"Vérification complète de vos droits fiscaux"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-card-foreground">
                  {"Détection automatique des économies potentielles"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-card-foreground">
                  {"Assistance jusqu'à la déclaration finale"}
                </span>
              </li>
            </ul>
            {!results.isFullySupported && (
              <p className="mt-4 text-xs text-muted-foreground/70">
                {"Précision complète bientôt disponible pour votre région / statut."}
              </p>
            )}
            {!isAuthenticated && (
              <Button
                size="sm"
                className="mt-5 w-full"
                asChild
                onClick={handleCreateSpace}
              >
                <Link href="/auth/sign-up?from=results">
                  {"Créer mon espace Magifin"}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {isAuthenticated && (
              <Button
                size="sm"
                className="mt-5 w-full"
                asChild
              >
                <Link href={simulationId ? `/dashboard/optimisation?simulationId=${simulationId}` : "/dashboard/optimisation"}>
                  {"Voir mes optimisations"}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Right: Assurance partner */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                {"Optimisez vos assurances"}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-card-foreground">
              {"Certaines assurances peuvent améliorer votre protection financière tout en réduisant votre charge fiscale."}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {"Vérifiez si des optimisations supplémentaires sont possibles dans votre déclaration."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-5 w-full"
              asChild
              onClick={handleInsuranceCta}
            >
              <a
                href={PARTNER_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {"Vérifier mes assurances"}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Tax Computation Card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Calculator className="h-5 w-4" />
            </div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
              {"Calcul d\u2019impôt estimé"}
            </h2>
          </div>

          {(taxLoading || simulationLoading) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {simulationLoading ? "Chargement de la simulation..." : "Calcul en cours..."}
            </div>
          )}

          {taxError && !taxLoading && (
            <p className="text-sm text-destructive">{taxError}</p>
          )}

          {taxResult && !taxLoading && (
            <div className="space-y-4">
              {/* LINE 1: Impôt hors optimisations → Applied optimizations → = Impôt dû après optimisations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Impôt hors optimisations</span>
                  <span className="font-[family-name:var(--font-heading)] font-semibold text-card-foreground">{formatMoney(taxResult.baseTax)}</span>
                </div>

                {/* Applied optimizations rows - only show if amount > 0 */}
                {taxResult.appliedOptimizations.pensionCredit > 0 && (
                  <div className="flex items-center justify-between text-sm pl-4 border-l-2 border-primary/20">
                    <span className="text-muted-foreground">- Épargne pension</span>
                    <span className="font-[family-name:var(--font-heading)] font-medium text-primary">-{formatMoney(taxResult.appliedOptimizations.pensionCredit)}</span>
                  </div>
                )}
                {taxResult.appliedOptimizations.childrenCredit > 0 && (
                  <div className="flex items-center justify-between text-sm pl-4 border-l-2 border-primary/20">
                    <span className="text-muted-foreground">- Enfants à charge</span>
                    <span className="font-[family-name:var(--font-heading)] font-medium text-primary">-{formatMoney(taxResult.appliedOptimizations.childrenCredit)}</span>
                  </div>
                )}
                {taxResult.appliedOptimizations.serviceVouchersCredit > 0 && (
                  <div className="flex items-center justify-between text-sm pl-4 border-l-2 border-primary/20">
                    <span className="text-muted-foreground">- Titres-services</span>
                    <span className="font-[family-name:var(--font-heading)] font-medium text-primary">-{formatMoney(taxResult.appliedOptimizations.serviceVouchersCredit)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                  <span className="font-medium">= Impôt dû après optimisations</span>
                  <span className="font-[family-name:var(--font-heading)] font-bold text-primary text-base">{formatMoney(taxResult.estimatedTax)}</span>
                </div>
              </div>

              {/* LINE 2: Déjà prélevé vs Impôt dû = Remboursement / Complément */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Déjà prélevé</span>
                  <span className="font-[family-name:var(--font-heading)] font-semibold text-card-foreground">{formatMoney(activeAnswers.taxesAlreadyPaid || 0)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Impôt dû</span>
                  <span className="font-[family-name:var(--font-heading)] font-semibold text-card-foreground">{formatMoney(taxResult.estimatedTax)}</span>
                </div>

                {taxResult.refundOrBalance !== 0 && (
                  <div className={cn("flex items-center justify-between text-sm rounded-lg border-2 px-3 py-2", taxResult.refundOrBalance >= 0 ? "border-primary/35 bg-primary/8" : "border-destructive bg-destructive/5")}>
                    <span className={cn("font-medium", taxResult.refundOrBalance >= 0 ? "text-primary" : "text-destructive")}>
                      = {taxResult.refundOrBalance >= 0 ? "Remboursement estimé" : "Solde restant dû"}
                    </span>
                    <span
                      className={cn(
                        "font-[family-name:var(--font-heading)] font-bold text-base",
                        taxResult.refundOrBalance >= 0 ? "text-primary" : "text-destructive"
                      )}
                    >
                      {taxResult.refundOrBalance >= 0
                        ? `+${formatMoney(taxResult.refundOrBalance)}`
                        : formatMoney(taxResult.refundOrBalance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer: Effective tax rate and disclaimer */}
              <div className="space-y-2 border-t border-border/40 pt-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground/60">Taux effectif</p>
                  <p className="font-[family-name:var(--font-heading)] text-xs font-semibold text-muted-foreground">
                    {(taxResult.effectiveTaxRate * 100).toFixed(1)}%
                  </p>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Estimation basée sur les informations que vous avez fournies.
                </p>
              </div>
            </div>
          )}

          {/* Contextual CTA: View optimization details (authenticated users only) */}
          {authInitialized && authUser && taxResult && (
            <Link 
              href={simulationId ? `/dashboard/optimisation?simulationId=${simulationId}` : "/dashboard/optimisation"}
              className="mt-4 inline-flex text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Voir le détail de mes optimisations →
            </Link>
          )}

          {!taxResult && !taxLoading && !taxError && !simulationId && (
            <p className="text-sm text-muted-foreground">
              {"Complétez au moins votre région et votre revenu pour obtenir le calcul."}
            </p>
          )}
        </div>

        {/* Optimization items breakdown */}
        {unifiedItems.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                {"Optimisations détectées"}
              </h3>
              <span className="font-[family-name:var(--font-heading)] font-semibold text-primary">
                {formatMoneyRange(optimizationTotalMin, optimizationTotalMax)}
              </span>
            </div>

            {/* Locked panel - shown when NOT authenticated */}
            {!isAuthenticated && (
              <div className="mb-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                      {"Débloquez le détail complet"}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"Accédez aux montants précis, documents requis et prochaines actions."}
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        asChild
                        onClick={handleCreateSpace}
                      >
                        <Link href="/auth/sign-up?from=results">
                          {"Créer mon espace Magifin"}
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {"Gratuit · Sans engagement · 5 minutes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items list with badges */}
            <div className="flex flex-col gap-3">
              {unifiedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{item.title}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.badge === "Confirmé"
                            ? "bg-accent/10 text-accent"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      {isAuthenticated ? (
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground/60">
                          {"Détails disponibles après création de votre espace"}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <span className="text-sm font-semibold text-accent">
                      {formatMoneyRange(item.amountMin, item.amountMax)}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {"Montant masqué"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* CTA to see all optimizations */}
            <Button variant="outline" asChild className="mt-4 w-full">
              <Link href={simulationId ? `/dashboard/optimisation?simulationId=${simulationId}` : "/dashboard/optimisation"}>
                Voir toutes les optimisations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground/70">
            {"Estimation indicative basée sur les informations fournies. Magifin ne remplace pas un conseiller fiscal. Vérifiez toujours votre déclaration avant envoi."}
          </p>
        </div>
      </main>
    </div>
  )
}
