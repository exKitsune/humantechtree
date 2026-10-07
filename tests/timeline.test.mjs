import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { layoutGraph } from '../src/lib/layout.js'
import { TIME_ERAS, PERIOD_CAPACITY, COLUMN_CAPACITY } from '../src/lib/timeline.js'
import { contentExtent, clampViewport, PAN_MARGIN } from '../src/lib/viewport.js'

const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
const node = (id, year, parents = []) => ({ id, year, domain: 'science', parents: parents.map(id => ({ id, type: 'foundation' })) })

test('every capability fits its era and adaptive date subdivision', async () => {
  const layout = await layoutGraph(nodes), placed = new Map(layout.nodes.map(n => [n.id, n]))
  assert.equal(layout.timeBands.reduce((n, era) => n + era.count, 0), nodes.length)
  for (const era of layout.timeBands) {
    assert.equal(era.count, era.subdivisions.reduce((n, period) => n + period.count, 0))
    for (const period of era.subdivisions) assert(period.count <= PERIOD_CAPACITY || period.min === period.max)
  }
  for (const item of nodes) {
    const era = layout.timeBands.find(e => item.year >= e.min && item.year < e.max)
    const period = era.subdivisions.find(p => item.year >= p.min && item.year <= p.max)
    const n = placed.get(item.id)
    assert(n.x >= period.x && n.x + n.width <= period.x + period.width, `${item.id} is outside its date band`)
  }
  const occupancy = new Map()
  for (const n of layout.nodes) { const key = `${n.domain}:${n.rank}`; occupancy.set(key, (occupancy.get(key) ?? 0) + 1) }
  assert([...occupancy.values()].every(count => count <= COLUMN_CAPACITY))
})

test('new population splits decades into years and crowded years expand horizontally', async () => {
  const sparse = [node('a', 1901), node('b', 1909), node('c', 1999)]
  const before = await layoutGraph(sparse)
  const more = [...sparse, ...Array.from({ length: 40 }, (_, i) => node(`new-${i}`, 1901 + i % 9))]
  const after = await layoutGraph(more)
  assert(before.timeBands[0].subdivisions.some(p => p.min === 1900 && p.max === 1909))
  assert(after.timeBands[0].subdivisions.some(p => p.min === 1901 && p.max === 1901))
  const sameYear = Array.from({ length: 100 }, (_, i) => node(`same-${i}`, 1910))
  const crowded = await layoutGraph(sameYear)
  assert.equal(crowded.timeBands[0].subdivisions.length, 1)
  assert.equal(new Set(crowded.nodes.map(n => n.x)).size, Math.ceil(100 / COLUMN_CAPACITY))
  assert(crowded.width > before.width)
  assert.deepEqual(await layoutGraph([...more].reverse()), after)
  assert.deepEqual(await layoutGraph(sparse), before, 'Filtering back removes unused date columns')
})

test('era boundaries, same-year dependencies and future eras remain well defined', async () => {
  const boundaryNodes = TIME_ERAS.filter(e => Number.isFinite(e.min)).map(e => node(e.id, e.min))
  const layout = await layoutGraph([...boundaryNodes, node('future', 2125), node('future-child', 2125, ['future'])])
  for (const n of boundaryNodes) assert(layout.timeBands.find(e => e.id === n.id).subdivisions.some(p => n.year >= p.min && n.year <= p.max))
  const parent = layout.nodes.find(n => n.id === 'future'), child = layout.nodes.find(n => n.id === 'future-child')
  assert(parent.x + parent.width < child.x)
  await assert.rejects(layoutGraph([node('later', 2000), node('earlier', 1900, ['later'])]), /later than/)
})

test('pan limits contain all cards and detours with a margin', async () => {
  const layout = await layoutGraph(nodes), extent = contentExtent(layout)
  const [[left, top], [right, bottom]] = extent
  for (const n of layout.nodes) {
    assert(n.x >= left + PAN_MARGIN && n.y >= top + PAN_MARGIN)
    assert(n.x + n.width <= right - PAN_MARGIN && n.y + n.height <= bottom - PAN_MARGIN)
  }
  for (const e of layout.edges) for (const p of e.points) assert(p.x >= left + PAN_MARGIN && p.x <= right - PAN_MARGIN && p.y >= top + PAN_MARGIN && p.y <= bottom - PAN_MARGIN)
  for (const x of [-1e9, 1e9]) for (const y of [-1e9, 1e9]) {
    const v = clampViewport({ x, y, zoom: .9 }, 1200, 800, extent)
    assert(v.x >= 1200 - right * .9 && v.x <= -left * .9)
    assert(v.y >= 800 - bottom * .9 && v.y <= -top * .9)
    assert.deepEqual(clampViewport(v, 1200, 800, extent), v)
  }
  const singleExtent = contentExtent(await layoutGraph([node('one', 1800)]))
  const a = clampViewport({ x: -1e9, y: 1e9, zoom: .1 }, 1200, 800, singleExtent)
  const b = clampViewport({ x: 1e9, y: -1e9, zoom: .1 }, 1200, 800, singleExtent)
  assert.deepEqual(a, b, 'Views larger than their content must center instead of drifting')
})
