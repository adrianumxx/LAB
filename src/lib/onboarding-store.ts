import { create } from 'zustand'

export type OnboardingStep = 'workspace' | 'units' | 'unit-state' | 'completion'

interface ManagerOnboarding {
  workspaceName: string
  firstUnitName: string
  firstUnitState: string
}

interface OwnerOnboarding {
  numberOfUnits: number
}

interface OnboardingStore {
  managerData: ManagerOnboarding
  ownerData: OwnerOnboarding
  setManagerData: (data: Partial<ManagerOnboarding>) => void
  setOwnerData: (data: Partial<OwnerOnboarding>) => void
  resetOnboarding: () => void
}

const defaultManagerData: ManagerOnboarding = {
  workspaceName: '',
  firstUnitName: '',
  firstUnitState: 'vacant',
}

const defaultOwnerData: OwnerOnboarding = {
  numberOfUnits: 0,
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  managerData: defaultManagerData,
  ownerData: defaultOwnerData,
  setManagerData: (data) =>
    set((state) => ({
      managerData: { ...state.managerData, ...data },
    })),
  setOwnerData: (data) =>
    set((state) => ({
      ownerData: { ...state.ownerData, ...data },
    })),
  resetOnboarding: () => set({
    managerData: defaultManagerData,
    ownerData: defaultOwnerData,
  }),
}))
