import { categoryGroups } from './categories.js'

/** Pack chains within named categories, then stack categories inside the branch.
 * Bounds depend only on visible members. Categories add no edges or fake nodes.
 */
export function placeBranchRows(index, bandIds) {
  return bandIds.map(domain => {
    const members = [...index.values()].filter(n => n.domain === domain)
    const groups = categoryGroups(members)
    const categorized = groups.some(group => group.category)
    if (!categorized) return { id: domain, members, ...placeRows(index, members), categories: [] }
    const lanes = [], regions = []
    let y = 0
    for (const group of groups) {
      const packed = placeRows(index, group.nodes), rowOffset = lanes.length
      for (const n of group.nodes) { n.row += rowOffset; n.rowY += y + 44 }
      lanes.push(...packed.lanes.map(lane => ({ ...lane, y: lane.y + y + 44 })))
      const height = packed.contentHeight + 80
      regions.push({ id: group.id, category: group.category, y, height, count: group.nodes.length })
      y += height + 40
    }
    return { id: domain, members, lanes, categories: regions, contentHeight: y - 40 }
  })
}

// A chain reserves its whole date interval so unrelated milestones cannot
// interrupt it. All independent prerequisites remain in the rendered graph.
function placeRows(index, members) {
  const memberIds = new Set(members.map(n => n.id))
  const priority = { foundation: 0, enabler: 1, influence: 2 }
  const candidates = members.flatMap(n => n.outgoing).filter(e => memberIds.has(e.target))
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
  return { lanes, contentHeight: Math.max(0, y - 100) }
}
