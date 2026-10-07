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

export function layoutGraph(nodes) {
  const index = new Map(nodes.map(n => [n.id, n]))
  const ranks = new Map()
  const visiting = new Set()
  function rank(id) {
    if (ranks.has(id)) return ranks.get(id)
    if (visiting.has(id)) return 0
    visiting.add(id)
    const ps = index.get(id).parents.filter(p => index.has(p.id))
    const result = ps.length ? Math.max(...ps.map(p => rank(p.id))) + 1 : 0
    visiting.delete(id)
    ranks.set(id, result)
    return result
  }
  const columns = new Map()
  for (const node of nodes) {
    const r = rank(node.id)
    if (!columns.has(r)) columns.set(r, [])
    columns.get(r).push(node)
  }
  const positions = new Map()
  for (const [r, column] of [...columns].sort((a, b) => a[0] - b[0])) {
    const parentY = n => {
      const ys = n.parents.map(p => positions.get(p.id)?.y).filter(y => y !== undefined)
      return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 0
    }
    column.sort((a, b) => parentY(a) - parentY(b) || a.year - b.year || a.title.localeCompare(b.title))
    column.forEach((n, i) => positions.set(n.id, { x: r * 310, y: (i - (column.length - 1) / 2) * 180 }))
  }
  return positions
}

export function matchesFilters(node, domain, era) {
  return (domain === 'all' || node.domain === domain) && node.year >= era.min && node.year < era.max
}

export function searchNodes(nodes, query) {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return []
  const words = normalized.split(/\s+/)
  const score = n => n.title.toLowerCase() === normalized ? 0 : n.title.toLowerCase().startsWith(normalized) ? 1 : 2
  return nodes.filter(n => words.every(word => `${n.title} ${n.wiki} ${n.summary} ${n.domain}`.toLowerCase().includes(word)))
    .sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title))
}
