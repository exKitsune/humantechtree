import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { loadCatalog } from '../scripts/lib/catalog.mjs'
import { categories, categoryFor, categoryGroups, validateCategories } from '../src/lib/categories.js'
import { layoutGraph } from '../src/lib/layout.js'
import { createScene } from '../src/lib/scene.js'
import { matchesFilters, neighborhood, searchNodes } from '../src/lib/graph.js'

const { nodes } = await loadCatalog()
const allTime = { min: -Infinity, max: Infinity }
const sortingIds = ['merge-sort', 'quicksort', 'heapsort']
const fixture = (id, category, parents = []) => ({ id, category, domain: 'information', year: 1965, parents: parents.map(id => ({ id, type: 'foundation' })) })

test('authored categories survive compilation and group the computer fan-out by purpose', async () => {
  validateCategories(nodes)
  const compiled = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
  assert.deepEqual(new Map(compiled.nodes.map(n => [n.id, n.category])), new Map(nodes.map(n => [n.id, n.category])))
  const children = nodes.filter(n => n.parents.some(p => p.id === 'computer'))
  const groups = categoryGroups(children)
  assert.deepEqual(groups.find(g => g.id === 'sorting').nodes.map(n => n.id).sort(), [...sortingIds].sort())
  assert.equal(groups.reduce((sum, g) => sum + g.nodes.length, 0), children.length)
  assert(groups.some(g => g.id === 'artificial-intelligence'))
  assert(groups.some(g => g.id === 'memory-storage'))
  assert(groups.some(g => g.domain === 'medicine' && !g.category), 'cross-domain applications retain their branch')
})

test('category identifiers are validated against their enclosing branch; new unclassified nodes remain usable', async () => {
  assert.throws(() => validateCategories([fixture('bad', 'nonexistent')]), /Invalid category/)
  assert.throws(() => validateCategories([{ ...fixture('bad', 'sorting'), domain: 'medicine' }]), /Invalid category/)
  assert.throws(() => validateCategories([fixture('bad', ['sorting'])]), /Invalid category/)
  const entries = [fixture('classified', 'sorting'), fixture('new-capability', undefined)]
  validateCategories(entries)
  const layout = await layoutGraph(entries)
  assert.equal(layout.nodes.length, 2)
  assert.deepEqual(layout.bands[0].categories.map(g => g.id), ['sorting', 'information:other'])
})

test('computer categories occupy disjoint regions, preserving all displayed contributions', async () => {
  const items = neighborhood(nodes, 'computer', 2)
  const layout = await layoutGraph(items), source = new Map(items.map(n => [n.id, n]))
  assert.deepEqual(new Set(layout.edges.map(e => e.id)), new Set(items.flatMap(n => n.parents.filter(p => source.has(p.id)).map(p => `${p.id}--${n.id}`))))
  for (const band of layout.bands) {
    let bottom = band.y
    for (const group of band.categories) {
      assert(group.y >= bottom)
      bottom = group.y + group.height
      assert(bottom <= band.y + band.height)
      const members = layout.nodes.filter(n => n.domain === band.id && (n.category ?? `${n.domain}:other`) === group.id)
      assert.equal(members.length, group.count)
      for (const node of members) {
        assert(node.y >= group.y && node.y + node.height <= bottom)
        assert(node.x >= group.x && node.x + node.width <= group.x + group.width)
      }
    }
  }
  const reversed = items.toReversed().map(n => ({ ...n, parents: n.parents.toReversed() }))
  assert.deepEqual(await layoutGraph(reversed), layout)
})

test('adding category members expands the visible layout without mixing categories or losing density counts', async () => {
  const small = [fixture('sort', 'sorting'), fixture('ai', 'artificial-intelligence')]
  const expanded = [...small, ...Array.from({ length: 70 }, (_, i) => fixture(`extra-sort-${i}`, 'sorting'))]
  const before = await layoutGraph(small), layout = await layoutGraph(expanded)
  const a = before.bands[0].categories.find(g => g.id === 'sorting'), b = layout.bands[0].categories.find(g => g.id === 'sorting')
  assert.equal(b.count, 71)
  assert(b.width > a.width || b.height > a.height)
  const scene = createScene(layout, expanded)
  for (const level of scene.levels) {
    assert.equal(level.marks.filter(m => m.category === 'sorting').reduce((sum, m) => sum + m.count, 0), 71)
    assert.equal(level.marks.filter(m => m.category === 'artificial-intelligence').reduce((sum, m) => sum + m.count, 0), 1)
    for (const mark of level.marks) {
      const group = layout.bands[0].categories.find(g => g.id === mark.category)
      assert(mark.cy >= group.y && mark.cy <= group.y + group.height)
      assert(mark.minY >= group.y && mark.maxY <= group.y + group.height)
    }
  }
})

test('category filters compose with dates and never invent links through a hidden category', async () => {
  const chain = [fixture('a', 'sorting'), fixture('b', 'programming', ['a']), fixture('c', 'sorting', ['b'])]
  const visible = chain.filter(n => matchesFilters(n, 'information', allTime, 'sorting'))
  assert.deepEqual(visible.map(n => n.id), ['a', 'c'])
  assert.equal((await layoutGraph(visible)).edges.length, 0)
  assert.equal(matchesFilters(chain[0], 'information', { min: 1966, max: 1970 }, 'sorting'), false)
  assert.equal(matchesFilters(chain[0], 'medicine', allTime, 'sorting'), false)
  for (const id of sortingIds) assert(searchNodes(nodes, 'sorting algorithms').some(n => n.id === id))
  assert(categories.every(c => nodes.some(n => categoryFor(n)?.id === c.id)))
})
