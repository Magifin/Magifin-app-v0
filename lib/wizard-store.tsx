"use client"

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { getDefaultTaxYear } from "@/lib/fiscal/tax-year"

// === Types ===
export type Region = "Wallonie" | "Bruxelles" | "Flandre" | null
export type Status = "Salarie" | "Independant" | "Retraite" | "Etudiant" | null
export type HouseholdSituation =
  | "Isole"
  | "Couple"
  | "CoupleDeuxRevenus"
  | "Cohabitant"
  | null
export type IncomeBracket =
  | "0-20000"
  | "20000-35000"
  | "35000-50000"
  | "50000-80000"
  | "80000+"
  | null

// New fields for exact income input
export type AnnualGrossIncome = number
export type TaxesAlreadyPaid = number
export type HousingStatus =
  | "Locataire"
  | "ProprietaireAvecPret"
  | "ProprietaireSansPret"
  | null
export type PropertyUse = "HabitationPropreUnique" | "Autre" | null
export type YesNo = "Oui" | "Non" | null

export interface WizardAnswers {
  taxYear: number | null
  region: Region
  status: Status
  householdSituation: HouseholdSituation
  incomeBracket: IncomeBracket
  annualGrossIncome: AnnualGrossIncome
  taxesAlreadyPaid: TaxesAlreadyPaid
  children: number
  childcare: YesNo
  childcareCost: number
  serviceVouchers: YesNo
  serviceVouchersAmount: number
  pensionSaving: YesNo
  pensionSavingAmount: number
  housingStatus: HousingStatus
  propertyUse: PropertyUse
  cadastralIncome: number | null
  hasCadastralIncome: YesNo
  mortgageInterest: number | null
  mortgageCapital: number | null
  hasMortgagePayments: YesNo
  mortgageInsuranceYesNo: YesNo
  mortgageInsuranceCategory: MortgageInsuranceCategory
  mortgageInsuranceAnnualPremium: number | null
  mortgageInsuranceLinkedToLoan: boolean | null
}

export type MortgageInsuranceCategory = "solde_restant_du" | "other" | null

export interface WizardState {
  answers: WizardAnswers
  currentStepId: string
  completedStepIds: string[]
  editingSimulationId: string | null
  lastSavedAnswers: WizardAnswers | null  // Track saved state to detect unsaved changes
}

// === Step definitions ===
export interface WizardStep {
  id: string
  title: string
  shortTitle: string
  condition?: (answers: WizardAnswers) => boolean
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "taxYear", title: "Déclaration fiscale", shortTitle: "Déclaration" },
  { id: "region", title: "Votre région", shortTitle: "Région" },
  { id: "status", title: "Statut professionnel", shortTitle: "Statut" },
  { id: "situation", title: "Situation du ménage", shortTitle: "Ménage" },
  { id: "revenu", title: "Tranche de revenus", shortTitle: "Revenus" },
  { id: "children", title: "Enfants à charge", shortTitle: "Enfants" },
  {
    id: "childcare",
    title: "Frais de garde",
    shortTitle: "Garde",
    condition: (a) => a.children > 0,
  },
  { id: "services", title: "Titres-services", shortTitle: "Titres-services" },
  { id: "pension", title: "Épargne pension", shortTitle: "Pension" },
  { id: "housing", title: "Logement", shortTitle: "Logement" },
  {
    id: "propertyUse",
    title: "Usage du bien",
    shortTitle: "Usage bien",
    condition: (a) =>
      a.housingStatus === "ProprietaireAvecPret" ||
      a.housingStatus === "ProprietaireSansPret",
  },
  {
    id: "cadastral",
    title: "Revenu cadastral",
    shortTitle: "RC",
    condition: (a) =>
      a.housingStatus === "ProprietaireAvecPret" ||
      a.housingStatus === "ProprietaireSansPret",
  },
  {
    id: "mortgage",
    title: "Crédit hypothécaire",
    shortTitle: "Crédit",
    condition: (a) => a.housingStatus === "ProprietaireAvecPret",
  },
  {
    id: "mortgageInsurance",
    title: "Assurance liée au prêt",
    shortTitle: "Assurance prêt",
    condition: (a) => a.housingStatus === "ProprietaireAvecPret",
  },
]

