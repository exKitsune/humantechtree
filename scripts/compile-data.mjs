import { writeFile, mkdir } from 'node:fs/promises'
import { loadCatalog } from './lib/catalog.mjs'
import { validateCategories } from '../src/lib/categories.js'
const { nodes } = await loadCatalog()
validateCategories(nodes)
nodes.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
await mkdir('public/data', { recursive: true })
await writeFile('public/data/catalog.json', JSON.stringify({ version: 1, generated: new Date().toISOString().slice(0, 10), nodes }))
console.log(`Compiled ${nodes.length} capabilities and ${nodes.reduce((s, n) => s + n.parents.length, 0)} connections.`)
