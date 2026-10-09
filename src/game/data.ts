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
  rambler: { name: 'Rambler', icon: '🏠', cost: 75, cashCost: 50000, workers: 1, rentPerDay: 1000, buildTime: 3, desc: 'Entry-level home · $1,000/day rent' },
  colonial: { name: 'Colonial', icon: '🏡', cost: 150, cashCost: 75000, workers: 2, rentPerDay: 1500, buildTime: 4, desc: 'Modest mid-tier home · $1,500/day rent' },
  tudor: { name: 'Tudor', icon: '🏘️', cost: 300, cashCost: 150000, workers: 3, rentPerDay: 3000, buildTime: 6, desc: 'Stylish family home · $3,000/day rent' },
  estate: { name: 'Estate', icon: '🏛️', cost: 600, cashCost: 300000, workers: 5, rentPerDay: 6000, buildTime: 8, desc: 'High-value upscale residence · $6,000/day rent' },
  mansion: { name: 'Mansion', icon: '🏰', cost: 1200, cashCost: 600000, workers: 7, rentPerDay: 15000, buildTime: 10, desc: 'Luxury premium property · $15,000/day rent' },
  castle: { name: 'Castle', icon: '🏯', cost: 2500, cashCost: 1200000, workers: 9, rentPerDay: 25000, buildTime: 14, desc: 'Ultimate high-rent property · $25,000/day rent' },
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
export const MATERIAL_DELIVERY_TIME = 15
export const SAWMILL_COST = 50_000
export const MATERIAL_ORDERS = [
  { quantity: 100, cost: 10_000, deliveryTime: 5 },
  { quantity: 250, cost: 22_500, deliveryTime: 5 },
  { quantity: 500, cost: 40_000, deliveryTime: 8 },
  { quantity: 1_000, cost: 75_000, deliveryTime: 10 },
  { quantity: 2_500, cost: 150_000, deliveryTime: 16 },
  { quantity: 5_000, cost: 250_000, deliveryTime: 20 },
] as const
export const SAVE_KEY = 'build-it-save-v2'
