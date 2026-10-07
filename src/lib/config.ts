import { Hammer, FlaskConical, Landmark, Cpu, HeartPulse, Layers, Zap, Truck, Sprout, Palette } from '@lucide/svelte'
import type { Domain, Relation } from './types'
import { TIME_ERAS } from './timeline.js'

export const domains = [
  { id: 'engineering', label: 'Tools & machines', color: '#dea352', icon: Hammer },
  { id: 'materials', label: 'Materials', color: '#c39072', icon: Layers },
  { id: 'energy', label: 'Energy', color: '#dfc265', icon: Zap },
  { id: 'science', label: 'Science & discovery', color: '#86b9b3', icon: FlaskConical },
  { id: 'medicine', label: 'Life & medicine', color: '#9cb789', icon: HeartPulse },
  { id: 'information', label: 'Information', color: '#93aecd', icon: Cpu },
  { id: 'transport', label: 'Transport', color: '#c0ad88', icon: Truck },
  { id: 'food', label: 'Food & agriculture', color: '#a5b777', icon: Sprout },
  { id: 'society', label: 'Society & institutions', color: '#b5a2c6', icon: Landmark },
  { id: 'culture', label: 'Culture & expression', color: '#c997a6', icon: Palette },
] as const
export const domainInfo = Object.fromEntries(domains.map(d => [d.id, d])) as Record<Domain, typeof domains[number]>
export const relations: Record<Relation, { label: string; color: string; description: string }> = {
  foundation: { label: 'Technical foundation', color: '#ffd17c', description: 'A material, tool, or body of knowledge used by this particular technology or method. Other routes may exist.' },
  enabler: { label: 'Enabling condition', color: '#51edff', description: 'An infrastructure, institution, or capability that helped development, adoption, or scale.' },
  influence: { label: 'Historical influence', color: '#f3a0ff', description: 'An earlier idea or practice that shaped a particular historical development.' },
}
export const eras = [{ id: 'all', label: 'All eras', min: -Infinity, max: Infinity }, ...TIME_ERAS]
export function formatYear(year: number) {
  if (year <= -1000000) return `${Number((Math.abs(year) / 1000000).toFixed(1))} million years ago`
  if (year < 0) return `${Math.abs(year).toLocaleString('en-US')} BCE`
  return `${year.toLocaleString('en-US', { useGrouping: false })} CE`
}
