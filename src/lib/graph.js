import { categoryFor } from './categories.js'

// Framework-independent graph operations, also used by data validation tests.
export function neighborhood(nodes, id, depth = 2) {
  const index = new Map(nodes.map(n => [n.id, n]))
  if (!index.has(id)) return []
  const children = new Map()
  for (const n of nodes) for (const p of n.parents) {
    if (!children.has(p.id)) children.set(p.id, [])
    children.get(p.id).push(n.id)
  }
  const seen = new Set([id])
  // Keep upstream/downstream searches separate: a popular root must not pull
  // every sibling into a focused view.
  for (const direction of ['up', 'down']) {
    let frontier = [id]
    for (let level = 0; level < depth; level++) {
      const next = new Set()
      for (const current of frontier) {
        const adjacent = direction === 'up'
          ? (index.get(current)?.parents.map(p => p.id) ?? [])
          : (children.get(current) ?? [])
        for (const neighbor of adjacent) if (index.has(neighbor)) {
          seen.add(neighbor)
          next.add(neighbor)
        }
      }
      frontier = [...next]
    }
  }
  return nodes.filter(n => seen.has(n.id))
}

export function matchesFilters(node, domain, era, category = 'all') {
  return (domain === 'all' || node.domain === domain) && (category === 'all' || node.category === category) && node.year >= era.min && node.year < era.max
}

export function searchNodes(nodes, query) {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return []
  const words = normalized.split(/\s+/)
  const score = n => n.title.toLowerCase() === normalized ? 0 : n.title.toLowerCase().startsWith(normalized) ? 1 : 2
  return nodes.filter(n => words.every(word => `${n.title} ${n.wiki} ${n.summary} ${n.domain} ${categoryFor(n)?.label ?? ''}`.toLowerCase().includes(word)))
    .sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title))
}
