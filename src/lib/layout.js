import { orderFanouts, assignFanoutTracks } from './fanout.js'
import { assignTimeColumns, placeTimeBands } from './timeline.js'

export const NODE_WIDTH = 204
export const MIN_NODE_HEIGHT = 144
const PORT_SPACING = 12
const TRACK_SPACING = 26
export const BAND_ORDER = ['engineering', 'materials', 'energy', 'science', 'medicine', 'information', 'transport', 'food', 'society', 'culture']

export function routeIntersectsRect(points, rect) {
  return points.some((point, i) => {
    if (!i) return false
    const previous = points[i - 1]
    return Math.max(point.x, previous.x) >= rect.x && Math.min(point.x, previous.x) <= rect.x + rect.width
      && Math.max(point.y, previous.y) >= rect.y && Math.min(point.y, previous.y) <= rect.y + rect.height
  })
}

/** Only the displayed nodes determine ranks, band heights, ports and corridors.
 * Cards stay in their branch; dependencies advance left to right. Long links
 * travel in empty band gutters and vertical tracks between columns.
 */
export async function layoutGraph(nodes) {
  if (!nodes.length) return { nodes: [], edges: [], bands: [], timeBands: [], width: 0, height: 0 }
  const ordered = [...nodes].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))
  const index = new Map(ordered.map(n => [n.id, { ...n, rank: -1, children: [], incoming: [], outgoing: [], ports: [] }]))
  const edges = []
  for (const n of index.values()) for (const p of n.parents) {
    const source = index.get(p.id)
    if (!source) continue
    if (source.year > n.year) throw new Error(`Prerequisite is later than its target: ${source.id} → ${n.id}`)
    const edge = { id: `${p.id}--${n.id}`, source: p.id, target: n.id, type: p.type,
      sourceHandle: `${p.id}--${n.id}:out`, targetHandle: `${p.id}--${n.id}:in` }
    edges.push(edge); source.children.push(n); source.outgoing.push(edge); n.incoming.push(edge)
  }
  const degrees = new Map([...index.values()].map(n => [n.id, n.incoming.length]))
  const queue = [...index.values()].filter(n => !degrees.get(n.id))
  for (let i = 0; i < queue.length; i++) for (const child of queue[i].children) {
    degrees.set(child.id, degrees.get(child.id) - 1)
    if (!degrees.get(child.id)) queue.push(child)
  }
  if (queue.length !== nodes.length) throw new Error('Cannot lay out cyclic prerequisites.')
  const { periods, rankCount } = assignTimeColumns(index, queue)
  const present = new Set(ordered.map(n => n.domain))
  const bandIds = [...BAND_ORDER.filter(id => present.has(id)), ...[...present].filter(id => !BAND_ORDER.includes(id)).sort()]
  const bands = []
  let top = 100
  for (const domain of bandIds) {
    const members = [...index.values()].filter(n => n.domain === domain)
    const long = members.flatMap(n => n.outgoing).filter(e => index.get(e.target).rank > index.get(e.source).rank + 1)
    const gutter = long.length * TRACK_SPACING + 80
    let bottom = top + gutter
    const columns = new Map()
    for (const n of members) {
      if (!columns.has(n.rank)) columns.set(n.rank, [])
      columns.get(n.rank).push(n)
    }
    for (const [rank, column] of [...columns].sort((a, b) => a[0] - b[0])) {
      const score = n => {
        const parents = n.incoming.map(e => index.get(e.source)).filter(p => p.domain === domain && p.order !== undefined)
        return parents.length ? parents.reduce((sum, p) => sum + p.order, 0) / parents.length : 0
      }
      column.sort((a, b) => score(a) - score(b) || a.year - b.year || a.id.localeCompare(b.id))
      let y = top + gutter + 60
      column.forEach((n, i) => {
        n.order = i; n.y = y; n.width = NODE_WIDTH
        n.height = Math.max(MIN_NODE_HEIGHT, (Math.max(n.incoming.length, n.outgoing.length) + 1) * PORT_SPACING)
        n.incoming.forEach((edge, j) => {
          const port = { id: edge.targetHandle, type: 'target', x: 0,
            y: (j + 1) * PORT_SPACING + 6 + rank / (rankCount + 1) }
          n.ports.push(port)
          edge.targetY = y + port.y
        })
        y += n.height + 120
      })
      bottom = Math.max(bottom, y)
    }
    bands.push({ id: domain, y: top, height: bottom - top, count: members.length })
    top = bottom + 100
  }
  orderFanouts(index, edges, bands, TRACK_SPACING, PORT_SPACING, rankCount)
  const gaps = Array.from({ length: rankCount }, () => [])
  for (const edge of edges) {
    const source = index.get(edge.source), target = index.get(edge.target)
    const long = target.rank > source.rank + 1
    const segment = (from, to, kind) => ({ from, to, kind, edge, id: `${edge.id}:${kind}` })
    edge.exit = segment(edge.sourceY, long ? edge.busY : edge.targetY, 'exit')
    gaps[source.rank].push(edge.exit)
    if (long) {
      edge.entry = segment(edge.busY, edge.targetY, 'entry')
      gaps[target.rank - 1].push(edge.entry)
    }
  }
  const columnX = []
  let x = 100
  for (const gap of gaps) {
    columnX.push(x)
    const count = assignFanoutTracks(gap)
    for (const segment of gap) segment.x = x + NODE_WIDTH + 60 + segment.track * TRACK_SPACING
    x += NODE_WIDTH + Math.max(260, 120 + count * TRACK_SPACING)
  }
  const placed = [...index.values()].map(n => ({ id: n.id, domain: n.domain, rank: n.rank, x: columnX[n.rank], y: n.y, width: n.width, height: n.height, ports: n.ports }))
  const width = columnX.at(-1) + NODE_WIDTH + 100
  const boundaries = [0, ...columnX.slice(1).map((x, i) => (columnX[i] + NODE_WIDTH + x) / 2), width]
  return {
    width, height: top, bands, timeBands: placeTimeBands(periods, boundaries), nodes: placed,
    edges: edges.map(e => {
      const source = index.get(e.source), target = index.get(e.target)
      const points = [{ x: columnX[source.rank] + NODE_WIDTH, y: e.sourceY }, { x: e.exit.x, y: e.sourceY }]
      if (e.entry) points.push({ x: e.exit.x, y: e.busY }, { x: e.entry.x, y: e.busY }, { x: e.entry.x, y: e.targetY })
      else points.push({ x: e.exit.x, y: e.targetY })
      points.push({ x: columnX[target.rank], y: e.targetY })
      return { id: e.id, source: e.source, target: e.target, type: e.type, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle, points }
    }),
  }
}
