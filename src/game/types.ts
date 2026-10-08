export type Resource = 'wood' | 'stone' | 'gold'
export type Resources = Record<Resource, number>
export type BuildingType = 'house' | 'lumber' | 'quarry' | 'market' | 'hut' | 'tower'

export interface Cell {
  type: BuildingType | null
  /** seconds of construction left; 0 = finished */
  remaining: number
}

export interface GameState {
  version: number
  level: number
  resources: Resources
  grid: Cell[]
  ticks: number
  won: boolean
}
