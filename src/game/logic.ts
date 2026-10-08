import { BUILDINGS, CONDITION_DECAY_TICKS, EFFICIENCY_TRAINING_COST, GATHER_AMOUNT, HOUSE_RENT_PER_DAY, LEVELS, MATERIAL_DELIVERY_TIME, MATERIAL_ORDER_AMOUNT, MATERIAL_ORDER_COST, MAX_UPGRADE, STARTING_MONEY, TICKS_PER_DAY, WORKER_HIRE_COSTS } from './data'
import type { BuildingType, Cell, GameState, Material, Resource, Resources } from './types'

const RES: Resource[] = ['wood', 'stone', 'gold']

export const levelDef = (level: number) => LEVELS[Math.min(level, LEVELS.length - 1)]

export const emptyCell = (): Cell => ({ type: null, remaining: 0, level: 0, condition: 100, sold: false })

/** a finished building the player still owns */
export const isOwned = (c: Cell) => !!c.type && c.remaining === 0 && !c.sold

export const newGame = (level = 0): GameState => ({
  version: 1,
  level,
  resources: { wood: 50, stone: 20, gold: 20 },
  deliveries: [],
  money: STARTING_MONEY,
  grid: Array.from({ length: levelDef(level).size ** 2 }, () => emptyCell()),
  ticks: 0,
  won: false,
})

export const builders = (g: GameState) =>
  1 + (g.hiredWorkers ?? 0) + g.grid.filter((c) => c.type === 'hut' && isOwned(c)).length

export const busyBuilders = (g: GameState) => g.grid.filter((c) => c.type && c.remaining > 0).length

export const canAfford = (g: GameState, type: BuildingType) =>
  g.money >= BUILDINGS[type].cashCost &&
  RES.every((k) => g.resources[k] >= (BUILDINGS[type].cost[k] ?? 0))

export const hasWorkshop = (g: GameState) =>
  g.grid.some((c) => c.type === 'workshop' && isOwned(c))

export const canBuild = (g: GameState, type: BuildingType) =>
  canAfford(g, type) && (type !== 'workshop' || builders(g) >= 3)

export const count = (g: GameState, type: BuildingType) =>
  g.grid.filter((c) => c.type === type && isOwned(c)).length

export function build(g: GameState, index: number, type: BuildingType): GameState {
  const cell = g.grid[index]
  if (!cell || cell.type || !canBuild(g, type) || busyBuilders(g) >= builders(g)) return g
  const resources = { ...g.resources }
  RES.forEach((k) => (resources[k] -= BUILDINGS[type].cost[k] ?? 0))
  const grid = g.grid.slice()
  grid[index] = { ...emptyCell(), type, remaining: BUILDINGS[type].buildTime }
  return { ...g, resources, money: g.money - BUILDINGS[type].cashCost, grid }
}

export function demolish(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell?.type || cell.sold) return g
  const resources = { ...g.resources }
  RES.forEach((k) => (resources[k] += Math.floor((BUILDINGS[cell.type!].cost[k] ?? 0) / 2)))
  const grid = g.grid.slice()
  grid[index] = emptyCell()
  return { ...g, resources, money: g.money + Math.floor(BUILDINGS[cell.type].cashCost / 2), grid }
}

export const upgradeCost = (cell: Cell) =>
  cell.type ? Math.round(BUILDINGS[cell.type].cashCost * 0.5 * (cell.level + 1)) : 0

export const maintainCost = (cell: Cell) =>
  cell.type ? Math.round(BUILDINGS[cell.type].cashCost * 0.05 * (1 + cell.level)) : 0

export const salePrice = (cell: Cell) => {
  if (!cell.type) return 0
  let value = BUILDINGS[cell.type].cashCost
  for (let l = 0; l < cell.level; l++) value += Math.round(BUILDINGS[cell.type].cashCost * 0.5 * (l + 1))
  return Math.floor(value * 0.7 * (0.5 + 0.5 * cell.condition / 100))
}

const updateCell = (g: GameState, index: number, fn: (c: Cell) => Cell, cost = 0, gain = 0): GameState => {
  const grid = g.grid.slice()
  grid[index] = fn(grid[index])
  return { ...g, grid, money: g.money - cost + gain }
}

export function upgrade(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || !isOwned(cell) || cell.level >= MAX_UPGRADE || g.money < upgradeCost(cell)) return g
  return updateCell(g, index, (c) => ({ ...c, level: c.level + 1 }), upgradeCost(cell))
}

export function maintain(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || !isOwned(cell) || cell.condition >= 100 || g.money < maintainCost(cell)) return g
  return updateCell(g, index, (c) => ({ ...c, condition: 100 }), maintainCost(cell))
}

export function inspect(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!hasWorkshop(g) || !cell || cell.type !== 'house' || !isOwned(cell) || cell.inspected) return g
  return updateCell(g, index, (c) => ({ ...c, inspected: true }))
}

