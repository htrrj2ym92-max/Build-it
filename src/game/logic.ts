import { BUILDINGS, GATHER_AMOUNT, HOUSE_RENT_PER_DAY, LEVELS, STARTING_MONEY, TICKS_PER_DAY } from './data'
import type { BuildingType, Cell, GameState, Resource, Resources } from './types'

const RES: Resource[] = ['wood', 'stone', 'gold']

export const levelDef = (level: number) => LEVELS[Math.min(level, LEVELS.length - 1)]

export const newGame = (level = 0): GameState => ({
  version: 1,
  level,
  resources: { wood: 50, stone: 20, gold: 20 },
  money: STARTING_MONEY,
  grid: Array.from({ length: levelDef(level).size ** 2 }, () => ({ type: null, remaining: 0 })),
  ticks: 0,
  won: false,
})

export const builders = (g: GameState) =>
  1 + g.grid.filter((c) => c.type === 'hut' && c.remaining === 0).length

export const busyBuilders = (g: GameState) => g.grid.filter((c) => c.type && c.remaining > 0).length

export const canAfford = (g: GameState, type: BuildingType) =>
  g.money >= BUILDINGS[type].cashCost &&
  RES.every((k) => g.resources[k] >= (BUILDINGS[type].cost[k] ?? 0))

export const count = (g: GameState, type: BuildingType) =>
  g.grid.filter((c) => c.type === type && c.remaining === 0).length

export function build(g: GameState, index: number, type: BuildingType): GameState {
  const cell = g.grid[index]
  if (!cell || cell.type || !canAfford(g, type) || busyBuilders(g) >= builders(g)) return g
  const resources = { ...g.resources }
  RES.forEach((k) => (resources[k] -= BUILDINGS[type].cost[k] ?? 0))
  const grid = g.grid.slice()
  grid[index] = { type, remaining: BUILDINGS[type].buildTime }
  return { ...g, resources, money: g.money - BUILDINGS[type].cashCost, grid }
}

export function demolish(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell?.type) return g
  const resources = { ...g.resources }
  RES.forEach((k) => (resources[k] += Math.floor((BUILDINGS[cell.type!].cost[k] ?? 0) / 2)))
  const grid = g.grid.slice()
  grid[index] = { type: null, remaining: 0 }
  return { ...g, resources, money: g.money + Math.floor(BUILDINGS[cell.type].cashCost / 2), grid }
}

export const gather = (g: GameState): GameState => ({
  ...g,
  resources: { ...g.resources, wood: g.resources.wood + GATHER_AMOUNT },
})

export function income(g: GameState): Resources {
  const r: Resources = { wood: 0, stone: 0, gold: 0 }
  g.grid.forEach((c) => {
    if (c.type && c.remaining === 0) RES.forEach((k) => (r[k] += BUILDINGS[c.type!].produces[k] ?? 0))
  })
  return r
}

export const rentalIncome = (g: GameState) => count(g, 'house') * HOUSE_RENT_PER_DAY

export function goalProgress(g: GameState) {
  const goal = levelDef(g.level).goal
  const items = Object.entries(goal.buildings ?? {}).map(([t, n]) => ({
    label: BUILDINGS[t as BuildingType].icon + ' ' + BUILDINGS[t as BuildingType].name,
    have: Math.min(count(g, t as BuildingType), n as number),
    need: n as number,
  }))
  if (goal.gold) items.push({ label: '💰 Gold', have: Math.min(Math.floor(g.resources.gold), goal.gold), need: goal.gold })
  return items
}

export function tick(g: GameState): GameState {
  if (g.won) return g
  const inc = income(g)
  const resources = { ...g.resources }
  RES.forEach((k) => (resources[k] += inc[k]))
  const grid: Cell[] = g.grid.map((c) => (c.type && c.remaining > 0 ? { ...c, remaining: c.remaining - 1 } : c))
  const ticks = g.ticks + 1
  const rent = ticks % TICKS_PER_DAY === 0
    ? grid.filter((c) => c.type === 'house' && c.remaining === 0).length * HOUSE_RENT_PER_DAY
    : 0
  const next = { ...g, resources, money: g.money + rent, grid, ticks }
  return { ...next, won: goalProgress(next).every((i) => i.have >= i.need) }
}

export const nextLevel = (g: GameState): GameState => newGame(g.level + 1)

export function isValid(s: unknown): s is GameState {
  const g = s as GameState
  return (
    !!g && g.version === 1 && typeof g.level === 'number' && g.level >= 0 &&
    Array.isArray(g.grid) && g.grid.length === levelDef(g.level).size ** 2 &&
    !!g.resources && RES.every((k) => typeof g.resources[k] === 'number') &&
    (g.money === undefined || (typeof g.money === 'number' && Number.isFinite(g.money) && g.money >= 0)) &&
    g.grid.every((c) => c && (c.type === null || c.type in BUILDINGS) && typeof c.remaining === 'number')
  )
}
