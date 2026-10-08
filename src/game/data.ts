import type { BuildingType, Resources } from './types'

export interface BuildingDef {
  name: string
  icon: string
  cost: Partial<Resources>
  buildTime: number
  produces: Partial<Resources>
  desc: string
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  house: { name: 'House', icon: '🏠', cost: { wood: 20, stone: 5 }, buildTime: 3, produces: { gold: 1 }, desc: 'Residents pay +1 gold/s' },
  lumber: { name: 'Lumber Mill', icon: '🪚', cost: { gold: 10, stone: 5 }, buildTime: 3, produces: { wood: 2 }, desc: '+2 wood/s' },
  quarry: { name: 'Quarry', icon: '⛏️', cost: { wood: 25, gold: 10 }, buildTime: 4, produces: { stone: 1 }, desc: '+1 stone/s' },
  market: { name: 'Market', icon: '🏪', cost: { wood: 40, stone: 20 }, buildTime: 6, produces: { gold: 4 }, desc: '+4 gold/s' },
  hut: { name: "Builder's Hut", icon: '🔨', cost: { wood: 30, stone: 15, gold: 20 }, buildTime: 5, produces: {}, desc: '+1 builder (build in parallel)' },
  tower: { name: 'Tower', icon: '🏰', cost: { wood: 80, stone: 80, gold: 80 }, buildTime: 10, produces: { gold: 2 }, desc: 'Landmark, +2 gold/s' },
}

export const BUILDING_ORDER: BuildingType[] = ['house', 'lumber', 'quarry', 'market', 'hut', 'tower']

export interface Level {
  size: number
  goal: { buildings?: Partial<Record<BuildingType, number>>; gold?: number }
}

export const LEVELS: Level[] = [
  { size: 5, goal: { buildings: { house: 3, lumber: 1 } } },
  { size: 5, goal: { buildings: { house: 4, quarry: 1, market: 1 } } },
  { size: 6, goal: { buildings: { house: 6, hut: 1, market: 2 }, gold: 100 } },
  { size: 6, goal: { buildings: { house: 8, market: 3, quarry: 2 }, gold: 200 } },
  { size: 7, goal: { buildings: { house: 10, market: 4, hut: 2, tower: 1 }, gold: 300 } },
]

export const GATHER_AMOUNT = 5
export const SAVE_KEY = 'build-it-save-v1'
