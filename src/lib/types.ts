export type Domain = 'materials' | 'engineering' | 'energy' | 'transport' | 'food' | 'science' | 'medicine' | 'information' | 'society' | 'culture'
export type Relation = 'foundation' | 'enabler' | 'influence'
export type Parent = { id: string; type: Relation; reason: string; source?: string; reviewed?: boolean }
export type Capability = {
  id: string
  title: string
  wiki: string
  year: number
  domain: Domain
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
export type LayoutNode = Point & { id: string; width: number; height: number; ports: LayoutPort[] }
export type GraphLayout = {
  nodes: LayoutNode[]
  edges: { id: string; source: string; target: string; sourceHandle: string; targetHandle: string; points: Point[] }[]
  width: number
  height: number
}
