"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  useWizard,
  getLastCompletedStepId,
  getAvailableSteps,
  wizardStore,
} from "@/lib/wizard-store"
import { useOptimizations } from "@/lib/useOptimizations"
import { useAuth } from "@/lib/auth-context"
import { formatMoney, formatMoneyRange } from "@/lib/formatMoney"
import { track } from "@/lib/track"
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mapAnswersToTaxInput"
import { SaveSimulationDialog } from "@/components/results/save-simulation-dialog"
import type { TaxResult } from "@/lib/fiscal/belgium/types"

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=results&utm_campaign=insurance"

export function ResultsContent() {
  const router = useRouter()
  const { state, goToStep } = useWizard()
  const { answers, completedStepIds, editingSimulationId } = state
  const { results } = useOptimizations()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  const [taxResult, setTaxResult] = useState<TaxResult | null>(null)
  const [taxLoading, setTaxLoading] = useState(false)
  const [taxError, setTaxError] = useState<string | null>(null)

  // Restore answers from localStorage if store is empty (e.g. after page refresh)
  useEffect(() => {
    wizardStore.hydrate()
  }, [])

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
    const input = mapAnswersToTaxInput(answers)
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
  }, [answers])

  const availableItems = results.items.filter((i) => i.available)

  // Consistent auth check used throughout the app
  const isAuthenticated = authInitialized && !!authUser

  const handleModifyAnswers = () => {
    const resumeUrl = `/wizard?resume=${btoa(JSON.stringify(answers))}`
    router.push(resumeUrl)
  }

  const handleCreateSpace = () => {
    track("click_create_space")
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "results_page" })
  }

  const handleSimulationSaved = () => {
    setSavedSuccess(true)
    track("simulation_saved")
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Determine left card title
  const leftCardTitle =
    !results.isFullySupported || availableItems.length > 0
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
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <span className="text-border">|</span>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Accueil
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Loading state while auth initializes - but resolve after 2 seconds */}
            {authLoading && !authInitialized && (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            {/* Save button for authenticated users */}
            {authInitialized && !!authUser && taxResult && (
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
        {/* Page title and declaration year */}
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance mb-2">
            Votre estimation fiscale
          </h1>
          {answers.taxYear && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Déclaration <strong>{answers.taxYear}</strong>
                {" · "}revenus {answers.taxYear - 1}
              </span>
            </div>
          )}
        </div>

        {/* SECTION 1: TAX ESTIMATION (primary information) */}
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-4">
            Votre estimation fiscale
          </h2>

          {taxLoading && (
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Calcul en cours...
              </div>
            </div>
          )}

          {taxError && !taxLoading && (
            <div className="rounded-2xl border border-border bg-card p-8">
              <p className="text-sm text-destructive">{taxError}</p>
            </div>
          )}

          {taxResult && !taxLoading && (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {/* Taxable income */}
                <div className="flex flex-col">
                  <dt className="text-xs font-medium text-muted-foreground mb-2">Revenu imposable</dt>
                  <dd className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
                    {formatMoney(taxResult.taxableIncome)}
                  </dd>
                </div>

                {/* Fiscal adjustments */}
                <div className="flex flex-col">
                  <dt className="text-xs font-medium text-muted-foreground mb-2">Ajustements fiscaux</dt>
                  <dd className="font-[family-name:var(--font-heading)] text-2xl font-bold text-accent">
                    −{formatMoney(taxResult.deductionsApplied)}
                  </dd>
                </div>

                {/* Estimated tax */}
                <div className="flex flex-col">
                  <dt className="text-xs font-medium text-muted-foreground mb-2">Impôt estimé</dt>
                  <dd className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
                    {formatMoney(taxResult.estimatedTax)}
                  </dd>
                </div>

                {/* Taxes already paid */}
                <div className="flex flex-col">
                  <dt className="text-xs font-medium text-muted-foreground mb-2">Impôts déjà payés</dt>
                  <dd className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
                    {formatMoney(taxResult.taxesAlreadyPaid)}
                  </dd>
                </div>

                {/* Balance - refund or amount due */}
                <div
                  className={cn(
                    "flex flex-col rounded-lg p-4",
                    taxResult.refundOrBalance >= 0
                      ? "bg-accent/10"
                      : "bg-destructive/10"
                  )}
                >
                  <dt
                    className={cn(
                      "text-xs font-medium mb-2",
                      taxResult.refundOrBalance >= 0
                        ? "text-accent"
                        : "text-destructive"
                    )}
                  >
                    {taxResult.refundOrBalance >= 0
                      ? "Remboursement estimé"
                      : "Montant à payer"}
                  </dt>
                  <dd
                    className={cn(
                      "font-[family-name:var(--font-heading)] text-2xl font-bold",
                      taxResult.refundOrBalance >= 0
                        ? "text-accent"
                        : "text-destructive"
                    )}
                  >
                    {taxResult.refundOrBalance >= 0
                      ? formatMoney(taxResult.refundOrBalance)
                      : "−" + formatMoney(Math.abs(taxResult.refundOrBalance))}
                  </dd>
                </div>
              </div>
            </div>
          )}

          {!taxResult && !taxLoading && !taxError && (
            <div className="rounded-2xl border border-border bg-card p-8">
              <p className="text-sm text-muted-foreground">
                {"Complétez au moins votre région et votre revenu pour obtenir le calcul."}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: CALCULATION BREAKDOWN */}
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-4">
            Comment ce montant est calculé
          </h2>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            {taxResult && !taxLoading && (
              <div className="space-y-6">
                {/* Calculation steps */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-2">Revenu brut</dt>
                    <dd className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
                      {formatMoney(answers.salaryIncome || 0)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-2">Frais professionnels</dt>
                    <dd className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
                      −{formatMoney(Math.max(0, (answers.salaryIncome || 0) * 0.30, 5930))}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-2">Revenu imposable</dt>
                    <dd className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
                      {formatMoney(taxResult.taxableIncome)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-2">Taux effectif d'imposition</dt>
                    <dd className="font-[family-name:var(--font-heading)] text-lg font-semibold text-card-foreground">
                      {(taxResult.effectiveTaxRate * 100).toFixed(1)}%
                    </dd>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground mb-4">
                    L'impôt estimé inclut l'impôt fédéral, les crédits fiscaux applicables et la surcharge régionale.
                  </p>
                </div>
              </div>
            )}

            {!taxResult && !taxLoading && !taxError && (
              <p className="text-sm text-muted-foreground">
                {"Les détails de calcul apparaîtront une fois vos informations complétées."}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 3: OPTIMIZATION OPPORTUNITIES */}
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-2">
            Optimisations fiscales potentielles
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Certaines actions peuvent encore réduire votre impôt.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Pension optimization card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                  Réduction pour épargne pension
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-card-foreground">
                {"L'épargne-pension peut réduire significativement votre impôt via un crédit fiscal."}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {"Jusqu'à €990/an peuvent bénéficier d'une réduction fiscale."}
              </p>
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-5 w-full"
                  asChild
                >
                  <Link href="/dashboard/optimisation">
                    {"Voir les détails"}
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              {!isAuthenticated && (
                <Button
                  size="sm"
                  className="mt-5 w-full"
                  asChild
                  onClick={handleCreateSpace}
                >
                  <Link href="/auth/sign-up?from=results">
                    {"Débloquer"}
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Insurance optimization card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-card-foreground">
                  {"Optimisez vos assurances"}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-card-foreground">
                {"Certaines assurances peuvent améliorer votre protection financière tout en réduisant votre charge fiscale."}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {"Vérifiez si des optimisations supplémentaires sont possibles."}
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

          {/* Optimization items breakdown */}
          {availableItems.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                {"Détail de vos optimisations"}
              </h3>

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

              {/* Items list */}
              <div className="flex flex-col gap-3">
                {availableItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                      <div>
                        <p className="font-medium text-card-foreground">{item.title}</p>
                        {isAuthenticated ? (
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground/60">
                            {"Détails disponibles après création de votre espace"}
                          </p>
                        )}
                      </div>
                    </div>
                    {isAuthenticated ? (
                      <span className="text-sm font-semibold text-accent">
                        {formatMoneyRange(item.savingsMin, item.savingsMax)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {"Montant masqué"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to action for unauthenticated users - moved here for prominence */}
        {!isAuthenticated && (
          <div className="mb-12 rounded-2xl border border-border/50 bg-card p-8 text-center">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-card-foreground mb-2">
              Accédez à votre tableau de bord
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
              Créez votre espace Magifin pour sauvegarder vos simulations, tracker vos optimisations et préparer votre déclaration.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              asChild
              onClick={handleCreateSpace}
            >
              <Link href="/auth/sign-up?from=results">
                {"Créer mon espace Magifin"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              {"Gratuit · Sans engagement · 5 minutes"}
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row justify-center">
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
              <Link href="/dashboard/optimisation">
                {"Voir mes optimisations"}
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
