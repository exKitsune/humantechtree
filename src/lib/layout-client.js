import ELK from 'elkjs/lib/elk-api.js'
import workerUrl from 'elkjs/lib/elk-worker.min.js?url'
import { layoutGraph } from './layout.js'

export function createLayoutClient() {
  // ELK's actual worker keeps routing off the UI thread. Vite copies the worker
  // as a local asset, including the relative base needed for GitHub Pages.
  const elk = new ELK({ workerFactory: () => new Worker(workerUrl) })
  const cache = new Map()
  return {
    layout(items) {
      const key = JSON.stringify(items.map(n => [n.id, n.year, n.parents.map(p => p.id)]))
      if (!cache.has(key)) {
        if (cache.size >= 8) cache.delete(cache.keys().next().value)
        cache.set(key, layoutGraph(items, elk).catch(error => { cache.delete(key); throw error }))
      }
      return cache.get(key)
    },
    destroy() { elk.terminateWorker() },
  }
}
