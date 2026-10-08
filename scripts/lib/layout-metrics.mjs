import { sampleRoute } from '../../src/lib/route-geometry.js'
const EPSILON = .001

/** Offline diagnostic, not a per-frame operation. Curves use 24 chord samples;
 * crossing counts and lengths are approximate when curves are present. */
export function measureLayout(layout) {
  const segments = [], counts = new Map()
  let routeLength = 0
  for (const edge of layout.edges) {
    counts.set(edge.id, 0)
    const points = sampleRoute(edge)
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], length = Math.hypot(b.x - a.x, b.y - a.y)
      routeLength += length
      if (length > EPSILON) segments.push({ id: edge.id, a, b,
        left: Math.min(a.x, b.x), right: Math.max(a.x, b.x), top: Math.min(a.y, b.y), bottom: Math.max(a.y, b.y) })
    }
  }
  segments.sort((a, b) => a.left - b.left)
  let properCrossings = 0
  const cross = (x, y, u, v) => x * v - y * u
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i], dx = s.b.x - s.a.x, dy = s.b.y - s.a.y
    for (let j = i + 1; j < segments.length && segments[j].left <= s.right; j++) {
      const t = segments[j]
      if (s.id === t.id || t.top > s.bottom || t.bottom < s.top) continue
      const ex = t.b.x - t.a.x, ey = t.b.y - t.a.y, det = cross(dx, dy, ex, ey)
      if (Math.abs(det) < EPSILON) continue
      const rx = t.a.x - s.a.x, ry = t.a.y - s.a.y
      const u = cross(rx, ry, ex, ey) / det, v = cross(rx, ry, dx, dy) / det
      // Distances from segment ends preserve the former .001 world-unit rule.
      if (u <= 0 || u >= 1 || v <= 0 || v >= 1
        || Math.min(u, 1 - u) * Math.hypot(dx, dy) <= EPSILON
        || Math.min(v, 1 - v) * Math.hypot(ex, ey) <= EPSILON) continue
      properCrossings++
      counts.set(s.id, counts.get(s.id) + 1); counts.set(t.id, counts.get(t.id) + 1)
    }
  }
  const curves = layout.edges.filter(e => e.curve).length
  return {
    nodes: layout.nodes.length, edges: layout.edges.length, properCrossings,
    curveSamples: curves ? 24 : 0,
    straightLinks: layout.edges.filter(e => e.points.length === 2).length, curves,
    routeLength: Math.round(routeLength), width: layout.width, height: layout.height,
    canvasArea: layout.width * layout.height,
    mostCrossedEdges: [...counts].filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10)
      .map(([id, crossings]) => ({ id, crossings })),
  }
}