export type Resource = 'wood' | 'stone' | 'gold'
export type Resources = Record<Resource, number>
export type BuildingType = 'house' | 'lumber' | 'quarry' | 'market' | 'hut' | 'tower' | 'castle'

export interface Cell {
  type: BuildingType | null
  /** seconds of construction left; 0 = finished */
  remaining: number
  /** upgrade level, 0..MAX_LEVEL */
  level: number
  /** 0..100, decays over time; restored by maintenance */
  condition: number
  /** sold to someone else: stays on the lot but no longer owned */
  sold: boolean
}

export interface GameState {
  version: number
  level: number
  resources: Resources
  money: number
  grid: Cell[]
  ticks: number
  won: boolean
}
