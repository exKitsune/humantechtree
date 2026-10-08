import { Hammer, FlaskConical, Landmark, Cpu, HeartPulse, Layers, Zap, Truck, Sprout, Palette, Swords, Building2, Ruler, Package, Coins, Scale, GraduationCap, BookOpen } from '@lucide/svelte'
import type { Domain, Relation } from './types'
import { TIME_ERAS } from './timeline.js'

export const domains = [
  { id: 'engineering', label: 'Tools & machines', color: '#dea352', icon: Hammer },
  { id: 'materials', label: 'Materials', color: '#c39072', icon: Layers },
  { id: 'construction', label: 'Construction & settlements', color: '#cfa486', icon: Building2 },
  { id: 'energy', label: 'Energy', color: '#dfc265', icon: Zap },
  { id: 'measurement', label: 'Measurement & standards', color: '#d0c87f', icon: Ruler },
  { id: 'science', label: 'Science & discovery', color: '#86b9b3', icon: FlaskConical },
  { id: 'medicine', label: 'Life & medicine', color: '#9cb789', icon: HeartPulse },
  { id: 'information', label: 'Information', color: '#93aecd', icon: Cpu },
  { id: 'transport', label: 'Transport', color: '#c0ad88', icon: Truck },
  { id: 'logistics', label: 'Logistics & supply', color: '#88b9aa', icon: Package },
  { id: 'warfare', label: 'Weapons & warfare', color: '#e58c7b', icon: Swords },
  { id: 'food', label: 'Food & agriculture', color: '#a5b777', icon: Sprout },
  { id: 'commerce', label: 'Trade & finance', color: '#d6b96b', icon: Coins },
  { id: 'governance', label: 'Law & governance', color: '#a9a1d2', icon: Scale },
  { id: 'society', label: 'Society & institutions', color: '#b5a2c6', icon: Landmark },
  { id: 'education', label: 'Education & knowledge institutions', color: '#97bad9', icon: GraduationCap },
  { id: 'religion', label: 'Religion & belief', color: '#c79abe', icon: BookOpen },
  { id: 'culture', label: 'Culture & expression', color: '#c997a6', icon: Palette },
] as const
export const domainInfo = Object.fromEntries(domains.map(d => [d.id, d])) as Record<Domain, typeof domains[number]>
export const relations: Record<Relation, { label: string; color: string; description: string }> = {
  foundation: { label: 'Technical foundation', color: '#ffd17c', description: 'A material, tool, method, or result directly used in this particular development. Other routes may exist.' },
  enabler: { label: 'Enabling condition', color: '#51edff', description: 'A specific infrastructure, institution, or capability that directly supported development, adoption, or scale.' },
  influence: { label: 'Historical influence', color: '#f3a0ff', description: 'An identifiable idea or practice adapted or built upon in this particular historical development.' },
}
export const eras = [{ id: 'all', label: 'All eras', min: -Infinity, max: Infinity }, ...TIME_ERAS]
export function formatYear(year: number) {
  if (year <= -1000000) return `${Number((Math.abs(year) / 1000000).toFixed(1))} million years ago`
  if (year < 0) return `${Math.abs(year).toLocaleString('en-US')} BCE`
  return `${year.toLocaleString('en-US', { useGrouping: false })} CE`
}
