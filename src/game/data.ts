import type { BuildingType, Resources } from './types'

export interface BuildingDef {
  name: string
  icon: string
  cost: Partial<Resources>
  cashCost: number
  buildTime: number
  produces: Partial<Resources>
  desc: string
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  house: { name: 'House', icon: '🏠', cost: { wood: 20, stone: 5 }, cashCost: 5000, buildTime: 3, produces: { gold: 1 }, desc: 'Residents pay +1 gold/s and $800/day rent' },
  lumber: { name: 'Lumber Mill', icon: '🪚', cost: { gold: 10, stone: 5 }, cashCost: 8000, buildTime: 3, produces: { wood: 2 }, desc: '+2 wood/s' },
  quarry: { name: 'Quarry', icon: '⛏️', cost: { wood: 25, gold: 10 }, cashCost: 12000, buildTime: 4, produces: { stone: 1 }, desc: '+1 stone/s' },
  market: { name: 'Market', icon: '🏪', cost: { wood: 40, stone: 20 }, cashCost: 15000, buildTime: 6, produces: { gold: 4 }, desc: '+4 gold/s' },
  hut: { name: "Builder's Hut", icon: '🔨', cost: { wood: 30, stone: 15, gold: 20 }, cashCost: 10000, buildTime: 5, produces: {}, desc: '+1 builder (build in parallel)' },
  tower: { name: 'Tower', icon: '🏰', cost: { wood: 80, stone: 80, gold: 80 }, cashCost: 25000, buildTime: 10, produces: { gold: 2 }, desc: 'Landmark, +2 gold/s' },
  castle: { name: 'Castle', icon: '🏯', cost: { wood: 150, stone: 180, gold: 120 }, cashCost: 40000, buildTime: 14, produces: { gold: 5 }, desc: 'Grand fortress, +5 gold/s' },
}

export const BUILDING_ORDER: BuildingType[] = ['house', 'lumber', 'quarry', 'market', 'hut', 'tower', 'castle']

export interface Level {
  size: number
  goal: { buildings?: Partial<Record<BuildingType, number>>; gold?: number }
}

export const LEVELS: Level[] = [
  { size: 2, goal: { buildings: { house: 3, lumber: 1 } } },
  { size: 5, goal: { buildings: { house: 4, quarry: 1, market: 1 } } },
  { size: 6, goal: { buildings: { house: 6, hut: 1, market: 2 }, gold: 100 } },
  { size: 6, goal: { buildings: { house: 8, market: 3, quarry: 2 }, gold: 200 } },
  { size: 7, goal: { buildings: { house: 10, market: 4, hut: 2, tower: 1 }, gold: 300 } },
]

export const MAX_UPGRADE = 3
export const CONDITION_DECAY_TICKS = 10
export const GATHER_AMOUNT = 5
export const STARTING_MONEY = 100_000
export const HOUSE_RENT_PER_DAY = 800
export const TICKS_PER_DAY = 60
export const MATERIAL_ORDER_AMOUNT = 10
export const MATERIAL_DELIVERY_TIME = 10
export const MATERIAL_ORDER_COST = { wood: 1000, stone: 1500 } as const
export const SAVE_KEY = 'build-it-save-v1'
