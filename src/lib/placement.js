/** Keep a connected chain on one row across date columns. Reserving the whole
 * chain interval prevents unrelated milestones from occupying its empty dates.
 * This is visual alignment only; every authored relationship is retained.
 */
export function placeBranchRows(index, bandIds) {
  const result = []
  const priority = { foundation: 0, enabler: 1, influence: 2 }
  for (const domain of bandIds) {
    const members = [...index.values()].filter(n => n.domain === domain)
    const candidates = members.flatMap(n => n.outgoing).filter(e => index.get(e.target).domain === domain)
    candidates.sort((a, b) => {
      const span = e => index.get(e.target).rank - index.get(e.source).rank
      return span(a) - span(b) || priority[a.type] - priority[b.type] || a.source.localeCompare(b.source) || a.target.localeCompare(b.target)
    })
    const next = new Map(), previous = new Set()
    for (const e of candidates) if (!next.has(e.source) && !previous.has(e.target)) {
      next.set(e.source, e.target); previous.add(e.target)
    }
    const paths = [], pathOf = new Map()
    for (const root of members.filter(n => !previous.has(n.id))) {
      const path = { id: root.id, nodes: [], start: root.rank, end: root.rank, lane: -1 }
      for (let n = root; n; n = index.get(next.get(n.id))) {
        path.nodes.push(n); path.end = n.rank; pathOf.set(n.id, path)
      }
      paths.push(path)
    }
    paths.sort((a, b) => a.start - b.start || b.nodes.length - a.nodes.length || b.end - a.end || a.id.localeCompare(b.id))
    const lanes = []
    for (const path of paths) {
      const neighbors = path.nodes.flatMap(n => n.incoming.map(e => pathOf.get(e.source)))
        .filter(p => p && p !== path && p.lane >= 0).map(p => p.lane).sort((a, b) => a - b)
      const preferred = neighbors.length ? neighbors[Math.floor(neighbors.length / 2)] : 0
      let best = -1
      for (let i = 0; i < lanes.length; i++) if (lanes[i].end < path.start
        && (best < 0 || Math.abs(i - preferred) < Math.abs(best - preferred))) best = i
      if (best < 0) { best = lanes.length; lanes.push({ end: -1, height: 0 }) }
      path.lane = best; lanes[best].end = path.end
      for (const n of path.nodes) { n.row = best; lanes[best].height = Math.max(lanes[best].height, n.height) }
    }
    let y = 0
    for (const lane of lanes) { lane.y = y; y += lane.height + 100 }
    for (const n of members) n.rowY = lanes[n.row].y
    result.push({ id: domain, members, lanes, contentHeight: Math.max(0, y - 100) })
  }
  return result
}
