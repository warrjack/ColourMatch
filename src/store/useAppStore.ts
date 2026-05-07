import { create } from 'zustand'
import type { RGB } from '../lib/sampleColor'

export type Step = 'white' | 'goal' | 'current' | 'result'

interface AppState {
  step: Step
  whiteSample: RGB | null
  goalSample: RGB | null
  currentSample: RGB | null
  setStep: (step: Step) => void
  setSample: (which: 'white' | 'goal' | 'current', color: RGB) => void
  advanceStep: (color: RGB) => void
  reset: () => void
  resampleCurrent: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  step: 'white',
  whiteSample: null,
  goalSample: null,
  currentSample: null,

  setStep: (step) => set({ step }),

  setSample: (which, color) => {
    if (which === 'white') set({ whiteSample: color })
    else if (which === 'goal') set({ goalSample: color })
    else set({ currentSample: color })
  },

  advanceStep: (color) => {
    const { step, goalSample, currentSample, whiteSample } = get()
    if (step === 'white') {
      // Jump to result if goal+current already sampled (re-doing white only)
      set({ whiteSample: color, step: goalSample && currentSample ? 'result' : 'goal' })
    } else if (step === 'goal') {
      set({ goalSample: color, step: whiteSample && currentSample ? 'result' : 'current' })
    } else if (step === 'current') {
      set({ currentSample: color, step: 'result' })
    }
  },

  reset: () => set({ step: 'white', whiteSample: null, goalSample: null, currentSample: null }),

  resampleCurrent: () => set({ currentSample: null, step: 'current' }),
}))
