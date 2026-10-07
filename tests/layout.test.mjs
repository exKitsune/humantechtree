import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { layoutGraph, routeIntersectsRect } from '../src/lib/layout.js'
import { neighborhood, matchesFilters } from '../src/lib/graph.js'

const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
const full = await layoutGraph(nodes)
const epsilon = .001
const close = (a, b) => Math.abs(a - b) < epsilon
const overlap = (a, b, c, d) => Math.min(Math.max(a, b), Math.max(c, d)) - Math.max(Math.min(a, b), Math.min(c, d)) > epsilon

function verifyGeometry(layout, items) {
  const index = new Map(layout.nodes.map(n => [n.id, n]))
  assert.deepEqual([...index.keys()].sort(), items.map(n => n.id).sort())
  assert.equal(layout.edges.length, items.reduce((count, n) => count + n.parents.filter(p => index.has(p.id)).length, 0))
  for (const [i, n] of layout.nodes.entries()) {
    assert([n.x, n.y, n.width, n.height].every(Number.isFinite))
    assert(n.x >= 0 && n.y >= 0 && n.x + n.width <= layout.width && n.y + n.height <= layout.height)
    for (const other of layout.nodes.slice(i + 1)) {
      assert(!(overlap(n.x, n.x + n.width, other.x, other.x + other.width) && overlap(n.y, n.y + n.height, other.y, other.y + other.height)), `${n.id} overlaps ${other.id}`)
    }
  }
  const segments = []
  const usedPorts = new Set()
  for (const edge of layout.edges) {
    for (const [nodeId, handle, point] of [[edge.source, edge.sourceHandle, edge.points[0]], [edge.target, edge.targetHandle, edge.points.at(-1)]]) {
      const node = index.get(nodeId)
      const port = node.ports.find(p => p.id === handle)
      assert(port && !usedPorts.has(handle), `Missing or shared port ${handle}`)
      usedPorts.add(handle)
      assert(close(node.x + port.x, point.x) && close(node.y + port.y, point.y), `Detached route ${edge.id}`)
    }
    for (let i = 1; i < edge.points.length; i++) {
      const a = edge.points[i - 1], b = edge.points[i]
      const horizontal = close(a.y, b.y)
      assert(horizontal || close(a.x, b.x), `Diagonal route ${edge.id}`)
      for (const n of layout.nodes) {
        const throughCard = horizontal
          ? a.y > n.y + epsilon && a.y < n.y + n.height - epsilon && overlap(a.x, b.x, n.x, n.x + n.width)
          : a.x > n.x + epsilon && a.x < n.x + n.width - epsilon && overlap(a.y, b.y, n.y, n.y + n.height)
        assert(!throughCard, `${edge.id} crosses ${n.id}`)
      }
      segments.push({ id: edge.id, a, b, horizontal })
    }
  }
  // Perpendicular crossings can exist in a non-planar graph; coincident runs
  // hide relationships and are the regression this layout must prevent.
  for (const [i, a] of segments.entries()) for (const b of segments.slice(i + 1)) {
    if (a.id === b.id || a.horizontal !== b.horizontal) continue
    const sharedRun = a.horizontal
      ? close(a.a.y, b.a.y) && overlap(a.a.x, a.b.x, b.a.x, b.b.x)
      : close(a.a.x, b.a.x) && overlap(a.a.y, a.b.y, b.a.y, b.b.y)
    assert(!sharedRun, `${a.id} shares a route with ${b.id}`)
  }
}

test('all catalog nodes and their connections avoid cards and shared routes', () => {
  verifyGeometry(full, nodes)
})

test('focused and filtered views route only their displayed relationships', async () => {
  const near = neighborhood(nodes, 'microscope', 2)
  const focused = await layoutGraph(near)
  verifyGeometry(focused, near)
  assert(focused.width * focused.height < full.width * full.height)
  const filtered = nodes.filter(n => matchesFilters(n, 'science', { min: 1750, max: 1900 }))
  verifyGeometry(await layoutGraph(filtered), filtered)
  assert.deepEqual(await layoutGraph([...near].reverse()), focused, 'Input ordering should not change the view')
})

test('empty and single-node views remain usable', async () => {
  assert.deepEqual(await layoutGraph([]), { nodes: [], edges: [], bands: [], timeBands: [], width: 0, height: 0 })
  const single = [nodes.find(n => n.id === 'microscope')]
  verifyGeometry(await layoutGraph(single), single)
})

test('route visibility follows detours when both endpoints are offscreen', () => {
  const points = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 200 }, { x: 80, y: 200 }, { x: 80, y: 0 }, { x: 100, y: 0 }]
  assert(routeIntersectsRect(points, { x: 40, y: 180, width: 20, height: 40 }))
  assert(!routeIntersectsRect(points, { x: 40, y: 40, width: 20, height: 40 }))
})
