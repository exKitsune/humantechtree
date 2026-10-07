// Shared by the filters and worker. Width describes occupied space, not time.
export const TIME_ERAS = [
  { id: 'prehistory', label: 'Prehistory', min: -Infinity, max: -3500 },
  { id: 'ancient', label: 'Ancient', min: -3500, max: 500 },
  { id: 'medieval', label: 'Medieval', min: 500, max: 1450 },
  { id: 'early-modern', label: 'Early modern', min: 1450, max: 1750 },
  { id: 'industrial', label: 'Industrial', min: 1750, max: 1900 },
  { id: 'modern', label: 'Modern', min: 1900, max: Infinity },
]
export const PERIOD_CAPACITY = 24
export const COLUMN_CAPACITY = 6
const date = year => `${Math.abs(year).toLocaleString('en-US', { useGrouping: year < 0 })}${year < 0 ? ' BCE' : ' CE'}`
export function periodLabel(start, end) {
  if (start === 0 && end > 0) start = 1 // Historical CE notation has no year zero.
  if (start === end) return date(start)
  if (start > 0 && start % 10 === 0 && end === start + 9) return `${start}s`
  if (start < 0 && end < 0) return `${Math.abs(start).toLocaleString('en-US')}–${date(end)}`
  if (start > 0) return `${start}–${date(end)}`
  return `${date(start)}–${date(end)}`
}

/** Populated centuries split into decades, then years. Empty periods need no
 * columns. Crowded single years gain columns instead of ever smaller dates.
 * Input is the displayed graph, never the whole hidden catalog.
 */
export function assignTimeColumns(index, topologicalOrder) {
  const order = new Map(topologicalOrder.map((n, i) => [n.id, i]))
  const result = []
  let nextColumn = 0
  for (const era of TIME_ERAS) {
    const members = [...index.values()].filter(n => n.year >= era.min && n.year < era.max)
    if (!members.length) continue
    members.sort((a, b) => a.year - b.year || order.get(a.id) - order.get(b.id))
    const subdivisions = []
    function split(items, step) {
      const groups = new Map()
      for (const n of items) {
        const start = Math.floor(n.year / step) * step
        if (!groups.has(start)) groups.set(start, [])
        groups.get(start).push(n)
      }
      for (const [start, group] of groups) {
        if (group.length > PERIOD_CAPACITY && step > 1) { split(group, step / 10); continue }
        const firstColumn = nextColumn, occupied = new Map()
        for (const n of group) {
          let column = firstColumn
          for (const e of n.incoming) column = Math.max(column, index.get(e.source).rank + 1)
          while ((occupied.get(`${n.domain}:${column}`) ?? 0) >= COLUMN_CAPACITY) column++
          n.rank = column
          const key = `${n.domain}:${column}`
          occupied.set(key, (occupied.get(key) ?? 0) + 1)
          nextColumn = Math.max(nextColumn, column + 1)
        }
        const min = Math.max(era.min, start), max = Math.min(era.max - 1, start + step - 1)
        subdivisions.push({ id: `${era.id}:${min}:${max}`, label: periodLabel(min, max), min, max,
          count: group.length, firstColumn, endColumn: nextColumn })
      }
    }
    const span = Math.max(1, members.at(-1).year - members[0].year)
    split(members, 10 ** Math.floor(Math.log10(span)))
    result.push({ ...era, count: members.length, subdivisions })
  }
  return { periods: result, rankCount: nextColumn }
}

export function placeTimeBands(periods, boundaries) {
  return periods.map(era => {
    const subdivisions = era.subdivisions.map(({ firstColumn, endColumn, ...period }) => ({
      ...period, x: boundaries[firstColumn], width: boundaries[endColumn] - boundaries[firstColumn],
    }))
    const x = subdivisions[0].x, last = subdivisions.at(-1)
    return { ...era, x, width: last.x + last.width - x, subdivisions }
  })
}
