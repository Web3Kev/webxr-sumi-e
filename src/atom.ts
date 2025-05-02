// atoms.ts
import { atom } from 'jotai'

// Explicitly type the atom as a number
export const baseTubeRadiusAtom = atom<number>(0.04)
export const backAtom = atom<boolean>(false)
export const clearAtom = atom<boolean>(false)
export const drawAtom = atom<boolean>(true)
export const xrAtom = atom<boolean>(false)

// Clamp decrease to min 0.01
export const decreaseRadiusAtom = atom(null, (get, set) => {
    const current = get(baseTubeRadiusAtom)
    const next = Math.max(0.01, current - 0.01)
    set(baseTubeRadiusAtom, next)
  })
  
  // Clamp increase to max 0.1
  export const increaseRadiusAtom = atom(null, (get, set) => {
    const current = get(baseTubeRadiusAtom)
    const next = Math.min(0.1, current + 0.01)
    set(baseTubeRadiusAtom, next)
  })