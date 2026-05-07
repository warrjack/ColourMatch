import { create } from 'zustand'
import type { RGB } from '../lib/sampleColor'

interface AppState {
  uploadedImage: string | null
  goalSample: RGB | null
  currentSample: RGB | null
  setUploadedImage: (url: string | null) => void
  setGoalSample: (color: RGB) => void
  setCurrentSample: (color: RGB) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  uploadedImage: null,
  goalSample: null,
  currentSample: null,
  setUploadedImage: (url) => set({ uploadedImage: url, goalSample: null }),
  setGoalSample: (color) => set({ goalSample: color }),
  setCurrentSample: (color) => set({ currentSample: color }),
  reset: () => set({ uploadedImage: null, goalSample: null, currentSample: null }),
}))
