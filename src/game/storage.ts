import { MATERIAL_DELIVERY_TIME, PAINT_COLORS, PAINT_TIME, SAVE_KEY, STARTING_MONEY } from './data'
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
        deliveries: (parsed.deliveries ?? []).map((delivery) => ({
          ...delivery,
          duration: delivery.duration ?? MATERIAL_DELIVERY_TIME,
        })),
        grid: parsed.grid.map((c) => {
          const paintDuration = c.paintDuration === undefined ? undefined : Math.min(c.paintDuration, PAINT_TIME)
          return {
            ...c,
            lotOwned: c.lotOwned === true,
            level: c.level ?? 0,
            condition: c.condition ?? 100,
            painted: c.painted === true,
            paintColor: c.paintColor ?? (c.painted ? PAINT_COLORS[0].id : undefined),
            paintRemaining: c.paintRemaining === undefined ? undefined : Math.min(c.paintRemaining, paintDuration ?? PAINT_TIME),
            paintDuration,
            landscaped: c.landscaped === true,
            sold: c.sold === true,
          }
        }),
        hiredWorkers: parsed.hiredWorkers ?? 0,
        sawmillBuilt: parsed.sawmillBuilt ?? false,
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
