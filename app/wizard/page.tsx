"use client"

import { useEffect, useMemo, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WizardProgress } from "@/components/wizard/wizard-progress"
import { StepTaxYear } from "@/components/wizard/step-tax-year"
import { StepRegion } from "@/components/wizard/step-region"
import { StepStatus } from "@/components/wizard/step-status"
import { StepSituation } from "@/components/wizard/step-situation"
import { StepRevenu } from "@/components/wizard/step-revenu"
import { StepChildren } from "@/components/wizard/step-children"
import { StepChildcare } from "@/components/wizard/step-childcare"
import { StepServices } from "@/components/wizard/step-services"
import { StepPension } from "@/components/wizard/step-pension"
import { StepHousing } from "@/components/wizard/step-housing"
import { StepPropertyUse } from "@/components/wizard/step-property-use"
import { StepCadastral } from "@/components/wizard/step-cadastral"
import { StepMortgage } from "@/components/wizard/step-mortgage"
import { StepMortgageInsurance } from "@/components/wizard/step-mortgage-insurance"
import {
  useWizard,
  getAvailableSteps,
  getStepIndex,
  getNextStepId,
  getPreviousStepId,
} from "@/lib/wizard-store"
import { getDefaultTaxYear } from "@/lib/fiscal/tax-year"
import { useUser } from "@/lib/user-store"
import { useAuth } from "@/lib/auth-context"
import { computeOptimizationsFromAnswers } from "@/lib/computeOptimizationsFromAnswers"
import { track } from "@/lib/track"

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, setAnswer, goToStep, markStepComplete, loadAnswers, resetWizard, setEditingSimulationId, markAsSaved } = useWizard()
  const { user } = useUser()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const { answers, currentStepId, completedStepIds, editingSimulationId } = state

  const availableSteps = getAvailableSteps(answers)
  const currentIndex = getStepIndex(currentStepId, answers)
  const totalSteps = availableSteps.length

  // Track if we've already processed the resume/reset logic
  const hasProcessedResume = useRef(false)

  // Handle resume or reset on mount
  useEffect(() => {
    if (hasProcessedResume.current) return

    hasProcessedResume.current = true

    const resume = searchParams.get("resume")
    const simulationId = searchParams.get("simulationId")

    if (resume) {
      try {
        const decoded = JSON.parse(atob(resume))
        
        // Determine if this is edit mode based on simulationId param
        const isEditingExisting = !!simulationId
        
        // Support both old format (just answers) and new format (full state)
        const answersToLoad = decoded.answers ? decoded.answers : decoded
        
        if (isEditingExisting) {
          // EDIT MODE: Load existing simulation data
          // The resume param contains only wizard_answers (from database)
          // Always start from first step (taxYear) for edit mode
          // Set editingSimulationId FIRST so loadAnswers knows we're in edit mode
          // This also clears the draft storage key to prevent conflicts
          setEditingSimulationId(simulationId)
          loadAnswers(answersToLoad)
          // Mark as saved so the unsaved banner doesn't show incorrectly for the edited simulation
          markAsSaved()
        } else {
          // RESUME MODE: Restoring an unsaved draft from URL
          // May have currentStepId and completedStepIds in new format
          // First, ensure we're not in edit mode
          setEditingSimulationId(null)
          loadAnswers(answersToLoad)
          
          // Restore step position if provided in new format
          if (decoded.currentStepId && decoded.currentStepId !== "taxYear") {
            goToStep(decoded.currentStepId)
          }
          
          // Restore completed step IDs if provided
          if (decoded.completedStepIds && Array.isArray(decoded.completedStepIds)) {
            // Note: completedStepIds are already managed by loadAnswers for edit mode
            // This is for future resume format support
          }
        }

        // Backward-compat: old saved simulations without taxYear get a default
        if (answersToLoad.taxYear === undefined || answersToLoad.taxYear === null) {
          setAnswer("taxYear", getDefaultTaxYear())
        }

        window.history.replaceState(null, '', '/wizard')
      } catch (err) {
        console.error("[wizard] resume decode failed", err)
        resetWizard()
      }
    } else {
      // No resume param: check if there's stored state
      // Priority: editing state (if user was editing) → draft state (if user has unsaved draft)
      const hasEditingState = typeof window !== "undefined" && localStorage.getItem("magifin_wizard_editing")
      const hasDraftState = typeof window !== "undefined" && localStorage.getItem("magifin_wizard_v1")
      
      if (!hasEditingState && !hasDraftState) {
        // No stored state at all: completely fresh wizard
        resetWizard()
      }
      // If there is stored state, hydrate will load it automatically
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- goToStep/markAsSaved omitted: effect is one-time (hasProcessedResume guard)
  }, [searchParams, loadAnswers, resetWizard, setEditingSimulationId, setAnswer])

  // Track wizard start
  useEffect(() => {
    if (completedStepIds.length === 0) {
      track("wizard_started")
    }
  }, [completedStepIds.length])

  // Check if required steps are complete for "View Results"
  const canViewResults = useMemo(() => {
    // Minimum required steps to show meaningful results
    const requiredStepIds = ["region", "status", "situation", "revenu"]
    return requiredStepIds.every((id) => completedStepIds.includes(id))
  }, [completedStepIds])

  // Get isFullySupported for tracking
  const isFullySupported = useMemo(() => {
    return computeOptimizationsFromAnswers(answers).isFullySupported
  }, [answers])

  const canProceed = (): boolean => {
    switch (currentStepId) {
      case "taxYear":
        return answers.taxYear !== null
      case "region":
        return answers.region !== null
      case "status":
        return answers.status !== null
      case "situation":
        return answers.householdSituation !== null
      case "revenu":
        // Allow proceeding with either bracket selection OR exact income input
        return answers.incomeBracket !== null || answers.annualGrossIncome > 0
      case "children":
        return true // 0 is valid
      case "childcare":
        return answers.childcare !== null
      case "services":
        return answers.serviceVouchers !== null
      case "pension":
        return answers.pensionSaving !== null
      case "housing":
        return answers.housingStatus !== null
      case "propertyUse":
        return answers.propertyUse !== null
      case "cadastral":
        return answers.hasCadastralIncome !== null
      case "mortgage":
        return answers.hasMortgagePayments !== null
      case "mortgageInsurance":
        return answers.mortgageInsuranceYesNo !== null
      default:
        return false
    }
  }

  const handleNext = () => {
    markStepComplete(currentStepId)
    const nextStepId = getNextStepId(currentStepId, answers)

    if (nextStepId) {
      goToStep(nextStepId)
    } else {
      // Wizard complete
      track("wizard_completed")
      router.push("/results")
    }
  }

  const handleBack = () => {
    const prevStepId = getPreviousStepId(currentStepId, answers)
    if (prevStepId) {
      goToStep(prevStepId)
    }
  }

  const handleStepClick = (stepId: string) => {
    track("wizard_step_clicked", { stepId })
    goToStep(stepId)
  }

  const handleViewResults = () => {
    track("wizard_view_results_clicked", { stepId: currentStepId, isFullySupported })
    router.push("/results")
  }

  const renderStep = () => {
    switch (currentStepId) {
      case "taxYear":
        return (
          <StepTaxYear
            value={answers.taxYear}
            onChange={(v) => setAnswer("taxYear", v)}
          />
        )
      case "region":
        return (
          <StepRegion
            value={answers.region}
            onChange={(v) => setAnswer("region", v)}
          />
        )
      case "status":
        return (
          <StepStatus
            value={answers.status}
            onChange={(v) => setAnswer("status", v)}
          />
        )
      case "situation":
        return (
          <StepSituation
            value={answers.householdSituation}
            onChange={(v) => setAnswer("householdSituation", v)}
          />
        )
      case "revenu":
        return (
          <StepRevenu
            incomeBracket={answers.incomeBracket}
            annualGrossIncome={answers.annualGrossIncome}
            taxesAlreadyPaid={answers.taxesAlreadyPaid}
            onIncomeBracketChange={(v) => setAnswer("incomeBracket", v)}
            onAnnualGrossIncomeChange={(v) => setAnswer("annualGrossIncome", v)}
            onTaxesAlreadyPaidChange={(v) => setAnswer("taxesAlreadyPaid", v)}
          />
        )
      case "children":
        return (
          <StepChildren
            value={answers.children}
            onChange={(v) => setAnswer("children", v)}
          />
        )
      case "childcare":
        return (
          <StepChildcare
            hasChildcare={answers.childcare}
            childcareCost={answers.childcareCost}
            onHasChange={(v) => setAnswer("childcare", v)}
            onCostChange={(v) => setAnswer("childcareCost", v)}
          />
        )
      case "services":
        return (
          <StepServices
            hasServices={answers.serviceVouchers}
            servicesAmount={answers.serviceVouchersAmount}
            onHasChange={(v) => setAnswer("serviceVouchers", v)}
            onAmountChange={(v) => setAnswer("serviceVouchersAmount", v)}
          />
        )
      case "pension":
        return (
          <StepPension
            hasPension={answers.pensionSaving}
            pensionAmount={answers.pensionSavingAmount}
            onHasChange={(v) => setAnswer("pensionSaving", v)}
            onAmountChange={(v) => setAnswer("pensionSavingAmount", v)}
          />
        )
      case "housing":
        return (
          <StepHousing
            value={answers.housingStatus}
            onChange={(v) => setAnswer("housingStatus", v)}
          />
        )
      case "propertyUse":
        return (
          <StepPropertyUse
            value={answers.propertyUse}
            onChange={(v) => setAnswer("propertyUse", v)}
          />
        )
      case "cadastral":
        return (
          <StepCadastral
            hasCadastralIncome={answers.hasCadastralIncome}
            cadastralIncome={answers.cadastralIncome}
            onHasChange={(v) => setAnswer("hasCadastralIncome", v)}
            onAmountChange={(v) => setAnswer("cadastralIncome", v)}
          />
        )
      case "mortgage":
        return (
          <StepMortgage
            hasMortgagePayments={answers.hasMortgagePayments}
            mortgageInterest={answers.mortgageInterest}
            mortgageCapital={answers.mortgageCapital}
            onHasChange={(v) => setAnswer("hasMortgagePayments", v)}
            onInterestChange={(v) => setAnswer("mortgageInterest", v)}
            onCapitalChange={(v) => setAnswer("mortgageCapital", v)}
          />
        )
      case "mortgageInsurance":
        return (
          <StepMortgageInsurance
            value={answers.mortgageInsuranceYesNo}
            category={answers.mortgageInsuranceCategory}
            annualPremium={answers.mortgageInsuranceAnnualPremium}
            linkedToLoan={answers.mortgageInsuranceLinkedToLoan}
            onChange={(v) => setAnswer("mortgageInsuranceYesNo", v)}
            onCategoryChange={(v) => setAnswer("mortgageInsuranceCategory", v)}
            onAnnualPremiumChange={(v) => setAnswer("mortgageInsuranceAnnualPremium", v)}
            onLinkedToLoanChange={(v) => setAnswer("mortgageInsuranceLinkedToLoan", v)}
          />
        )
      default:
        return null
    }
  }

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1

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
          
          {/* Logo - clickable with auth-aware navigation */}
          <Link
            href={authUser ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
            title={authUser ? "Aller au tableau de bord" : "Retour à l'accueil"}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight">
              Magifin
            </span>
          </Link>
          
          {/* Right side: Dashboard link when authenticated (optional UX improvement) */}
          <div className="flex items-center gap-2">
            {authUser && !authLoading && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                title="Aller au tableau de bord"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <WizardProgress
        steps={availableSteps}
        currentStepId={currentStepId}
        completedStepIds={completedStepIds}
        onStepClick={handleStepClick}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        {/* Step indicator with optional greeting */}
        <div className="mb-6 text-center">
          {user?.firstName && (
            <p className="mb-1 text-sm text-muted-foreground">
              Bonjour, {user.firstName}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {"Étape"} {currentIndex + 1} {"sur"} {totalSteps}
          </p>
          {answers.taxYear !== null && currentStepId !== "taxYear" && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
              {"Déclaration"} {answers.taxYear} {"· revenus"} {answers.taxYear - 1}
            </p>
          )}
        </div>

        <div className="flex-1">{renderStep()}</div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/50 pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isFirstStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {"Précédent"}
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {isLastStep ? "Voir les résultats" : "Suivant"}
            </Button>
          </div>

          {/* Persistent "Voir mes résultats" CTA */}
          {!isLastStep && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewResults}
                disabled={!canViewResults}
                className="text-muted-foreground hover:text-foreground"
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir mes résultats"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WizardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <WizardContent />
    </Suspense>
  )
}
