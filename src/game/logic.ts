import { BUILDINGS, CONDITION_DECAY_TICKS, LEVELS, LOT_COST, MATERIAL_ORDERS, MAX_UPGRADE, PAINT_COLORS, PAINT_TIME, STARTING_MONEY, TICKS_PER_DAY, WORKER_HIRE_COSTS } from './data'
import type { BuildingType, Cell, GameState, PaintColor } from './types'

export const levelDef = (level: number) => LEVELS[Math.min(level, LEVELS.length - 1)]

export const emptyCell = (lotOwned = false): Cell => ({ type: null, lotOwned, remaining: 0, level: 0, condition: 100, painted: false, landscaped: false, sold: false })

/** a finished building the player still owns */
export const isOwned = (c: Cell) => !!c.type && c.remaining === 0 && !c.sold

export const newGame = (level = 0): GameState => ({
  version: 2,
  level,
  resources: { materials: 75 },
  deliveries: [],
  sawmillBuilt: false,
  money: STARTING_MONEY,
  grid: Array.from({ length: levelDef(level).size ** 2 }, () => emptyCell()),
  ticks: 0,
  won: false,
})

export const builders = (g: GameState) =>
  1 + (g.hiredWorkers ?? 0)

export const busyBuilders = (g: GameState) => g.grid.reduce((total, c) =>
  total + (c.type && c.remaining > 0 ? BUILDINGS[c.type].workers : 0), 0)

export const canAfford = (g: GameState, type: BuildingType) =>
  g.resources.materials >= BUILDINGS[type].cost

export const canBuild = (g: GameState, type: BuildingType) =>
  canAfford(g, type) && builders(g) >= BUILDINGS[type].workers

export const hasSawmill = (g: GameState) =>
  g.sawmillBuilt === true || g.grid.some((cell) => cell.type === 'sawmill' && isOwned(cell))

export const hasWorkshop = (g: GameState) =>
  g.grid.some((cell) => cell.type === 'workshop' && isOwned(cell))

export const count = (g: GameState, type: BuildingType) =>
  g.grid.filter((c) => c.type === type && isOwned(c)).length

export function build(g: GameState, index: number, type: BuildingType): GameState {
  const cell = g.grid[index]
  if (!cell?.lotOwned || cell.type || !canBuild(g, type) || busyBuilders(g) + BUILDINGS[type].workers > builders(g)) return g
  const resources = { ...g.resources }
  resources.materials -= BUILDINGS[type].cost
  const grid = g.grid.slice()
  grid[index] = { ...emptyCell(true), type, remaining: BUILDINGS[type].buildTime, taskDuration: BUILDINGS[type].buildTime }
  return { ...g, resources, grid }
}

export function buyLot(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || cell.lotOwned || cell.type || g.money < LOT_COST) return g
  const grid = g.grid.slice()
  grid[index] = emptyCell(true)
  return { ...g, money: g.money - LOT_COST, grid }
}

export function demolish(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell?.type || cell.sold) return g
  const resources = { ...g.resources }
  resources.materials += Math.floor(BUILDINGS[cell.type].cost * 3 / 5)
  const grid = g.grid.slice()
  grid[index] = emptyCell(cell.lotOwned)
  return { ...g, resources, grid }
}

export const houseValue = (cell: Cell) => {
  if (!cell.type) return 0
  return BUILDINGS[cell.type].cashCost * (1 + cell.level * 0.1 + (cell.landscaped ? 0.05 : 0) + (cell.painted ? 0.05 : 0))
}

export const salePrice = houseValue

const updateCell = (g: GameState, index: number, fn: (c: Cell) => Cell, gain = 0): GameState => {
  const grid = g.grid.slice()
  grid[index] = fn(grid[index])
  return { ...g, grid, money: g.money + gain }
}

export function upgrade(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || !cell.type || !isOwned(cell) || cell.level >= MAX_UPGRADE) return g
  if (busyBuilders(g) + BUILDINGS[cell.type].workers > builders(g)) return g
  const materials = upgradeCost(cell.type, cell.level)
  if (g.resources.materials < materials) return g
  const grid = g.grid.slice()
  grid[index] = {
    ...cell,
    remaining: BUILDINGS[cell.type].upgradeTime,
    taskDuration: BUILDINGS[cell.type].upgradeTime,
    upgradePending: true,
  }
  return {
    ...g,
    resources: { ...g.resources, materials: g.resources.materials - materials },
    grid,
  }
}

