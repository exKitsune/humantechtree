import { routeIntersectsRect } from './layout.js'

export const MAX_CARDS = 120
export const MAX_MARKS = 1800
export const MAX_EDGES = 700
const intersects = (a, b) => a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y

/** A static bounding-volume tree. Queries stop at their render budget instead
 * of scanning the complete catalog on every wheel event. */
export function spatialIndex(entries) {
  function build(items) {
    if (!items.length) return null
    let x = Infinity, y = Infinity, right = -Infinity, bottom = -Infinity
    for (const item of items) { x = Math.min(x, item.x); y = Math.min(y, item.y); right = Math.max(right, item.x + item.width); bottom = Math.max(bottom, item.y + item.height) }
    const box = { x, y, width: right - x, height: bottom - y }
    if (items.length <= 12) return { ...box, items }
    const axis = box.width > box.height ? 'x' : 'y'
    items.sort((a, b) => a[axis] - b[axis])
    const half = items.length >> 1
    return { ...box, left: build(items.slice(0, half)), right: build(items.slice(half)) }
  }
  const root = build([...entries])
  return {
    query(rect, limit = Infinity) {
      const found = []
      function visit(branch) {
        if (!branch || found.length >= limit || !intersects(branch, rect)) return
        if (branch.items) {
          for (const item of branch.items) {
            if (intersects(item, rect)) found.push(item)
            if (found.length >= limit) break
          }
        } else { visit(branch.left); visit(branch.right) }
      }
      visit(root)
      return found
    },
  }
}

export function createScene(layout, items) {
  const entries = new Map(items.map(n => [n.id, n]))
  const nodes = layout.nodes.map(n => ({ ...n, entry: entries.get(n.id) }))
  const byId = new Map(nodes.map(n => [n.id, n]))
  const incident = new Map()
  const edges = layout.edges.map(e => {
    for (const id of [e.source, e.target]) { if (!incident.has(id)) incident.set(id, []); incident.get(id).push(e) }
    const xs = e.points.map(p => p.x), ys = e.points.map(p => p.y)
    const x = Math.min(...xs), y = Math.min(...ys)
    return { ...e, x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
  })
  // Build aggregate levels once per layout, never during a pan/zoom frame.
  // Keep domains distinct even when a cell straddles two branch boundaries.
  const levels = []
  const bands = new Map(layout.bands.map(b => [b.id, b]))
  const eras = layout.timeBands?.length ? layout.timeBands : [{ id: 'all', x: 0, width: layout.width, min: -Infinity, max: Infinity }]
  const nodeEras = new Map(nodes.map(n => [n.id, eras.find(era => n.entry.year >= era.min && n.entry.year < era.max)]))
  for (let size = 512; size < Math.max(layout.width, layout.height) * 2; size *= 2) {
    const bins = new Map()
    for (const n of nodes) {
      const cx = n.x + n.width / 2, cy = n.y + n.height / 2
      const band = bands.get(n.domain)
      const era = nodeEras.get(n.id)
      const x = era.x + Math.floor((cx - era.x) / size) * size, y = band.y + Math.floor((cy - band.y) / size) * size
      const key = `${n.domain}:${era.id}:${x}:${y}`
      if (!bins.has(key)) bins.set(key, { id: key, domain: n.domain, era: era.id, x, y, width: Math.min(size, era.x + era.width - x), height: size, count: 0,
        minX: n.x, minY: n.y, maxX: n.x + n.width, maxY: n.y + n.height })
      const b = bins.get(key)
      b.count++
      b.minX = Math.min(b.minX, n.x); b.minY = Math.min(b.minY, n.y); b.maxX = Math.max(b.maxX, n.x + n.width); b.maxY = Math.max(b.maxY, n.y + n.height)
    }
    const marks = [...bins.values()].map(b => {
      const band = bands.get(b.domain)
      return { ...b, cx: b.x + b.width / 2, cellWidth: b.width,
        cy: b.y + Math.min(size, band.y + band.height - b.y) / 2,
        cellHeight: Math.min(size, band.y + band.height - b.y) }
    })
    levels.push({ size, marks, index: spatialIndex(marks) })
  }
  return { layout, nodes, byId, incident, nodeIndex: spatialIndex(nodes), edgeIndex: spatialIndex(edges), levels }
}

export function planFrame(scene, viewport, width, height, selected) {
  const zoom = viewport.zoom
  const rect = { x: (-viewport.x - 30) / zoom, y: (-viewport.y - 30) / zoom, width: (width + 60) / zoom, height: (height + 60) / zoom }
  let mode = zoom >= .55 ? 'cards' : zoom >= .075 ? 'nodes' : 'density'
  let marks = mode === 'density' ? [] : scene.nodeIndex.query(rect, MAX_MARKS + 1)
  if (mode === 'cards' && marks.length > MAX_CARDS) mode = 'nodes'
  if (marks.length > MAX_MARKS) mode = 'density'
  if (mode === 'density') {
    const start = Math.max(0, scene.levels.findIndex(level => level.size * zoom >= 36))
    for (let i = start; i < scene.levels.length; i++) {
      marks = scene.levels[i].index.query(rect, MAX_MARKS + 1)
      if (marks.length <= MAX_MARKS) break
    }
  }
  const active = []
  if (mode !== 'density') for (const e of scene.incident.get(selected) ?? []) {
    if (routeIntersectsRect(e.points, rect)) active.push(e)
    if (active.length > MAX_EDGES) break
  }
  let edges = zoom >= .25 ? scene.edgeIndex.query(rect, MAX_EDGES + 1) : []
  const selectedOnly = zoom < .25 || edges.length > MAX_EDGES
  edges = mode === 'density' ? [] : selectedOnly ? active : edges.filter(e => routeIntersectsRect(e.points, rect) && e.source !== selected && e.target !== selected).concat(active)
  const edgeLimited = edges.length > MAX_EDGES
  return { mode, marks, cards: mode === 'cards' ? marks : [], edges: edges.slice(0, MAX_EDGES), selectedOnly, edgeLimited, rect }
}

export function hitTest(scene, frame, point, zoom) {
  if (frame.mode === 'density') {
    let best, distance = Infinity
    for (const mark of frame.marks) {
      const d = Math.hypot(mark.cx - point.x, mark.cy - point.y) * zoom
      if (d < 18 && d < distance) { best = mark; distance = d }
    }
    return best ? { cluster: best } : null
  }
  const radius = Math.max(5, 8 / zoom)
  const matches = scene.nodeIndex.query({ x: point.x - radius, y: point.y - radius, width: radius * 2, height: radius * 2 })
  matches.sort((a, b) => Math.hypot(a.x + a.width / 2 - point.x, a.y + a.height / 2 - point.y) - Math.hypot(b.x + b.width / 2 - point.x, b.y + b.height / 2 - point.y))
  return matches[0] ? { node: matches[0] } : null
}
