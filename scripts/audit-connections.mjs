import { writeFile } from 'node:fs/promises'
import { loadCatalog } from './lib/catalog.mjs'
import { auditConnections } from './lib/connection-audit.mjs'

const { nodes, edgeFiles } = await loadCatalog()
const audit = auditConnections(nodes)
for (const row of [...audit.candidates, ...audit.retained]) row.file = edgeFiles.get(`${row.source}->${row.target}`)
const report = { nodeCount: nodes.length, edgeCount: nodes.reduce((n, item) => n + item.parents.length, 0),
  policy: 'Review flags are not historical verdicts. Prefer immediate contributions; preserve independently justified direct links. Never infer or remove edges automatically.', ...audit }
const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9)
if (output) await writeFile(output, JSON.stringify(report, null, 2) + '\n')
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`${audit.candidates.length} connection(s) need directness review; ${audit.retained.length} retain an explained independent contribution.`)
  for (const row of audit.candidates) console.log(`${row.source} -> ${row.target} [${row.flags.join(', ')}]${row.path ? `\n  Existing route: ${row.path.join(' -> ')}` : ''}\n  ${row.file}`)
  if (output) console.log(`Full report: ${output}`)
}
if (process.argv.includes('--check') && audit.candidates.length) process.exitCode = 1
