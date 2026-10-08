import { cardIndex } from './spatial.js'
import { box, boxDistance, routeEnvelopes } from './route-geometry.js'

const EPSILON = .001
const CARD_MARGIN = 12
const FAN_CLEARANCE = 4
const PORT_CLEARANCE = 8
const expand = (r, by) => ({ x: r.x - by, y: r.y - by, width: r.width + by * 2, height: r.height + by * 2 })
const overlap = (a, b, c, d) => Math.min(b, d) - Math.max(a, c) > EPSILON
const fitsPort = (node, handle, y) => y >= node.y + 12 && y <= node.y + node.height - 12
  && node.ports.every(p => p.id === handle || p.type !== (handle.endsWith(':out') ? 'source' : 'target') || Math.abs(node.y + p.y - y) >= PORT_CLEARANCE)

function candidates(low, high, preferred, old) {
  const values = [Math.max(low, Math.min(high, preferred)), old]
  for (let step = 1; step <= 4; step++) values.push(preferred + step * 12, preferred - step * 12)
  return [...new Set(values)].filter(y => y >= low && y <= high).sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred) || a - b)
}

// Index collinear runs by their fixed coordinate. A rectangle index of whole
// routes produces too many false candidates for long cross-branch links.
function runIndex(edges) {
  const buckets = [new Map(), new Map()], refs = new Map()
  function runs(edge) {
    return edge.points.slice(1).flatMap((q, i) => {
      const p = edge.points[i], horizontal = Math.abs(p.y - q.y) < EPSILON
      const coord = horizontal ? p.y : p.x, start = horizontal ? Math.min(p.x, q.x) : Math.min(p.y, q.y)
      const end = horizontal ? Math.max(p.x, q.x) : Math.max(p.y, q.y)
      return end - start > EPSILON ? [{ edge, axis: horizontal ? 0 : 1, coord, start, end }] : []
    })
  }
  function update(edge) {
    for (const run of refs.get(edge) ?? []) buckets[run.axis].get(Math.floor(run.coord / EPSILON)).delete(run)
    const added = runs(edge); refs.set(edge, added)
    for (const run of added) {
      const key = Math.floor(run.coord / EPSILON), map = buckets[run.axis]
      if (!map.has(key)) map.set(key, new Set())
      map.get(key).add(run)
    }
  }
  for (const edge of edges) update(edge)
  return { update, overlaps(edge, candidate) {
    for (const run of runs(candidate)) {
      const key = Math.floor(run.coord / EPSILON)
      for (let offset = -1; offset <= 1; offset++) for (const other of buckets[run.axis].get(key + offset) ?? []) {
        if (other.edge !== edge && Math.abs(run.coord - other.coord) < EPSILON && overlap(run.start, run.end, other.start, other.end)) return true
      }
    }
    return false
  } }
}

/** Simplify a safe fallback layout using actual occupied space. Port movement
 * and curves are accepted together, only after testing cards and sibling links.
 * A static card index and a mutable collinear-run index bound the checks.
 */
