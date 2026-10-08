const EPSILON = .001

/** Offline diagnostic, not a per-frame operation. Count proper perpendicular
 * intersections between different routed edges, excluding endpoints/overlaps.
 * The pairwise scan is intended for bounded views and the current catalog.
 */
export function measureLayout(layout) {
  const horizontal = [], vertical = [], counts = new Map()
  let routeLength = 0
  for (const edge of layout.edges) {
    counts.set(edge.id, 0)
    for (let i = 1; i < edge.points.length; i++) {
      const a = edge.points[i - 1], b = edge.points[i]
      routeLength += Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
      if (Math.abs(a.y - b.y) < EPSILON && Math.abs(a.x - b.x) > EPSILON)
        horizontal.push({ id: edge.id, x1: Math.min(a.x, b.x), x2: Math.max(a.x, b.x), y: a.y })
      else if (Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) > EPSILON)
        vertical.push({ id: edge.id, x: a.x, y1: Math.min(a.y, b.y), y2: Math.max(a.y, b.y) })
    }
  }
  let properCrossings = 0
  for (const h of horizontal) for (const v of vertical) if (h.id !== v.id
    && v.x > h.x1 + EPSILON && v.x < h.x2 - EPSILON
    && h.y > v.y1 + EPSILON && h.y < v.y2 - EPSILON) {
    properCrossings++
    counts.set(h.id, counts.get(h.id) + 1)
    counts.set(v.id, counts.get(v.id) + 1)
  }
  return {
    nodes: layout.nodes.length, edges: layout.edges.length, properCrossings,
    routeLength: Math.round(routeLength), width: layout.width, height: layout.height,
    canvasArea: layout.width * layout.height,
    mostCrossedEdges: [...counts].filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10)
      .map(([id, crossings]) => ({ id, crossings })),
  }
}