export const upgradeCost = (type: BuildingType, level: number) =>
  Math.floor(BUILDINGS[type].cost * (level + 1) / 5)

export function landscape(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell?.type || !isOwned(cell) || cell.landscaped) return g
  const cost = improvementCost(cell.type)
  if (g.resources.materials < cost) return g
  const grid = g.grid.slice()
  grid[index] = { ...cell, landscaped: true }
  return { ...g, resources: { ...g.resources, materials: g.resources.materials - cost }, grid }
}

export function paintBuilding(g: GameState, index: number, color: PaintColor = PAINT_COLORS[0].id): GameState {
  const cell = g.grid[index]
  if (!cell?.type || !isOwned(cell) || cell.remaining > 0 || cell.paintingColor || (cell.painted && cell.paintColor === color)) return g
  const cost = improvementCost(cell.type)
  if (g.resources.materials < cost) return g
  const grid = g.grid.slice()
  grid[index] = { ...cell, paintingColor: color, paintRemaining: PAINT_TIME, paintDuration: PAINT_TIME }
  return { ...g, resources: { ...g.resources, materials: g.resources.materials - cost }, grid }
}

/** 0 = not painting; 1..3 = visible stages (25%, 50%, 75% painted) while a paint job runs */
export function paintStage(c: Cell): 0 | 1 | 2 | 3 {
  if (!c.paintingColor || !c.paintRemaining || !c.paintDuration) return 0
  const elapsed = (c.paintDuration - c.paintRemaining) / c.paintDuration
  return elapsed < 0.25 ? 1 : elapsed < 0.5 ? 2 : 3
}

export const improvementCost = (type: BuildingType) => Math.floor(BUILDINGS[type].cost / 10)

export function maintain(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell?.type || !isOwned(cell) || cell.condition >= 100) return g
  const cost = maintenanceCost(cell.type)
  if (g.resources.materials < cost) return g
  const grid = g.grid.slice()
  grid[index] = { ...cell, condition: 100 }
  return { ...g, resources: { ...g.resources, materials: g.resources.materials - cost }, grid }
}

export const maintenanceCost = (type: BuildingType) => Math.floor(BUILDINGS[type].cost / 5)

export const workerHireCost = (workers: number, workshopBuilt = false) => {
  if (!Number.isInteger(workers) || workers < 1 || workers > WORKER_HIRE_COSTS.length) return Infinity
  const cost = WORKER_HIRE_COSTS[workers - 1]
  return workshopBuilt ? Math.floor(cost / 2) : cost
}

export function hireWorkers(g: GameState, workers: number): GameState {
  const cost = workerHireCost(workers, hasWorkshop(g))
  if (!Number.isFinite(cost) || g.money < cost) return g
  return { ...g, money: g.money - cost, hiredWorkers: (g.hiredWorkers ?? 0) + workers }
}

export function sell(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || !isOwned(cell)) return g
  return updateCell(g, index, (c) => ({ ...c, sold: true }), houseValue(cell))
}

export const materialDeliveryTime = (g: GameState, order: typeof MATERIAL_ORDERS[number]) =>
  hasSawmill(g) ? order.deliveryTime / 2 : order.deliveryTime

export function advanceDeliveries(g: GameState): GameState {
  const resources = { ...g.resources }
  let changed = false
  const deliveries = g.deliveries.flatMap((delivery) => {
    const remaining = Math.max(0, delivery.remaining - 0.5)
    changed = true
    if (remaining === 0) {
      resources.materials += delivery.quantity
      return []
    }
    return [{ ...delivery, remaining }]
  })
  return changed ? { ...g, resources, deliveries } : g
}

export function orderMaterials(g: GameState, order: typeof MATERIAL_ORDERS[number]): GameState {
  const cost = hasSawmill(g) ? Math.floor(order.cost / 2) : order.cost
  if (g.money < cost) return g
  const duration = materialDeliveryTime(g, order)
  return {
    ...g,
    money: g.money - cost,
    deliveries: [...g.deliveries, {
      quantity: order.quantity,
      remaining: duration,
      duration,
    }],
  }
}

const RENT_MULTIPLIERS = [1, 1.2, 1.6, 2]

