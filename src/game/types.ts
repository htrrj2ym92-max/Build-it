export type Resource = 'wood' | 'stone' | 'gold'
export type Resources = Record<Resource, number>
export type Material = 'wood' | 'stone'
export type BuildingType = 'house' | 'lumber' | 'quarry' | 'market' | 'hut' | 'workshop' | 'tower' | 'castle'

export interface MaterialDelivery {
  material: Material
  quantity: number
  remaining: number
}

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
  /** inspection protects the building from its next condition decay */
  inspected?: boolean
}

export interface GameState {
  version: number
  level: number
  resources: Resources
  deliveries: MaterialDelivery[]
  money: number
  hiredWorkers?: number
  efficiencyTrained?: boolean
  grid: Cell[]
  ticks: number
  won: boolean
}