// === Default state ===
const defaultAnswers: WizardAnswers = {
  taxYear: null,
  region: null,
  status: null,
  householdSituation: null,
  incomeBracket: null,
  annualGrossIncome: 0,
  taxesAlreadyPaid: 0,
  children: 0,
  childcare: null,
  childcareCost: 0,
  serviceVouchers: null,
  serviceVouchersAmount: 0,
  pensionSaving: null,
  pensionSavingAmount: 0,
  housingStatus: null,
  propertyUse: null,
  cadastralIncome: null,
  hasCadastralIncome: null,
  mortgageInterest: null,
  mortgageCapital: null,
  hasMortgagePayments: null,
  mortgageInsuranceYesNo: null,
  mortgageInsuranceCategory: null,
  mortgageInsuranceAnnualPremium: null,
  mortgageInsuranceLinkedToLoan: null,
}

const defaultState: WizardState = {
  answers: defaultAnswers,
  currentStepId: "taxYear",
  completedStepIds: [],
  editingSimulationId: null,
  lastSavedAnswers: null,
}

const STORAGE_KEY = "magifin_wizard_v1"

// === Step ID to Answer Key Mapping ===
// Step IDs do NOT match WizardAnswers keys directly, so we need this mapping
const STEP_ID_TO_ANSWER_KEY: Partial<Record<string, keyof WizardAnswers>> = {
  taxYear: "taxYear",
  region: "region",
  status: "status",
  situation: "householdSituation",
  revenu: "annualGrossIncome",
  children: "children",
  childcare: "childcare",
  services: "serviceVouchers",
  pension: "pensionSaving",
  housing: "housingStatus",
  propertyUse: "propertyUse",
  cadastral: "hasCadastralIncome",
  mortgage: "hasMortgagePayments",
  mortgageInsurance: "mortgageInsuranceYesNo",
}

// === Store implementation ===
type Listener = () => void

function createWizardStore() {
  let state: WizardState = defaultState
  let isHydrated = false
  const listeners = new Set<Listener>()

  const getSnapshot = () => state
  const getServerSnapshot = () => defaultState

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const emit = () => {
    listeners.forEach((l) => l())
  }

  const persist = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // ignore storage errors
      }
    }
  }

  const hydrate = () => {
    if (isHydrated || typeof window === "undefined") return
    isHydrated = true
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WizardState
        state = {
          answers: { ...defaultAnswers, ...parsed.answers },
          currentStepId: parsed.currentStepId || "taxYear",
          completedStepIds: parsed.completedStepIds || [],
          editingSimulationId: parsed.editingSimulationId ?? null,
          lastSavedAnswers: parsed.lastSavedAnswers || null,
        }
        emit()
      }
    } catch {
      // ignore parse errors
    }
  }

  const setAnswer = <K extends keyof WizardAnswers>(
    key: K,
    value: WizardAnswers[K]
  ) => {
    state = {
      ...state,
      answers: { ...state.answers, [key]: value },
    }
    persist()
    emit()
  }

  const goToStep = (stepId: string) => {
    state = { ...state, currentStepId: stepId }
    persist()
    emit()
  }

  const markStepComplete = (stepId: string) => {
    if (!state.completedStepIds.includes(stepId)) {
      state = {
        ...state,
        completedStepIds: [...state.completedStepIds, stepId],
      }
      persist()
      emit()
    }
  }

  const resetWizard = () => {
    state = defaultState
    isHydrated = false // Reset hydration flag when explicitly resetting
    persist()
    emit()
  }

  const resetHydrationFlag = () => {
    isHydrated = false
  }

  const loadAnswers = (answers: Partial<WizardAnswers>) => {
    // Rebuild state from existing answers, overlaying loaded answers on top
    // Do NOT use defaultAnswers as the base - preserve existing field values
    // This prevents losing values like serviceVouchersAmount (100 -> 98 bug)
    const mergedAnswers = { ...state.answers, ...answers }
    
    // When loading a saved simulation for editing, mark all available steps as completed for visual display
    // This shows the stepper as fully green/completed since the user is editing an existing simulation
    // Get all available steps based on the loaded answers, then mark them all as completed
    const completedStepIds = state.editingSimulationId 
      ? getAvailableSteps(mergedAnswers).map(s => s.id)  // Edit mode: mark all steps completed for visual display
      : []  // New/resume mode: start with empty, user will complete steps as they go
    
    state = {
      answers: mergedAnswers,
      currentStepId: "taxYear",
      completedStepIds: completedStepIds,
      editingSimulationId: state.editingSimulationId,
      lastSavedAnswers: state.lastSavedAnswers,
    }
    persist()
    emit()
  }

  const setEditingSimulationId = (simulationId: string | null) => {
    state = {
      ...state,
      editingSimulationId: simulationId,
    }
    persist()
    emit()
  }

  const markAsSaved = () => {
    // Snapshot current answers as the "saved" baseline
    state = {
      ...state,
      lastSavedAnswers: { ...state.answers },
    }
    persist()
    emit()
  }

  const hasUnsavedChanges = (): boolean => {
    // If lastSavedAnswers is null, this is a fresh unsaved draft
    if (state.lastSavedAnswers === null) {
      // Check if user has entered any meaningful data
      return Object.values(state.answers).some(
        (v) => v !== null && v !== undefined && v !== 0 && v !== ""
      )
    }

    // If lastSavedAnswers exists, compare current to saved
    return JSON.stringify(state.answers) !== JSON.stringify(state.lastSavedAnswers)
  }

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    hydrate,
    resetHydrationFlag,
    setAnswer,
    goToStep,
    markStepComplete,
    resetWizard,
    loadAnswers,
    setEditingSimulationId,
    markAsSaved,
    hasUnsavedChanges,
    isHydrated: () => isHydrated,
  }
}