const houseRent = (c: Cell) => (c.type && isOwned(c) ? BUILDINGS[c.type].rentPerDay * RENT_MULTIPLIERS[c.level] : 0)

export const rentalIncome = (g: GameState) => g.grid.reduce((sum, c) => sum + houseRent(c), 0)

export function goalProgress(g: GameState) {
  const goal = levelDef(g.level).goal
  const items = Object.entries(goal.buildings ?? {}).map(([t, n]) => ({
    label: BUILDINGS[t as BuildingType].icon + ' ' + BUILDINGS[t as BuildingType].name,
    have: Math.min(count(g, t as BuildingType), n as number),
    need: n as number,
  }))
  return items
}

export function tick(g: GameState): GameState {
  if (g.won) return g
  const resources = { ...g.resources }
  const ticks = g.ticks + 1
  const decay = ticks % CONDITION_DECAY_TICKS === 0
  const grid: Cell[] = g.grid.map((raw) => {
    let c = raw
    if (c.paintingColor) {
      const paintRemaining = Math.max(0, (c.paintRemaining ?? 0) - 1)
      c = paintRemaining === 0
        ? { ...c, painted: true, paintColor: c.paintingColor, paintingColor: undefined, paintRemaining: undefined, paintDuration: undefined }
        : { ...c, paintRemaining }
    }
    if (c.type && c.remaining > 0) {
      const remaining = Math.max(0, c.remaining - 1)
      return remaining === 0
        ? { ...c, remaining, taskDuration: undefined, upgradePending: false, level: c.level + (c.upgradePending ? 1 : 0) }
        : { ...c, remaining }
    }
    return decay && isOwned(c) && c.condition > 0
      ? { ...c, condition: c.condition - 1 }
      : c
  })
  const rent = ticks % TICKS_PER_DAY === 0 ? rentalIncome({ ...g, grid }) : 0
  const next = { ...g, resources, money: g.money + rent, grid, ticks }
  return { ...next, won: goalProgress(next).every((i) => i.have >= i.need) }
}

export const nextLevel = (g: GameState): GameState => newGame(g.level + 1)

export function isValid(s: unknown): s is GameState {
  const g = s as GameState
  return (
    !!g && g.version === 2 && typeof g.level === 'number' && g.level >= 0 &&
    Array.isArray(g.grid) && g.grid.length === levelDef(g.level).size ** 2 &&
    !!g.resources && typeof g.resources.materials === 'number' &&
    (g.hiredWorkers === undefined || (Number.isInteger(g.hiredWorkers) && g.hiredWorkers >= 0)) &&
    (g.deliveries === undefined || (Array.isArray(g.deliveries) && g.deliveries.every((delivery) =>
      delivery &&
      Number.isInteger(delivery.quantity) && delivery.quantity > 0 &&
      Number.isFinite(delivery.remaining) && delivery.remaining > 0 &&
      (delivery.duration === undefined || (Number.isFinite(delivery.duration) && delivery.duration > 0))))) &&
    (g.money === undefined || (typeof g.money === 'number' && Number.isFinite(g.money) && g.money >= 0)) &&
    (g.sawmillBuilt === undefined || typeof g.sawmillBuilt === 'boolean') &&
    g.grid.every((c) => c && (c.type === null || c.type in BUILDINGS) && typeof c.lotOwned === 'boolean' && typeof c.remaining === 'number' &&
      (c.level === undefined || (Number.isInteger(c.level) && c.level >= 0 && c.level <= MAX_UPGRADE)) &&
      (c.taskDuration === undefined || (Number.isFinite(c.taskDuration) && c.taskDuration > 0)) &&
      (c.upgradePending === undefined || typeof c.upgradePending === 'boolean') &&
      (c.painted === undefined || typeof c.painted === 'boolean') &&
      (c.paintingColor === undefined || (PAINT_COLORS.some(({ id }) => id === c.paintingColor) && Number.isFinite(c.paintRemaining) && Number.isFinite(c.paintDuration) && (c.paintDuration as number) > 0)) &&
      (c.paintColor === undefined || PAINT_COLORS.some(({ id }) => id === c.paintColor)) &&
      (c.landscaped === undefined || typeof c.landscaped === 'boolean') &&
      (c.condition === undefined || (typeof c.condition === 'number' && c.condition >= 0 && c.condition <= 100)))
  )
}
