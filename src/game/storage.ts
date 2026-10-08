import { SAVE_KEY } from './data'
import { isValid, newGame } from './logic'
import type { GameState } from './types'

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValid(parsed)) return parsed
    }
  } catch {
    /* ignore corrupt or unavailable storage */
  }
  return newGame()
}

export function saveGame(g: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(g))
  } catch {
    /* storage may be full or disabled */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}
