export type Resource = 'materials'
export type Resources = Record<Resource, number>
export type BuildingType = 'rambler' | 'colonial' | 'tudor' | 'estate' | 'mansion' | 'castle' | 'workshop' | 'sawmill'
export type PaintColor = 'yellow' | 'pink' | 'red' | 'green' | 'blue' | 'orange'

export interface MaterialDelivery {
  quantity: number
  remaining: number
  duration?: number
}

export interface Cell {
  type: BuildingType | null
  lotOwned: boolean
  /** seconds of construction left; 0 = finished */
  remaining: number
  taskDuration?: number
  upgradePending?: boolean
  /** upgrade level, 0..MAX_LEVEL */
  level: number
  /** 0..100, decays over time; restored by maintenance */
  condition: number
  painted: boolean
  paintColor?: PaintColor
  /** colour being applied while a paint job is in progress */
  paintingColor?: PaintColor
  paintRemaining?: number
  paintDuration?: number
  landscaped: boolean
  /** sold to someone else: stays on the lot but no longer owned */
  sold: boolean
}

export interface GameState {
  version: number
  level: number
  resources: Resources
  deliveries: MaterialDelivery[]
  money: number
  sawmillBuilt?: boolean
  hiredWorkers?: number
  grid: Cell[]
  ticks: number
  won: boolean
}
