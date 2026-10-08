import type { BuildingType } from './types'

export interface BuildingDef {
  name: string
  icon: string
  cost: number
  cashCost: number
  workers: number
  rentPerDay: number
  buildTime: number
  desc: string
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  rambler: { name: 'Rambler', icon: '🏠', cost: 75, cashCost: 50000, workers: 1, rentPerDay: 800, buildTime: 3, desc: 'Entry-level home · $800/day rent' },
  colonial: { name: 'Colonial', icon: '🏡', cost: 150, cashCost: 75000, workers: 2, rentPerDay: 1200, buildTime: 4, desc: 'Modest mid-tier home · $1,200/day rent' },
  tudor: { name: 'Tudor', icon: '🏘️', cost: 300, cashCost: 150000, workers: 3, rentPerDay: 2400, buildTime: 6, desc: 'Stylish family home · $2,400/day rent' },
  estate: { name: 'Estate', icon: '🏛️', cost: 600, cashCost: 300000, workers: 5, rentPerDay: 4800, buildTime: 8, desc: 'High-value upscale residence · $4,800/day rent' },
  mansion: { name: 'Mansion', icon: '🏰', cost: 1200, cashCost: 600000, workers: 7, rentPerDay: 9600, buildTime: 10, desc: 'Luxury premium property · $9,600/day rent' },
  castle: { name: 'Castle', icon: '🏯', cost: 2500, cashCost: 1200000, workers: 9, rentPerDay: 19200, buildTime: 14, desc: 'Ultimate high-rent property · $19,200/day rent' },
}

export const BUILDING_ORDER: BuildingType[] = ['rambler', 'colonial', 'tudor', 'estate', 'mansion', 'castle']

export interface Level {
  size: number
  goal: { buildings?: Partial<Record<BuildingType, number>> }
}

export const LEVELS: Level[] = [
  { size: 2, goal: { buildings: { rambler: 1 } } },
  { size: 3, goal: { buildings: { rambler: 2 } } },
  { size: 4, goal: { buildings: { rambler: 3 } } },
  { size: 5, goal: { buildings: { rambler: 4 } } },
  { size: 6, goal: { buildings: { rambler: 5 } } },
]

export const LOT_COST = 25_000
export const MAX_UPGRADE = 3
export const CONDITION_DECAY_TICKS = 10
export const GATHER_AMOUNT = 5
export const STARTING_MONEY = 100_000
export const WORKER_HIRE_COSTS = [50_000, 90_000, 120_000] as const
export const TICKS_PER_DAY = 60
export const MATERIAL_ORDER_AMOUNT = 10
export const MATERIAL_DELIVERY_TIME = 10
export const MATERIAL_ORDER_COST = 1000
export const SAVE_KEY = 'build-it-save-v2'
