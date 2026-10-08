import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { parseArgs } from 'node:util'
import { layoutGraph } from '../src/lib/layout.js'
import { neighborhood, matchesFilters } from '../src/lib/graph.js'
import { measureLayout } from './lib/layout-metrics.mjs'

const { values } = parseArgs({ options: {
  node: { type: 'string' }, depth: { type: 'string', default: '2' },
  domain: { type: 'string', default: 'all' },
  from: { type: 'string' }, to: { type: 'string' }, help: { type: 'boolean' },
} })
if (values.help) {
  console.log('npm run layout:analyze -- [--node ID --depth 2] [--domain science] [--from 1750 --to 1900]\nDates include --from and exclude --to. Reads compiled data; no writes or network.')
} else {
  const raw = await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8')
  const { nodes } = JSON.parse(raw)
  const depth = Number(values.depth)
  const min = values.from === undefined ? -Infinity : Number(values.from)
  const max = values.to === undefined ? Infinity : Number(values.to)
  if (!Number.isSafeInteger(depth) || depth < 0 || depth > nodes.length) throw new Error('Depth must be a nonnegative integer no larger than the catalog.')
  if (Number.isNaN(min) || Number.isNaN(max) || min >= max) throw new Error('Date range must increase from --from to --to.')
  if (values.node && !nodes.some(n => n.id === values.node)) throw new Error(`Unknown node: ${values.node}`)
  if (values.domain !== 'all' && !nodes.some(n => n.domain === values.domain)) throw new Error(`Unknown domain: ${values.domain}`)
  const selected = (values.node ? neighborhood(nodes, values.node, depth) : nodes)
    .filter(n => matchesFilters(n, values.domain, { min, max }))
  const start = performance.now()
  const layout = await layoutGraph(selected)
  const layoutMs = Math.round((performance.now() - start) * 10) / 10
  console.log(JSON.stringify({ schema: 1, catalogSha256: createHash('sha256').update(raw).digest('hex'),
    scope: { node: values.node ?? null, depth: values.node ? depth : null, domain: values.domain, from: values.from ?? null, to: values.to ?? null },
    layoutMs, ...measureLayout(layout),
  }, null, 2))
}