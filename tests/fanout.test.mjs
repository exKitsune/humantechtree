import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { layoutGraph } from '../src/lib/layout.js'
import { neighborhood } from '../src/lib/graph.js'

const { nodes } = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))
const eps = .001
const inside = (value, a, b) => value >= Math.min(a, b) - eps && value <= Math.max(a, b) + eps
function intersects(a, b, c, d) {
  const ah = Math.abs(a.y - b.y) < eps, ch = Math.abs(c.y - d.y) < eps
  if (ah && !ch) return inside(c.x, a.x, b.x) && inside(a.y, c.y, d.y)
  if (!ah && ch) return inside(a.x, c.x, d.x) && inside(c.y, a.y, b.y)
  if (ah && ch) return Math.abs(a.y - c.y) < eps && Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) + eps
  return Math.abs(a.x - c.x) < eps && Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) <= Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) + eps
}

export function verifyFanouts(layout) {
  const groups = new Map()
  for (const edge of layout.edges) {
    if (!groups.has(edge.source)) groups.set(edge.source, [])
    groups.get(edge.source).push(edge)
  }
  for (const [source, family] of groups) for (let i = 0; i < family.length; i++) for (let j = i + 1; j < family.length; j++) {
    const a = family[i], b = family[j]
    for (let ai = 1; ai < a.points.length; ai++) for (let bi = 1; bi < b.points.length; bi++) {
      assert(!intersects(a.points[ai - 1], a.points[ai], b.points[bi - 1], b.points[bi]),
        `Outbound routes cross for ${source}: ${a.target} segment ${ai}, ${b.target} segment ${bi}`)
      const p = a.points[ai - 1], q = a.points[ai], r = b.points[bi - 1], s = b.points[bi]
      const dx = Math.max(0, Math.min(p.x, q.x) - Math.max(r.x, s.x), Math.min(r.x, s.x) - Math.max(p.x, q.x))
      const dy = Math.max(0, Math.min(p.y, q.y) - Math.max(r.y, s.y), Math.min(r.y, s.y) - Math.max(p.y, q.y))
      assert(Math.hypot(dx, dy) >= 4, `Outbound paths nearly coincide for ${source}: ${a.target}, ${b.target}`)
    }
  }
}

test('no outbound links from the same node cross, touch, or overlap in the full catalog', async () => {
  verifyFanouts(await layoutGraph(nodes))
})

test('microscope fan-out remains disjoint in the focused view from the reported screenshot', async () => {
  verifyFanouts(await layoutGraph(neighborhood(nodes, 'microscope', 2)))
})

test('fan-out handles upper/lower bands, short/long links and equal-column destinations', async () => {
  const node = (id, domain, parents = []) => ({ id, domain, year: 0, parents: parents.map(id => ({ id, type: 'foundation' })) })
  const fixture = [node('source', 'science'), node('step1', 'science', ['source']), node('step2', 'science', ['step1'])]
  for (const domain of ['engineering', 'science', 'culture']) for (let rank = 1; rank <= 3; rank++) for (let i = 0; i < 4; i++) {
    fixture.push(node(`${domain}-${rank}-${i}`, domain, rank === 1 ? ['source'] : ['source', rank === 2 ? 'step1' : 'step2']))
  }
  verifyFanouts(await layoutGraph(fixture))
})

test('fan-outs stay disjoint when filters or high-degree neighborhoods change the view', async () => {
  const degrees = new Map()
  for (const node of nodes) for (const parent of node.parents) degrees.set(parent.id, (degrees.get(parent.id) ?? 0) + 1)
  const hubs = [...degrees].sort((a, b) => b[1] - a[1]).slice(0, 3)
  for (const [id] of hubs) verifyFanouts(await layoutGraph(neighborhood(nodes, id, 2)))
  for (const domain of ['engineering', 'science', 'society']) verifyFanouts(await layoutGraph(nodes.filter(n => n.domain === domain)))
  verifyFanouts(await layoutGraph(nodes.filter(n => n.year >= 1450 && n.year < 1900)))
})
