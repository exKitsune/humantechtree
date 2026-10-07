/** Find a shortest alternative route without treating mixed relationship
 * types as logical equivalence. It is evidence for editorial review only. */
export function alternativePath(index, source, target) {
  const queue = [], next = new Map(), seen = new Set([target])
  for (const p of [...(index.get(target)?.parents ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
    if (p.id === source || seen.has(p.id)) continue
    seen.add(p.id); next.set(p.id, target); queue.push(p.id)
  }
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i]
    for (const p of [...(index.get(current)?.parents ?? [])].sort((a, b) => a.id.localeCompare(b.id))) {
      if (seen.has(p.id)) continue
      seen.add(p.id); next.set(p.id, current)
      if (p.id === source) {
        const path = [source]
        while (path.at(-1) !== target) path.push(next.get(path.at(-1)))
        return path
      }
      queue.push(p.id)
    }
  }
  return null
}

export const MILESTONE_REVIEW_GAP = 100
const observation = /\b(observation|discovery|isolation|recognition)\b/i
export function auditConnections(nodes) {
  const index = new Map(nodes.map(n => [n.id, n])), candidates = [], retained = []
  for (const target of [...nodes].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const edge of [...target.parents].sort((a, b) => a.id.localeCompare(b.id))) {
      const source = index.get(edge.id)
      if (!source) continue // Structural validation reports missing references.
      const path = alternativePath(index, source.id, target.id)
      const gap = target.year - source.year
      const milestone = source.kind === 'discovery' && observation.test(source.title) && gap >= MILESTONE_REVIEW_GAP
      if (!path && !milestone) continue
      const reasons = []
      if (path) reasons.push('alternate-path')
      if (milestone) reasons.push('remote-observation')
      const record = { source: source.id, target: target.id, type: edge.type, reason: edge.reason, flags: reasons,
        ...(path ? { path, pathTypes: path.slice(1).map((id, i) => index.get(id).parents.find(p => p.id === path[i]).type) } : {}),
        ...(milestone ? { gapYears: gap, sourceTitle: source.title } : {}) }
      if (typeof edge.directContribution === 'string' && edge.directContribution.trim().length >= 30) {
        retained.push({ ...record, directContribution: edge.directContribution })
      } else candidates.push(record)
    }
  }
  return { candidates, retained }
}