export function simplifyRoutes(layout) {
  const nodes = new Map(layout.nodes.map(n => [n.id, n]))
  const cards = cardIndex(layout.nodes)
  const families = new Map()
  const runs = runIndex(layout.edges), protectedRoutes = new Map()
  for (const edge of layout.edges) {
    if (!families.has(edge.source)) families.set(edge.source, [])
    families.get(edge.source).push(edge)
    protectedRoutes.set(edge, routeEnvelopes(edge))
  }
  const ordered = [...layout.edges].sort((a, b) => {
    const span = e => nodes.get(e.target).rank - nodes.get(e.source).rank
    return span(a) - span(b) || a.id.localeCompare(b.id)
  })
  const obstacles = (rect, edge) => cards.query(rect).filter(n => n.id !== edge.source && n.id !== edge.target)
  function safe(edge, candidate) {
    const envelopes = routeEnvelopes(candidate)
    if (envelopes.some(r => obstacles(expand(r, CARD_MARGIN), edge).length)) return false
    for (const other of families.get(edge.source)) if (other !== edge) {
      const theirs = protectedRoutes.get(other)
      if (envelopes.some(a => theirs.some(b => boxDistance(a, b) < FAN_CLEARANCE))) return false
    }
    return !runs.overlaps(edge, candidate)
  }
  function accept(edge, candidate) {
    edge.points = candidate.points
    if (candidate.curve) edge.curve = candidate.curve
    else delete edge.curve
    runs.update(edge); protectedRoutes.set(edge, routeEnvelopes(edge))
    nodes.get(edge.source).ports.find(p => p.id === edge.sourceHandle).y = edge.points[0].y - nodes.get(edge.source).y
    nodes.get(edge.target).ports.find(p => p.id === edge.targetHandle).y = edge.points.at(-1).y - nodes.get(edge.target).y
  }
  // Align facing ports before trying curves. A clear long link is just as
  // eligible as an adjacent-column link, including one child of a large hub.
  for (const edge of ordered) {
    const source = nodes.get(edge.source), target = nodes.get(edge.target)
    const low = Math.max(source.y, target.y) + 12, high = Math.min(source.y + source.height, target.y + target.height) - 12
    if (low > high) continue
    for (const y of candidates(low, high, (low + high) / 2, edge.points[0].y)) {
      if (!fitsPort(source, edge.sourceHandle, y) || !fitsPort(target, edge.targetHandle, y)) continue
      const candidate = { points: [{ x: source.x + source.width, y }, { x: target.x, y }] }
      if (safe(edge, candidate)) { accept(edge, candidate); break }
    }
  }
  for (const edge of ordered) {
    if (edge.points.length === 2) continue
    const source = nodes.get(edge.source), target = nodes.get(edge.target)
    const sourceYs = candidates(source.y + 12, source.y + source.height - 12, source.y + source.height / 2, edge.points[0].y)
      .filter(y => fitsPort(source, edge.sourceHandle, y)).slice(0, 3)
    const preferredTarget = target.y + target.height / 2 + Math.sign(source.y - target.y) * 12
    const targetYs = candidates(target.y + 12, target.y + target.height - 12, preferredTarget, edge.points.at(-1).y)
      .filter(y => fitsPort(target, edge.targetHandle, y)).slice(0, 3)
    let accepted = false
    for (const y0 of sourceYs) {
      for (const y1 of targetYs) {
        if (Math.abs(y1 - y0) < EPSILON) continue
        const start = { x: source.x + source.width, y: y0 }, end = { x: target.x, y: y1 }
        // First source-row obstruction and last target-row obstruction bound
        // where a single change of height can take place.
        const sourceBlocks = obstacles(expand(box(start, { x: end.x, y: y0 }), CARD_MARGIN), edge)
        const targetBlocks = obstacles(expand(box({ x: start.x, y: y1 }, end), CARD_MARGIN), edge)
        const left = Math.max(start.x + 16, ...targetBlocks.map(n => n.x + n.width + CARD_MARGIN + 1))
        const right = Math.min(end.x - 16, ...sourceBlocks.map(n => n.x - CARD_MARGIN - 1))
        if (right - left < 32) continue
        const blocked = obstacles(expand(box({ x: left, y: y0 }, { x: right, y: y1 }), CARD_MARGIN), edge)
          .map(n => [Math.max(left, n.x - CARD_MARGIN - 1), Math.min(right, n.x + n.width + CARD_MARGIN + 1)])
          .sort((a, b) => a[0] - b[0])
        const spaces = []; let cursor = left
        for (const [a, b] of blocked) { if (a - cursor >= 32) spaces.push([cursor, a]); cursor = Math.max(cursor, b) }
        if (right - cursor >= 32) spaces.push([cursor, right])
        spaces.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]) || b[0] - a[0])
        for (const [a, b] of spaces) {
          const mid = (a + b) / 2, half = Math.min(160, (b - a) / 2)
          const candidate = { points: [start, { x: mid, y: y0 }, { x: mid, y: y1 }, end],
            curve: { from: { x: mid - half, y: y0 }, to: { x: mid + half, y: y1 } } }
          if (safe(edge, candidate)) { accept(edge, candidate); accepted = true; break }
        }
        if (accepted) break
      }
      if (accepted) break
    }
  }
  return layout
}