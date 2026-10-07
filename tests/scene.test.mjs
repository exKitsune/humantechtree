import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { layoutGraph, BAND_ORDER } from '../src/lib/layout.js'
import { createScene, planFrame, spatialIndex, hitTest, MAX_CARDS, MAX_MARKS, MAX_EDGES } from '../src/lib/scene.js'
import { multiplyCatalog } from './fixtures.mjs'

const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
const large = multiplyCatalog(nodes, Math.ceil(20000 / nodes.length)).slice(0, 20000)
const start = performance.now()
const layout = await layoutGraph(large)
const arranged = performance.now()
const scene = createScene(layout, large)
const indexed = performance.now()
const fitZoom = Math.min(1100 / layout.width, 700 / layout.height)
const fit = { x: 0, y: 0, zoom: fitZoom }

test('20,000 nodes stay in the ten branch bands with prerequisites advancing right', () => {
  assert.equal(layout.nodes.length, 20000)
  assert.deepEqual(layout.bands.map(b => b.id), BAND_ORDER)
  const bands = new Map(layout.bands.map(b => [b.id, b]))
  for (const n of layout.nodes) {
    const band = bands.get(n.domain)
    assert(n.y >= band.y && n.y + n.height <= band.y + band.height)
  }
  for (const edge of layout.edges) assert(scene.byId.get(edge.source).x < scene.byId.get(edge.target).x)
})

test('overview retains every node in aggregates, without mounting cards or edges', () => {
  for (const level of scene.levels) {
    assert.equal(level.marks.reduce((sum, m) => sum + m.count, 0), 20000)
    for (const mark of level.marks) {
      const era = layout.timeBands.find(era => era.id === mark.era)
      assert(mark.minX >= era.x && mark.maxX <= era.x + era.width)
      assert(mark.cx >= era.x && mark.cx <= era.x + era.width)
    }
  }
  const frame = planFrame(scene, fit, 1200, 800, '0:microscope')
  assert.equal(frame.mode, 'density')
  assert.equal(frame.cards.length, 0)
  assert.equal(frame.edges.length, 0)
  assert(frame.marks.length <= MAX_MARKS)
  assert.equal(frame.marks.reduce((sum, m) => sum + m.count, 0), 20000)
  const mark = frame.marks.find(m => m.count > 1)
  assert(hitTest(scene, frame, { x: mark.cx, y: mark.cy }, fitZoom)?.cluster)
})

test('zoom levels have bounded render work and detail picking remains accurate', () => {
  const node = scene.byId.get('0:microscope')
  for (const zoom of [.015, .1, .3, .9, 1.8]) {
    const viewport = { zoom, x: 600 - (node.x + node.width / 2) * zoom, y: 400 - (node.y + node.height / 2) * zoom }
    const frame = planFrame(scene, viewport, 1200, 800, node.id)
    assert(frame.cards.length <= MAX_CARDS)
    assert(frame.marks.length <= MAX_MARKS)
    assert(frame.edges.length <= MAX_EDGES)
    if (zoom === .9) {
      assert.equal(frame.mode, 'cards')
      assert.equal(hitTest(scene, frame, { x: node.x + node.width / 2, y: node.y + node.height / 2 }, zoom)?.node.id, node.id)
    }
  }
})

test('spatial lookup finds items straddling a viewport and obeys its budget', () => {
  const entries = Array.from({ length: 100 }, (_, i) => ({ id: i, x: i * 20, y: i % 3 * 10, width: 30, height: 20 }))
  const index = spatialIndex(entries)
  const rect = { x: 44, y: 0, width: 200, height: 80 }
  const expected = entries.filter(n => n.x <= 244 && n.x + n.width >= 44)
  assert.deepEqual(index.query(rect).map(n => n.id).sort(), expected.map(n => n.id).sort())
  assert.equal(index.query(rect, 3).length, 3)
})

test('report a repeatable 20,000-node planning benchmark', t => {
  const durations = []
  for (let i = 0; i < 100; i++) {
    const before = performance.now()
    planFrame(scene, { ...fit, x: i * 3 }, 1200, 800, '0:microscope')
    durations.push(performance.now() - before)
  }
  durations.sort((a, b) => a - b)
  t.diagnostic(`20,000 nodes / ${layout.edges.length} edges: layout ${(arranged - start).toFixed(1)} ms; scene preparation ${(indexed - arranged).toFixed(1)} ms; overview planning p95 ${durations[95].toFixed(2)} ms.`)
})
