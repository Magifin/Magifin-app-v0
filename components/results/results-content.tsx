"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useWizard,
  getLastCompletedStepId,
  getAvailableSteps,
} from "@/lib/wizard-store"
import { useOptimizations } from "@/lib/useOptimizations"
import { useUser } from "@/lib/user-store"
import { formatMoney, formatMoneyRange } from "@/lib/formatMoney"
import { track } from "@/lib/track"

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=results&utm_campaign=insurance"

export function ResultsContent() {
  const router = useRouter()
  const { state, goToStep } = useWizard()
  const { answers, completedStepIds } = state
  const { results } = useOptimizations()
  const { user, isLoggedIn } = useUser()

  const availableItems = results.items.filter((i) => i.available)

  // Gate condition: user must have created an account
  const isUnlocked = isLoggedIn

  const handleModifyAnswers = () => {
    const availableSteps = getAvailableSteps(answers)
    const lastCompletedId = getLastCompletedStepId(completedStepIds, answers)

    if (lastCompletedId) {
      goToStep(lastCompletedId)
    } else if (availableSteps.length > 0) {
      goToStep(availableSteps[0].id)
    }

    router.push("/wizard")
  }

  const handleCreateSpace = () => {
    track("click_create_space")
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "results_page" })
  }

  // Determine left card title
  const leftCardTitle =
    !results.isFullySupported || availableItems.length > 0
      ? "Débloquez votre optimisation fiscale complète"
      : "Vérification complète de vos droits fiscaux"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleModifyAnswers}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Edit3 className="h-4 w-4" />
              Modifier mes réponses
            </button>
            <span className="text-border">|</span>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Accueil
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        {/* Hero estimate - totals always visible */}
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {user?.firstName ? `${user.firstName}, Magi a analysé votre situation` : "Magi a analysé votre situation"}
          </p>

          <p className="mb-3 mt-6 text-sm font-semibold uppercase tracking-widest text-accent">
            Votre estimation
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground sm:text-4xl text-balance">
            {"Vous pourriez récupérer entre"}
          </h1>
          <div className="mt-6 flex items-baseline justify-center gap-3 sm:gap-4">
            <span className="font-[family-name:var(--font-heading)] text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
              {formatMoney(results.totalMin)}
            </span>
            <span className="text-xl font-medium text-muted-foreground sm:text-2xl">et</span>
            <span className="font-[family-name:var(--font-heading)] text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
              {formatMoney(results.totalMax)}
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {"*Estimation basée sur les informations fournies. Le montant réel peut varier."}
          </p>

          {!isUnlocked && (
            <>
              <Button
                size="lg"
                className="mt-8 h-12 px-8 text-base"
                asChild
                onClick={handleCreateSpace}
              >
                <Link href="/create-account">
                  {"Créer mon espace Magifin"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {"Gratuit · Sans engagement · 5 minutes"}
              </p>
            </>
          )}

          {isUnlocked && (
            <Button
              size="lg"
              className="mt-8 h-12 px-8 text-base"
              asChild
            >
              <Link href="/dashboard">
                {"Accéder au dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Notes about region/status */}
          {results.notes.length > 0 && (
            <div className="mt-6 max-w-md">
              {results.notes.map((note, i) => (
                <p key={i} className="text-xs text-muted-foreground/70 leading-relaxed">
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Cards */}
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
            {!isUnlocked && (
              <Button
                size="sm"
                className="mt-5 w-full"
                asChild
                onClick={handleCreateSpace}
              >
                <Link href="/create-account">
                  {"Créer mon espace Magifin"}
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

        {/* Optimization items breakdown */}
        {availableItems.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
              {"Détail de vos optimisations"}
            </h3>

            {/* Locked panel - shown when NOT unlocked */}
            {!isUnlocked && (
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
                        <Link href="/create-account">
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
                      {/* Title always visible */}
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      {/* Description: show real text if unlocked, placeholder if not */}
                      {isUnlocked ? (
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          {"Détails disponibles dans votre espace Magifin"}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Amount: show real value if unlocked, placeholder if not */}
                  {isUnlocked ? (
                    <p className="font-[family-name:var(--font-heading)] font-semibold text-card-foreground">
                      {formatMoneyRange(item.amountMin, item.amountMax)}
                    </p>
                  ) : (
                    <p className="font-[family-name:var(--font-heading)] font-semibold text-muted-foreground/50">
                      {"— —"}
                    </p>
                  )}
                </div>
              ))}
            </div>
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
