import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { auditConnections } from './lib/connection-audit.mjs'
const { nodes } = JSON.parse(await readFile('public/data/catalog.json', 'utf8'))
const domains = new Set(['materials','engineering','energy','transport','warfare','food','science','medicine','information','society','culture'])
const kinds = new Set(['technology','discovery','infrastructure','institution','practice'])
const types = new Set(['foundation','enabler','influence'])
assert(nodes.length >= 2000, `Expected at least 2,000 substantive nodes, got ${nodes.length}`)
const index = new Map()
const titles = new Set()
for (const n of nodes) {
  assert.match(n.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert(!index.has(n.id), `Duplicate ID: ${n.id}`)
  assert(n.title && n.wiki && n.summary?.length > 20, `Incomplete node: ${n.id}`)
  assert(!titles.has(n.title.toLowerCase()), `Duplicate title: ${n.title}`)
  titles.add(n.title.toLowerCase())
  assert(domains.has(n.domain) && kinds.has(n.kind), `Invalid classification: ${n.id}`)
  assert(Number.isFinite(n.year) && n.year !== 0, `Invalid year: ${n.id}`)
  assert(Array.isArray(n.parents))
  index.set(n.id, n)
}
for (const n of nodes) {
  const seen = new Set()
  for (const p of n.parents) {
    assert(index.has(p.id), `Missing parent: ${n.id} -> ${p.id}`)
    assert(index.get(p.id).year <= n.year, `Later prerequisite: ${p.id} -> ${n.id}`)
    assert(p.id !== n.id, `Self-reference: ${n.id}`)
    assert(!seen.has(p.id), `Duplicate relationship: ${n.id} -> ${p.id}`)
    assert(types.has(p.type) && p.reason?.length > 20, `Invalid relationship: ${p.id} -> ${n.id}`)
    if (p.directContribution !== undefined) assert(typeof p.directContribution === 'string' && p.directContribution.trim().length >= 30, `Explain the independent contribution: ${p.id} -> ${n.id}`)
    seen.add(p.id)
  }
}
const done = new Set(), visiting = new Set()
function visit(id) {
  assert(!visiting.has(id), `Cycle at ${id}`)
  if (done.has(id)) return
  visiting.add(id)
  for (const p of index.get(id).parents) visit(p.id)
  visiting.delete(id); done.add(id)
}
nodes.forEach(n => visit(n.id))
const { candidates, retained } = auditConnections(nodes)
assert(!candidates.length, `${candidates.length} connections need directness review. Run npm run data:audit-connections.\n${candidates.slice(0, 12).map(e => `${e.source} -> ${e.target}: ${e.flags.join(', ')}`).join('\n')}`)
const metadata = JSON.parse(await readFile('public/data/wikipedia.json', 'utf8'))
for (const [id, entry] of Object.entries(metadata)) {
  assert(index.has(id), `Image metadata for unknown node: ${id}`)
  if (entry.thumbnail) {
    const u = new URL(entry.thumbnail)
    assert(u.protocol === 'https:' && /(^|\.)wikimedia\.org$/.test(u.hostname), `Non-Wikimedia image URL: ${id}`)
    assert(entry.imagePage, `Image missing attribution page: ${id}`)
  }
}
console.log(`Valid: ${nodes.length} unique nodes, ${nodes.reduce((s,n)=>s+n.parents.length,0)} explained edges, no cycles or dangling links.`)
console.log(`Directness audit: no unresolved flags; ${retained.length} independent direct contributions documented. Historical claim review remains separate.`)
