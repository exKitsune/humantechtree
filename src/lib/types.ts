export type Domain = 'engineering' | 'materials' | 'construction' | 'energy' | 'measurement' | 'science' | 'medicine' | 'information' | 'transport' | 'logistics' | 'warfare' | 'food' | 'commerce' | 'governance' | 'society' | 'education' | 'religion' | 'culture'
export type Relation = 'foundation' | 'enabler' | 'influence'
export type Parent = { id: string; type: Relation; reason: string; source?: string; reviewed?: boolean; directContribution?: string }
export type Capability = {
  id: string
  title: string
  wiki: string
  year: number
  domain: Domain
  category?: string
  kind: 'technology' | 'discovery' | 'infrastructure' | 'institution' | 'practice'
  summary: string
  parents: Parent[]
}
export type WikipediaEntry = {
  title: string
  url: string
  pageId: number
  revision: number
  checked: string
  thumbnail?: string
  imageTitle?: string
  imagePage?: string
  imageArtist?: string
  imageLicense?: string
  imageLicenseUrl?: string
  imageDescription?: string
  missing?: boolean
  disambiguation?: boolean
}
export type Catalog = { nodes: Capability[]; generated: string; version: number }
export type Point = { x: number; y: number }
export type LayoutPort = Point & { id: string; type: 'source' | 'target' }
export type LayoutNode = Point & { id: string; domain: Domain; category?: string; rank: number; width: number; height: number; ports: LayoutPort[] }
export type TimePeriod = { id: string; label: string; min: number; max: number; count: number; x: number; width: number }
export type TimeBand = TimePeriod & { subdivisions: TimePeriod[] }
export type CategoryRegion = { id: string; category?: string; x: number; y: number; width: number; height: number; count: number }
export type GraphLayout = {
  nodes: LayoutNode[]
  // points is the orthogonal skeleton; an optional cubic stays inside its bounds.
  edges: { id: string; source: string; target: string; type: Relation; sourceHandle: string; targetHandle: string; points: Point[]; curve?: { from: Point; to: Point } }[]
  bands: { id: Domain; y: number; height: number; count: number; categories?: CategoryRegion[] }[]
  timeBands: TimeBand[]
  width: number
  height: number
}

export type CameraSnapshot = { x: number; y: number; zoom: number; width: number; height: number }
export type FollowedConnection = Parent & { source: string; target: string }
export type NavigationView = {
  label: string
  selectedId: string
  focused: boolean
  domain: Domain | 'all'
  eraId: string
  category: string
  detailsTab: 'overview' | 'connections'
  detailsOpen: boolean
  expandedGroups: string[]
  connection: FollowedConnection | null
  viewport: CameraSnapshot | null
  detailScroll: number
}