export const workerHireCost = (g: GameState, workers: number) => {
  if (!Number.isInteger(workers) || workers < 1 || workers > WORKER_HIRE_COSTS.length) return Infinity
  const baseCost = WORKER_HIRE_COSTS[workers - 1]
  return hasWorkshop(g) ? baseCost / 2 : baseCost
}

export function hireWorkers(g: GameState, workers: number): GameState {
  const cost = workerHireCost(g, workers)
  if (!Number.isFinite(cost) || g.money < cost) return g
  return { ...g, money: g.money - cost, hiredWorkers: (g.hiredWorkers ?? 0) + workers }
}

export function trainEfficiency(g: GameState): GameState {
  if (!hasWorkshop(g) || g.efficiencyTrained || g.money < EFFICIENCY_TRAINING_COST) return g
  return { ...g, money: g.money - EFFICIENCY_TRAINING_COST, efficiencyTrained: true }
}

export function sell(g: GameState, index: number): GameState {
  const cell = g.grid[index]
  if (!cell || !isOwned(cell)) return g
  return updateCell(g, index, (c) => ({ ...c, sold: true }), 0, salePrice(cell))
}

export const gather = (g: GameState): GameState => ({
  ...g,
  resources: { ...g.resources, wood: g.resources.wood + GATHER_AMOUNT },
})

export function orderMaterials(g: GameState, material: Material): GameState {
  const cost = MATERIAL_ORDER_COST[material]
  if (g.money < cost) return g
  return {
    ...g,
    money: g.money - cost,
    deliveries: [...g.deliveries, {
      material,
      quantity: MATERIAL_ORDER_AMOUNT,
      remaining: MATERIAL_DELIVERY_TIME,
    }],
  }
}

export function income(g: GameState): Resources {
  const r: Resources = { wood: 0, stone: 0, gold: 0 }
  g.grid.forEach((c) => {
    if (isOwned(c)) RES.forEach((k) => (r[k] += (BUILDINGS[c.type!].produces[k] ?? 0) * (c.level + 1)))
  })
  return r
}

const houseRent = (c: Cell) => (c.type === 'house' && isOwned(c) ? HOUSE_RENT_PER_DAY * (1 + c.level / 2) : 0)

export const rentalIncome = (g: GameState) => g.grid.reduce((sum, c) => sum + houseRent(c), 0)

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
  const ticks = g.ticks + 1
  const decay = ticks % CONDITION_DECAY_TICKS === 0
  const deliveries = g.deliveries.filter((delivery) => delivery.remaining > 1)
    .map((delivery) => ({ ...delivery, remaining: delivery.remaining - 1 }))
  g.deliveries.forEach((delivery) => {
    if (delivery.remaining <= 1) resources[delivery.material] += delivery.quantity
  })
  const buildSpeed = g.efficiencyTrained && hasWorkshop(g) ? 2 : 1
  const grid: Cell[] = g.grid.map((c) =>
    c.type && c.remaining > 0
      ? { ...c, remaining: Math.max(0, c.remaining - buildSpeed) }
      : decay && isOwned(c) && c.condition > 0
        ? c.inspected
          ? { ...c, inspected: false }
          : { ...c, condition: c.condition - 1 }
        : c)
  const rent = ticks % TICKS_PER_DAY === 0 ? rentalIncome({ ...g, grid }) : 0
  const next = { ...g, resources, deliveries, money: g.money + rent, grid, ticks }
  return { ...next, won: goalProgress(next).every((i) => i.have >= i.need) }
}

export const nextLevel = (g: GameState): GameState => newGame(g.level + 1)

export function isValid(s: unknown): s is GameState {
  const g = s as GameState
  return (
    !!g && g.version === 1 && typeof g.level === 'number' && g.level >= 0 &&
    Array.isArray(g.grid) && g.grid.length === levelDef(g.level).size ** 2 &&
    !!g.resources && RES.every((k) => typeof g.resources[k] === 'number') &&
    (g.hiredWorkers === undefined || (Number.isInteger(g.hiredWorkers) && g.hiredWorkers >= 0)) &&
    (g.efficiencyTrained === undefined || typeof g.efficiencyTrained === 'boolean') &&
    (g.deliveries === undefined || (Array.isArray(g.deliveries) && g.deliveries.every((delivery) =>
      delivery && (delivery.material === 'wood' || delivery.material === 'stone') &&
      Number.isInteger(delivery.quantity) && delivery.quantity > 0 &&
      Number.isInteger(delivery.remaining) && delivery.remaining > 0))) &&
    (g.money === undefined || (typeof g.money === 'number' && Number.isFinite(g.money) && g.money >= 0)) &&
    g.grid.every((c) => c && (c.type === null || c.type in BUILDINGS) && typeof c.remaining === 'number' &&
      (c.level === undefined || (Number.isInteger(c.level) && c.level >= 0 && c.level <= MAX_UPGRADE)) &&
      (c.condition === undefined || (typeof c.condition === 'number' && c.condition >= 0 && c.condition <= 100)))
  )
}
