"use client"

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react"

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
export type HousingStatus =
  | "Locataire"
  | "ProprietaireAvecPret"
  | "ProprietaireSansPret"
  | null
export type PropertyUse = "HabitationPropreUnique" | "Autre" | null
export type YesNo = "Oui" | "Non" | null

export interface WizardAnswers {
  region: Region
  status: Status
  householdSituation: HouseholdSituation
  incomeBracket: IncomeBracket
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
  mortgageInsuranceType: string | null
  mortgageInsuranceAmount: number | null
}

export type MortgageInsuranceType =
  | "SoldeRestantDu"
  | "IncendieHabitation"
  | "ResponsabiliteCivile"
  | "ProtectionJuridique"
  | "Autre"
  | null

export interface WizardState {
  answers: WizardAnswers
  currentStepId: string
  completedStepIds: string[]
}

// === Step definitions ===
export interface WizardStep {
  id: string
  title: string
  shortTitle: string
  condition?: (answers: WizardAnswers) => boolean
}

export const WIZARD_STEPS: WizardStep[] = [
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
  region: null,
  status: null,
  householdSituation: null,
  incomeBracket: null,
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
  mortgageInsuranceType: null,
  mortgageInsuranceAmount: null,
}

const defaultState: WizardState = {
  answers: defaultAnswers,
  currentStepId: "region",
  completedStepIds: [],
}

const STORAGE_KEY = "magifin_wizard_v1"

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
          currentStepId: parsed.currentStepId || "region",
          completedStepIds: parsed.completedStepIds || [],
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
    persist()
    emit()
  }

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    hydrate,
    setAnswer,
    goToStep,
    markStepComplete,
    resetWizard,
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
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  // Hydrate on mount
  if (typeof window !== "undefined" && !store.isHydrated()) {
    store.hydrate()
  }

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

  return (
    <WizardContext.Provider
      value={{ state, setAnswer, goToStep, markStepComplete, resetWizard }}
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
