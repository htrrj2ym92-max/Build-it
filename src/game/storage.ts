import { SAVE_KEY, STARTING_MONEY } from './data'
import { isValid, newGame } from './logic'
import type { GameState } from './types'

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValid(parsed)) return {
        ...parsed,
        money: parsed.money ?? STARTING_MONEY,
        grid: parsed.grid.map((c) => ({ ...c, level: c.level ?? 0, condition: c.condition ?? 100, sold: c.sold === true })),
      }
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