const store = createWizardStore()

// === Helper functions ===
export function getAvailableSteps(answers: WizardAnswers): WizardStep[] {
  return WIZARD_STEPS.filter((step) => !step.condition || step.condition(answers))
}

export function getStepIndex(stepId: string, answers: WizardAnswers): number {
  const available = getAvailableSteps(answers)
  return available.findIndex((s) => s.id === stepId)
}

export function getNextStepId(
  currentStepId: string,
  answers: WizardAnswers
): string | null {
  const available = getAvailableSteps(answers)
  const currentIndex = available.findIndex((s) => s.id === currentStepId)
  if (currentIndex === -1 || currentIndex >= available.length - 1) return null
  return available[currentIndex + 1].id
}

export function getPreviousStepId(
  currentStepId: string,
  answers: WizardAnswers
): string | null {
  const available = getAvailableSteps(answers)
  const currentIndex = available.findIndex((s) => s.id === currentStepId)
  if (currentIndex <= 0) return null
  return available[currentIndex - 1].id
}

export function isStepAccessible(
  stepId: string,
  currentStepId: string,
  completedStepIds: string[],
  answers: WizardAnswers
): boolean {
  if (stepId === currentStepId) return true
  if (completedStepIds.includes(stepId)) return true
  return false
}

export function getLastCompletedStepId(
  completedStepIds: string[],
  answers: WizardAnswers
): string | null {
  const available = getAvailableSteps(answers)
  for (let i = available.length - 1; i >= 0; i--) {
    if (completedStepIds.includes(available[i].id)) {
      return available[i].id
    }
  }
  return null
}

// === React Context ===
interface WizardContextValue {
  state: WizardState
  setAnswer: <K extends keyof WizardAnswers>(
    key: K,
    value: WizardAnswers[K]
  ) => void
  goToStep: (stepId: string) => void
  markStepComplete: (stepId: string) => void
  resetWizard: () => void
  loadAnswers: (answers: Partial<WizardAnswers>) => void
  setEditingSimulationId: (simulationId: string | null) => void
  markAsSaved: () => void
  hasUnsavedChanges: () => boolean
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  // NOTE: hydrate() is NOT called here automatically
  // Instead, WizardContent will explicitly call hydrate() only if needed
  // This prevents old localStorage state from being loaded when user clicks "Nouvelle simulation"

  const setAnswer = useCallback(
    <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => {
      store.setAnswer(key, value)
    },
    []
  )

  const goToStep = useCallback((stepId: string) => {
    store.goToStep(stepId)
  }, [])

  const markStepComplete = useCallback((stepId: string) => {
    store.markStepComplete(stepId)
  }, [])

  const resetWizard = useCallback(() => {
    store.resetWizard()
  }, [])

  const loadAnswers = useCallback((answers: Partial<WizardAnswers>) => {
    store.loadAnswers(answers)
  }, [])

  const setEditingSimulationId = useCallback((simulationId: string | null) => {
    store.setEditingSimulationId(simulationId)
  }, [])

  const markAsSaved = useCallback(() => {
    store.markAsSaved()
  }, [])

  const hasUnsavedChanges = useCallback(() => {
    return store.hasUnsavedChanges()
  }, [])

  const resetHydrationFlag = useCallback(() => {
    store.resetHydrationFlag()
  }, [])

  return (
    <WizardContext.Provider
      value={{ state, setAnswer, goToStep, markStepComplete, resetWizard, loadAnswers, setEditingSimulationId, markAsSaved, hasUnsavedChanges }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return ctx
}

// Direct store access for non-React contexts
export { store as wizardStore }
