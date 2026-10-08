import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { connectionBetween, rememberView, restoreCamera } from '../src/lib/navigation.js'
import { layoutGraph } from '../src/lib/layout.js'
import { neighborhood, matchesFilters } from '../src/lib/graph.js'
import { contentExtent } from '../src/lib/viewport.js'

const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
const index = new Map(nodes.map(n => [n.id, n]))
const view = () => ({ label: 'Electronic computer', selectedId: 'computer', focused: true,
  domain: 'all', eraId: 'all', category: 'all', detailsTab: 'overview', detailsOpen: true,
  expandedGroups: ['sorting'], connection: null, detailScroll: 430,
  viewport: { x: -400, y: -500, zoom: .6, width: 800, height: 600 },
})

test('following a prerequisite backward retains its real source, target and authored explanation', () => {
  const forward = connectionBetween(index, 'computer', 'merge-sort')
  assert.equal(forward.source, 'computer')
  assert.equal(forward.target, 'merge-sort')
  assert.equal(forward.reason, index.get('merge-sort').parents.find(p => p.id === 'computer').reason)
  assert.deepEqual(connectionBetween(index, 'merge-sort', 'computer'), forward)
  assert.equal(connectionBetween(index, 'computer', 'not-a-node'), null)
  assert.equal(connectionBetween(index, 'computer', 'computer'), null)
})

test('a common category or an indirect path never produces a made-up connection explanation', () => {
  const members = new Map([
    ['a', { id: 'a', category: 'sorting', parents: [] }],
    ['b', { id: 'b', category: 'sorting', parents: [{ id: 'a', type: 'foundation', reason: 'first direct contribution' }] }],
    ['c', { id: 'c', category: 'sorting', parents: [{ id: 'b', type: 'enabler', reason: 'second direct contribution' }] }],
  ])
  assert.equal(connectionBetween(members, 'a', 'c'), null)
  assert.equal(connectionBetween(members, 'c', 'a'), null)
  assert.equal(connectionBetween(members, 'b', 'c').reason, 'second direct contribution')
})

test('back history preserves filters, expanded groups, connection context, scroll and camera independently', () => {
  const before = view()
  before.connection = connectionBetween(index, 'stored-program', 'computer')
  const history = rememberView([], before)
  before.expandedGroups.push('programming'); before.viewport.zoom = 1.8
  before.connection.reason = 'changed later'
  assert.deepEqual(history[0].expandedGroups, ['sorting'])
  assert.equal(history[0].viewport.zoom, .6)
  assert.notEqual(history[0].connection.reason, 'changed later')
  const later = { ...view(), selectedId: 'quicksort', category: 'sorting', domain: 'information', focused: false }
  const next = rememberView(history, later)
  assert.equal(next.at(-1).category, 'sorting')
  assert.equal(next.slice(0, -1).at(-1).selectedId, 'computer')
  assert.equal(next[0].detailScroll, 430)
  let bounded = []
  for (let i = 0; i < 80; i++) bounded = rememberView(bounded, { ...view(), label: String(i) })
  assert.equal(bounded.length, 40)
  assert.equal(bounded[0].label, '40')
})

test('restoring a camera keeps zoom and world center across resized panels and respects hard pan limits', () => {
  const before = view().viewport, extent = [[-5000, -5000], [5000, 5000]]
  assert.deepEqual(restoreCamera(before, 800, 600, extent), { x: -400, y: -500, zoom: .6 })
  const after = restoreCamera(before, 620, 440, extent)
  assert.equal(after.zoom, before.zoom)
  assert.equal((620 / 2 - after.x) / after.zoom, (800 / 2 - before.x) / before.zoom)
  assert.equal((440 / 2 - after.y) / after.zoom, (600 / 2 - before.y) / before.zoom)
  const clamped = restoreCamera({ ...before, x: 100000, y: -100000 }, 800, 600, extent)
  assert.equal(clamped.x, 3000)
  assert.equal(clamped.y, -2400)
})

test('returning from a category view reconstructs the original computer neighborhood and camera', async () => {
  const computer = neighborhood(nodes, 'computer', 2)
  const initial = await layoutGraph(computer)
  const node = initial.nodes.find(n => n.id === 'computer')
  const viewport = { x: 400 - (node.x + node.width / 2) * .75, y: 300 - (node.y + node.height / 2) * .75, zoom: .75, width: 800, height: 600 }
  const saved = rememberView([], { ...view(), viewport })[0]
  const sorting = nodes.filter(n => matchesFilters(n, 'information', { min: -Infinity, max: Infinity }, 'sorting'))
  assert(!sorting.some(n => n.id === saved.selectedId), 'a category-only view would have hidden the origin')
  await layoutGraph(sorting)
  const returned = await layoutGraph(neighborhood(nodes, saved.selectedId, 2))
  assert.deepEqual(returned, initial)
  const camera = restoreCamera(saved.viewport, 800, 600, contentExtent(returned))
  assert.deepEqual(camera, { x: viewport.x, y: viewport.y, zoom: viewport.zoom })
  assert.deepEqual(saved.expandedGroups, ['sorting'])
})
