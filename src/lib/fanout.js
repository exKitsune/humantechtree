/** Plan local top/bottom corridors. A source's fan-out stays a contiguous,
 * nested family. Other families can reuse its lanes only over disjoint dates.
 */
export function planCorridors(index, edges, branches, trackSpacing) {
  const rank = new Map(branches.map((b, i) => [b.id, i]))
  const families = new Map()
  for (const edge of edges) {
    const source = index.get(edge.source), target = index.get(edge.target)
    // A single-successor chain can cross skipped dates directly inside its
    // reserved row. Multiple-successor nodes retain nested corridor routing.
    edge.direct = target.rank === source.rank + 1 || (source.outgoing.length === 1
      && source.domain === target.domain && source.row === target.row
      && !branches[rank.get(source.domain)].members.some(n => n.row === source.row && n.rank > source.rank && n.rank < target.rank))
    if (edge.direct) continue
    const direction = rank.get(target.domain) - rank.get(source.domain)
    const branch = branches[rank.get(source.domain)]
    edge.side = direction < 0 ? 'top' : direction > 0 ? 'bottom'
      : source.row < branch.lanes.length / 2 ? 'top' : 'bottom'
    // 'above' describes the arrival direction, not the side of the source.
    edge.above = edge.side === 'top' ? direction < 0 : direction <= 0
    const key = `${source.id}:${edge.side}`
    if (!families.has(key)) families.set(key, { source, side: edge.side, edges: [], start: source.rank, end: target.rank - 1 })
    const family = families.get(key); family.edges.push(edge); family.end = Math.max(family.end, target.rank - 1)
  }
  for (const branch of branches) for (const side of ['top', 'bottom']) {
    const groups = [...families.values()].filter(f => f.source.domain === branch.id && f.side === side)
    groups.sort((a, b) => (side === 'top' ? 1 : -1) * (a.start - b.start)
      || a.source.row - b.source.row || a.source.id.localeCompare(b.source.id))
    const lanes = []
    for (const family of groups) {
      family.edges.sort((a, b) => Number(b.above) - Number(a.above)
        || (a.above ? 1 : -1) * (index.get(a.target).rank - index.get(b.target).rank)
        || rank.get(index.get(a.target).domain) - rank.get(index.get(b.target).domain)
        || index.get(a.target).rowY - index.get(b.target).rowY || a.id.localeCompare(b.id))
      let first = 0
      for (;;) {
        let conflict = -1
        for (let i = 0; i < family.edges.length; i++) {
          if (lanes[first + i]?.some(([start, end]) => start <= family.end && end >= family.start)) { conflict = first + i; break }
        }
        if (conflict < 0) break
        first = conflict + 1
      }
      family.edges.forEach((edge, i) => {
        const lane = first + i
        if (!lanes[lane]) lanes[lane] = []
        lanes[lane].push([family.start, family.end]); edge.busLane = lane
      })
    }
    branch[`${side}Space`] = lanes.length * trackSpacing + 60
  }
}

/** Assign receiving ports by arrival geometry, then outgoing ports by corridor
 * geometry. Parent-array and node-ID ordering must not braid related links.
 */
export function orderFanouts(index, edges, bands, trackSpacing, portSpacing, rankCount) {
  const byBand = new Map(bands.map(b => [b.id, b]))
  for (const edge of edges) if (edge.side) {
    const band = byBand.get(index.get(edge.source).domain)
    edge.busY = edge.side === 'top' ? band.y + 30 + edge.busLane * trackSpacing
      : band.contentBottom + 30 + edge.busLane * trackSpacing
  }
  for (const node of index.values()) {
    node.incoming.sort((a, b) => (a.busY ?? index.get(a.source).y) - (b.busY ?? index.get(b.source).y) || a.id.localeCompare(b.id))
    node.incoming.forEach((edge, i) => {
      const port = { id: edge.targetHandle, type: 'target', x: 0, y: (i + 1) * portSpacing + 6 + node.rank / (rankCount + 1) }
      node.ports.push(port); edge.targetY = node.y + port.y
    })
  }
  for (const node of index.values()) {
    node.outgoing.sort((a, b) => (a.busY ?? a.targetY) - (b.busY ?? b.targetY) || a.id.localeCompare(b.id))
    node.outgoing.forEach((edge, i) => {
      const port = { id: edge.sourceHandle, type: 'source', x: node.width, y: (i + 1) * portSpacing + node.rank / (rankCount + 1) }
      node.ports.push(port); edge.sourceY = node.y + port.y
    })
  }
}

const between = (value, segment) => value > Math.min(segment.from, segment.to) && value < Math.max(segment.from, segment.to)
// Crossings between two vertical-track groups when a is left of b. Their
// entering horizontal legs come from the left; their leaving legs go right.
function crossings(a, b) {
  let score = 0
  for (const x of a) for (const y of b) score += Number(between(x.to, y)) + Number(between(y.from, x))
  return score
}

/** Optimize the order of source families geometrically while preserving the
 * proven nesting order inside each fan-out. Adjacent swaps have a bounded cost.
 */
export function assignFanoutTracks(segments) {
  const families = new Map()
  for (const s of segments) {
    const key = `${s.edge.source}:${s.kind}`
    if (!families.has(key)) families.set(key, [])
    families.get(key).push(s)
  }
  const groups = [...families.values()]
  for (const group of groups) group.sort(compareFamily)
  const center = group => group.reduce((sum, s) => sum + s.from + s.to, 0) / (group.length * 2)
  groups.sort((a, b) => center(a) - center(b) || a[0].id.localeCompare(b[0].id))
  for (let pass = 0; pass < 4; pass++) {
    let changed = false
    for (let i = 0; i + 1 < groups.length; i++) if (crossings(groups[i + 1], groups[i]) < crossings(groups[i], groups[i + 1])) {
      [groups[i], groups[i + 1]] = [groups[i + 1], groups[i]]; changed = true
    }
    if (!changed) break
  }
  let track = 0
  for (const group of groups) for (const segment of group) segment.track = track++
  return track
}

function compareFamily(a, b) {
  if (a.kind === 'exit') {
    const aUp = a.to < a.from, bUp = b.to < b.from
    return Number(bUp) - Number(aUp) || (aUp ? 1 : -1) * (a.from - b.from) || a.id.localeCompare(b.id)
  }
  return Number(b.edge.above) - Number(a.edge.above)
    || (a.edge.above ? 1 : -1) * (a.edge.busY - b.edge.busY) || a.id.localeCompare(b.id)
}
