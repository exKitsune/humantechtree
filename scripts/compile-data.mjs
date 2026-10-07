import { readFile, writeFile, mkdir } from 'node:fs/promises'
const files = ['engineering', 'science', 'society']
const nodes = (await Promise.all(files.map(async f => JSON.parse(await readFile(`data/${f}.json`, 'utf8'))))).flat()
let extra = []
try { extra = JSON.parse(await readFile('data/connections.json', 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
for (const edge of extra) {
  const target = nodes.find(n => n.id === edge.target)
  if (!target || !nodes.some(n => n.id === edge.id)) throw new Error(`Invalid cross-domain link: ${edge.id} -> ${edge.target}`)
  if (!target.parents.some(p => p.id === edge.id)) {
    const { target: _, ...parent } = edge
    target.parents.push(parent)
  }
}
nodes.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
await mkdir('public/data', { recursive: true })
await writeFile('public/data/catalog.json', JSON.stringify({ version: 1, generated: new Date().toISOString().slice(0, 10), nodes }))
console.log(`Compiled ${nodes.length} capabilities and ${nodes.reduce((s, n) => s + n.parents.length, 0)} connections.`)
