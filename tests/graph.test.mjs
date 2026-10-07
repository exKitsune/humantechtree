import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { neighborhood, layoutGraph, matchesFilters, searchNodes } from '../src/lib/graph.js'
const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
test('microscope connects instruments to biological discovery', () => {
  const near = neighborhood(nodes, 'microscope', 2)
  assert(near.some(n => n.id === 'bacteria'))
  assert(near.some(n => n.id === 'optical-lens'))
})
test('full catalog has a collision-free layout and finite positions', () => {
  const positions = layoutGraph(nodes)
  assert.equal(positions.size, nodes.length)
  const slots = new Set()
  for (const p of positions.values()) {
    assert(Number.isFinite(p.x) && Number.isFinite(p.y))
    const key = `${p.x},${p.y}`
    assert(!slots.has(key)); slots.add(key)
  }
})
test('search is case insensitive, matches multiword terms, and ranks exact titles', () => {
  assert.equal(searchNodes(nodes, 'MICROSCOPE')[0].id, 'microscope')
  assert(searchNodes(nodes, 'steam engine').length > 0)
  assert.equal(searchNodes(nodes, 'zzzz-nothing-found').length, 0)
  assert.equal(searchNodes(nodes, '').length, 0)
})
test('era boundaries are exclusive at the upper end and filters compose', () => {
  const sample = { domain: 'science', year: 1900 }
  assert(!matchesFilters(sample, 'all', { min: 1750, max: 1900 }))
  assert(matchesFilters(sample, 'science', { min: 1900, max: Infinity }))
  assert(!matchesFilters(sample, 'society', { min: 1900, max: Infinity }))
})
test('neighborhood handles unknown IDs and obeys depth', () => {
  assert.deepEqual(neighborhood(nodes, 'missing'), [])
  assert.deepEqual(neighborhood(nodes, 'microscope', 0).map(n=>n.id), ['microscope'])
})
