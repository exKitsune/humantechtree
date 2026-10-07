import { layoutGraph } from './layout.js'
const cache = new Map()
self.onmessage = async ({ data: { request, items } }) => {
  const key = JSON.stringify(items)
  try {
    if (!cache.has(key)) {
      if (cache.size >= 4) cache.delete(cache.keys().next().value)
      cache.set(key, await layoutGraph(items))
    }
    self.postMessage({ request, layout: cache.get(key) })
  } catch (error) { self.postMessage({ request, error: String(error) }) }
}
