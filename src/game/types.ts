export type Resource = 'materials'
export type Resources = Record<Resource, number>
export type BuildingType = 'rambler' | 'colonial' | 'tudor' | 'estate' | 'mansion' | 'castle'

export interface MaterialDelivery {
  quantity: number
  remaining: number
}

export interface Cell {
  type: BuildingType | null
  lotOwned: boolean
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
  deliveries: MaterialDelivery[]
  money: number
  hiredWorkers?: number
  grid: Cell[]
  ticks: number
  won: boolean
}
