import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadCatalog } from '../scripts/lib/catalog.mjs'
import { alternativePath } from '../scripts/lib/connection-audit.mjs'

const { nodes } = await loadCatalog()
const index = new Map(nodes.map(n => [n.id, n]))
function ancestors(id) {
  const seen = new Set(), queue = [id]
  for (let i = 0; i < queue.length; i++) for (const parent of index.get(queue[i]).parents) {
    if (seen.has(parent.id)) continue
    seen.add(parent.id); queue.push(parent.id)
  }
  return seen
}

test('DNA heredity uses transformation experiments with a separate nuclear-chemistry ancestry', () => {
  const direct = index.get('dna-heredity').parents.map(p => p.id)
  assert(!direct.includes('bacteria'), 'First observation must not stand in for cultured experimental strains')
  assert(direct.includes('bacterial-transformation'), 'The experimental phenomenon belongs immediately upstream')
  const upstream = ancestors('dna-heredity')
  for (const id of ['microbial-culture', 'pneumococcus-isolation', 'cell-nucleus', 'dna-isolation', 'microscope']) {
    assert(upstream.has(id), `Missing the upstream contribution of ${id}`)
  }
  assert(index.get('cell-theory').parents.some(p => p.id === 'cell-nucleus'), 'Retain the distinct cell-observation/theory branch')
})

test('vacuum tubes retain a directly used pump alongside electron discovery', () => {
  const pump = index.get('vacuum-tube').parents.find(p => p.id === 'vacuum-pump')
  assert(pump?.directContribution, 'Physical evacuation is an independent direct role, not a removable historical shortcut')
  assert(alternativePath(index, 'vacuum-pump', 'vacuum-tube'), 'This case must exercise parallel direct and indirect contributions')
})
