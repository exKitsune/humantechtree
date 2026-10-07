export const PAN_MARGIN = 240
// Include routed detours so a hard stop never clips a link.
export function contentExtent(layout, margin = PAN_MARGIN) {
  if (!layout.nodes.length) return [[-margin, -margin], [margin, margin]]
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
  const include = (x, y) => { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y) }
  for (const n of layout.nodes) { include(n.x, n.y); include(n.x + n.width, n.y + n.height) }
  for (const e of layout.edges) for (const p of e.points) include(p.x, p.y)
  return [[left - margin, top - margin], [right + margin, bottom + margin]]
}
// Match the gesture engine's constraint, including centered small graphs.
// Apply to commands too: setViewport itself does not honor translateExtent.
export function clampViewport(viewport, width, height, extent) {
  const [[left, top], [right, bottom]] = extent, z = viewport.zoom
  const clamp = (value, size, min, max) => (max - min) * z <= size
    ? (size - (min + max) * z) / 2
    : Math.max(size - max * z, Math.min(-min * z, value))
  return { ...viewport, x: clamp(viewport.x, width, left, right), y: clamp(viewport.y, height, top, bottom) }
}
