export const box = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) })
export const curveBounds = curve => box(curve.from, curve.to)
export function boxDistance(a, b) {
  const dx = Math.max(0, a.x - b.x - b.width, b.x - a.x - a.width)
  const dy = Math.max(0, a.y - b.y - b.height, b.y - a.y - a.height)
  return Math.hypot(dx, dy)
}

// A curve stays inside its control rectangle. Checking this entire envelope
// gives conservative clearance without relying on sampled curve collisions.
export function routeEnvelopes(edge) {
  if (edge.curve) return [box(edge.points[0], edge.curve.from), curveBounds(edge.curve), box(edge.curve.to, edge.points.at(-1))]
  return edge.points.slice(1).map((p, i) => box(edge.points[i], p))
}

export function traceRoute(ctx, edge, sx, sy) {
  const points = edge.points
  ctx.beginPath(); ctx.moveTo(sx(points[0].x), sy(points[0].y))
  if (edge.curve) {
    const { from, to } = edge.curve, mid = (from.x + to.x) / 2
    ctx.lineTo(sx(from.x), sy(from.y))
    ctx.bezierCurveTo(sx(mid), sy(from.y), sx(mid), sy(to.y), sx(to.x), sy(to.y))
    ctx.lineTo(sx(points.at(-1).x), sy(points.at(-1).y))
  } else for (let i = 1; i < points.length; i++) ctx.lineTo(sx(points[i].x), sy(points[i].y))
}

/** Diagnostic approximation only. Rendering uses the cubic; safety checks use
 * its whole envelope, never these samples. */
export function sampleRoute(edge, steps = 24) {
  if (!edge.curve) return edge.points
  const { from, to } = edge.curve, mid = (from.x + to.x) / 2
  const points = [edge.points[0], from]
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, u = 1 - t
    points.push({ x: u ** 3 * from.x + 3 * u * t * mid + t ** 3 * to.x,
      y: (u ** 3 + 3 * u * u * t) * from.y + (3 * u * t * t + t ** 3) * to.y })
  }
  points.push(edge.points.at(-1))
  return points
}
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
function segmentDistance(point, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy
  const t = length ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length)) : 0
  return Math.hypot(point.x - a.x - t * dx, point.y - a.y - t * dy)
}

/** Pointer picking follows the painted cubic, not its orthogonal skeleton.
 * Subdivide only near the pointer, to a quarter screen pixel of flatness. */
export function distanceToRoute(edge, point, zoom, maximum = Infinity) {
  let best = Infinity
  const line = (a, b) => { best = Math.min(best, segmentDistance(point, a, b)) }
  if (!edge.curve) {
    for (let i = 1; i < edge.points.length; i++) line(edge.points[i - 1], edge.points[i])
    return best
  }
  const { from, to } = edge.curve, mid = (from.x + to.x) / 2
  line(edge.points[0], from); line(to, edge.points.at(-1))
  const tolerance = .25 / zoom
  function visit(a, b, c, d, depth) {
    const left = Math.min(a.x, b.x, c.x, d.x), right = Math.max(a.x, b.x, c.x, d.x)
    const top = Math.min(a.y, b.y, c.y, d.y), bottom = Math.max(a.y, b.y, c.y, d.y)
    if (Math.hypot(Math.max(0, left - point.x, point.x - right), Math.max(0, top - point.y, point.y - bottom)) > Math.min(best, maximum)) return
    if (depth >= 16 || Math.max(segmentDistance(b, a, d), segmentDistance(c, a, d)) <= tolerance) { line(a, d); return }
    const ab = midpoint(a, b), bc = midpoint(b, c), cd = midpoint(c, d)
    const abc = midpoint(ab, bc), bcd = midpoint(bc, cd), center = midpoint(abc, bcd)
    visit(a, ab, abc, center, depth + 1); visit(center, bcd, cd, d, depth + 1)
  }
  visit(from, { x: mid, y: from.y }, { x: mid, y: to.y }, to, 0)
  return best
}