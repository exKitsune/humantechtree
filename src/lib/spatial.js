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

/** Fast obstacle lookup for layout cards: column intervals and row intervals
 * are disjoint, and cards within each are sorted on the other axis. A narrow
 * empty column gap can be rejected without traversing every crossed branch.
 */
export function cardIndex(nodes) {
  const lower = (items, value, key) => {
    let lo = 0, hi = items.length
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (key(items[mid]) < value) lo = mid + 1; else hi = mid }
    return lo
  }
  const upper = (items, value, key) => {
    let lo = 0, hi = items.length
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (key(items[mid]) <= value) lo = mid + 1; else hi = mid }
    return lo
  }
  const axes = ['x', 'y'].map((axis, i) => {
    const size = i ? 'height' : 'width', other = i ? 'x' : 'y', otherSize = i ? 'width' : 'height'
    const groups = new Map()
    for (const node of nodes) {
      if (!groups.has(node[axis])) groups.set(node[axis], { start: node[axis], end: node[axis], nodes: [] })
      const group = groups.get(node[axis]); group.end = Math.max(group.end, node[axis] + node[size]); group.nodes.push(node)
    }
    const ordered = [...groups.values()].sort((a, b) => a.start - b.start)
    for (const group of ordered) group.nodes.sort((a, b) => a[other] - b[other])
    return { axis, size, other, otherSize, groups: ordered }
  })
  return { query(rect) {
    const ranges = axes.map(axis => ({ ...axis,
      start: lower(axis.groups, rect[axis.axis], g => g.end),
      end: upper(axis.groups, rect[axis.axis] + rect[axis.size], g => g.start),
    }))
    const chosen = ranges[0].end - ranges[0].start <= ranges[1].end - ranges[1].start ? ranges[0] : ranges[1]
    const found = [], { other, otherSize } = chosen
    for (let i = chosen.start; i < chosen.end; i++) {
      const items = chosen.groups[i].nodes
      const first = lower(items, rect[other], n => n[other] + n[otherSize])
      for (let j = first; j < items.length && items[j][other] <= rect[other] + rect[otherSize]; j++) {
        if (intersects(items[j], rect)) found.push(items[j])
      }
    }
    return found
  } }
}