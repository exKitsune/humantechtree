export function createLayoutClient() {
  const worker = new Worker(new URL('./layout.worker.js', import.meta.url), { type: 'module' })
  const pending = new Map()
  let request = 0
  worker.onmessage = ({ data }) => {
    const task = pending.get(data.request)
    if (!task) return
    pending.delete(data.request)
    if (data.error) task.reject(new Error(data.error))
    else task.resolve(data.layout)
  }
  worker.onerror = event => {
    for (const task of pending.values()) task.reject(new Error(event.message || 'Layout worker failed to load.'))
    pending.clear()
  }
  return {
    layout(items) {
      return new Promise((resolve, reject) => {
        pending.set(++request, { resolve, reject })
        worker.postMessage({ request, items: items.map(n => ({ id: n.id, domain: n.domain, category: n.category, year: n.year, parents: n.parents.map(p => ({ id: p.id, type: p.type })) })) })
      })
    },
    destroy() { worker.terminate(); for (const task of pending.values()) task.reject(new Error('Layout cancelled.')); pending.clear() },
  }
}
