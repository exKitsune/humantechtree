import { test } from 'node:test'
import assert from 'node:assert/strict'
import { alternativePath, auditConnections } from '../scripts/lib/connection-audit.mjs'
import { layoutGraph } from '../src/lib/layout.js'

const edge = (id, extra = {}) => ({ id, type: 'foundation', reason: 'An explicit contribution to the target capability.', ...extra })
const node = (id, parents = [], extra = {}) => ({ id, title: id, year: 1900, kind: 'technology', parents, ...extra })

test('adding an intermediate exposes an existing shortcut without rewriting the catalog', () => {
  const source = node('a'), target = node('c', [edge('a')])
  assert.equal(auditConnections([source, target]).candidates.length, 0)
  const graph = [source, node('b', [edge('a')]), { ...target, parents: [...target.parents, edge('b')] }]
  const before = structuredClone(graph)
  const audit = auditConnections(graph)
  assert.deepEqual(audit.candidates.map(e => [e.source, e.target, e.path]), [['a', 'c', ['a', 'b', 'c']]])
  assert.deepEqual(graph, before, 'Audits must never invent, delete, or retype a relationship')
  assert.deepEqual(auditConnections([...graph].reverse()), audit)
})

test('a directly used tool can remain even with an alternative intellectual history', () => {
  const graph = [node('microscope'), node('cell-observations', [edge('microscope', { type: 'enabler' })]),
    node('theory', [edge('cell-observations'), edge('microscope', {
      directContribution: 'The researchers also used the instrument to make new tissue observations in this work.',
    })])]
  const audit = auditConnections(graph)
  assert.equal(audit.candidates.length, 0)
  assert.equal(audit.retained.length, 1)
  assert.deepEqual(audit.retained[0].pathTypes, ['enabler', 'foundation'])
  assert.equal(graph[2].parents.length, 2)
})

test('remote discovery reused as a material flags even when intermediates are missing', () => {
  const graph = [node('bacteria', [], { title: 'Observation of bacteria', kind: 'discovery', year: 1676 }),
    node('dna-heredity', [edge('bacteria')], { year: 1944 })]
  const audit = auditConnections(graph)
  assert.deepEqual(audit.candidates[0].flags, ['remote-observation'])
  assert.equal(audit.candidates[0].gapYears, 268)
  assert.equal(audit.candidates[0].path, undefined)
})

test('elapsed time alone does not disqualify a directly used material or instrument', () => {
  const graph = [node('lens', [], { title: 'Optical lens', year: -700 }), node('implant', [edge('lens')], { year: 1949 })]
  assert.equal(auditConnections(graph).candidates.length, 0)
  const observations = [node('cells', [], { title: 'Discovery of cells', kind: 'discovery', year: 1665 }),
    node('cell-theory', [edge('cells', { directContribution: 'The observed cellular structures form the actual empirical subject generalized by cell theory.' })], { year: 1839 })]
  assert.equal(auditConnections(observations).retained.length, 1)
})

test('shortest alternative paths are deterministic and malformed cycles terminate', () => {
  const graph = [node('a'), node('b', [edge('a')]), node('d', [edge('b')]), node('c', [edge('a'), edge('d'), edge('b')])]
  assert.deepEqual(alternativePath(new Map(graph.map(n => [n.id, n])), 'a', 'c'), ['a', 'b', 'c'])
  const cyclic = [node('b', [edge('d')]), node('d', [edge('b')]), node('c', [edge('a'), edge('b')])]
  assert.equal(alternativePath(new Map(cyclic.map(n => [n.id, n])), 'a', 'c'), null)
})

test('a filtered-out intermediate does not become a direct rendered prerequisite', async () => {
  const graph = [node('a', [], { year: 1800, domain: 'science' }),
    node('b', [edge('a')], { year: 1850, domain: 'science' }),
    node('c', [edge('b')], { year: 1900, domain: 'science' })]
  const visible = graph.filter(n => n.id !== 'b')
  assert.equal((await layoutGraph(visible)).edges.length, 0)
  assert.equal((await layoutGraph(graph)).edges.length, 2)
})
