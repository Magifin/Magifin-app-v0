"use client"

import { useEffect, useMemo, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WizardProgress } from "@/components/wizard/wizard-progress"
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
import { useUser } from "@/lib/user-store"
import { computeOptimizationsFromAnswers } from "@/lib/computeOptimizationsFromAnswers"
import { track } from "@/lib/track"

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, setAnswer, goToStep, markStepComplete, loadAnswers, resetWizard } = useWizard()
  const { user } = useUser()
  const { answers, currentStepId, completedStepIds } = state

  const availableSteps = getAvailableSteps(answers)
  const currentIndex = getStepIndex(currentStepId, answers)
  const totalSteps = availableSteps.length

  // Track if we've already processed the resume/reset logic to avoid duplicate runs
  const hasProcessedResume = useRef(false)

  // Load resume data from query param if present, or reset to clean state if no resume param
  useEffect(() => {
    if (hasProcessedResume.current) return

    const resume = searchParams.get("resume")
    if (resume) {
      try {
        const decoded = JSON.parse(atob(resume))
        loadAnswers(decoded)
        // Clear the URL param to prevent re-loading on subsequent renders
        router.replace("/wizard", { scroll: false })
        hasProcessedResume.current = true
      } catch (e) {
        hasProcessedResume.current = true
      }
    } else {
      // No resume param = user clicked "Nouvelle simulation"
      // Reset to clean state to ensure no old localStorage state carries over
      resetWizard()
      hasProcessedResume.current = true
    }
  }, [searchParams, loadAnswers, resetWizard, router])

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
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-foreground">
              Magifin
            </span>
          </div>
          <div className="w-16" />
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
