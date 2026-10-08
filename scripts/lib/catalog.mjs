import { readFile } from 'node:fs/promises'

export const catalogFiles = ['engineering', 'science', 'society', 'engineering-expansion', 'science-expansion', 'society-expansion', 'warfare-expansion', 'built-world-expansion', 'institutions-expansion', 'computing-expansion-2', 'production-expansion-2', 'public-health-expansion-2', 'computing-expansion-3', 'production-expansion-3', 'public-health-expansion-3', 'measurement-expansion-3']
const bridgeFiles = ['engineering-connections', 'science-connections', 'society-connections']

// Read authoring sources, not yesterday's compiled output, so adding an
// intermediate immediately exposes old edges that now bypass it.
export async function loadCatalog() {
  const nodes = [], files = new Map(), edgeFiles = new Map()
  for (const name of [...catalogFiles, ...bridgeFiles]) {
    let entries
    try { entries = JSON.parse(await readFile(`data/${name}.json`, 'utf8')) }
    catch (error) { if (error.code === 'ENOENT' && bridgeFiles.includes(name)) continue; throw error }
    for (const entry of entries) {
      nodes.push(entry); files.set(entry.id, `data/${name}.json`)
      for (const parent of entry.parents) edgeFiles.set(`${parent.id}->${entry.id}`, `data/${name}.json`)
    }
  }
  const index = new Map(nodes.map(n => [n.id, n]))
  let extra = []
  try { extra = JSON.parse(await readFile('data/connections.json', 'utf8')) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  for (const edge of extra) {
    const target = index.get(edge.target)
    if (!target || !index.has(edge.id)) throw new Error(`Invalid cross-domain link: ${edge.id} -> ${edge.target}`)
    if (target.parents.some(p => p.id === edge.id)) throw new Error(`Duplicate cross-domain link: ${edge.id} -> ${edge.target}. Keep one authored definition so explanations cannot be silently ignored.`)
    const { target: _, ...parent } = edge
    target.parents.push(parent)
    edgeFiles.set(`${edge.id}->${edge.target}`, 'data/connections.json')
  }
  return { nodes, files, edgeFiles }
}
