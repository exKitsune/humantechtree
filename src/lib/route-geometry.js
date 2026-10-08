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