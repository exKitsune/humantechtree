import { clampViewport } from './viewport.js'

/** Look up an actual direct contribution, retaining historical direction even
 * when the visitor follows it from a child back to a prerequisite.
 * @param {Map<string, import('./types').Capability>} index
 * @returns {import('./types').FollowedConnection | null}
 */
export function connectionBetween(index, from, to) {
  const forward = index.get(to)?.parents.find(p => p.id === from)
  if (forward) return { ...forward, source: from, target: to }
  const backward = index.get(from)?.parents.find(p => p.id === to)
  return backward ? { ...backward, source: to, target: from } : null
}

/** Save independent snapshots, bounded to this browsing session.
 * @param {import('./types').NavigationView[]} history
 * @param {import('./types').NavigationView} view
 */
export function rememberView(history, view, limit = 40) {
  return [...history, { ...view, expandedGroups: [...view.expandedGroups],
    connection: view.connection ? { ...view.connection } : null,
    viewport: view.viewport ? { ...view.viewport } : null,
  }].slice(-limit)
}

// Preserve the same world-space center if the panel/window size changed.
// Normal pan bounds still apply when restoring a previous camera.
export function restoreCamera(snapshot, width, height, extent) {
  return clampViewport({ x: snapshot.x + (width - snapshot.width) / 2,
    y: snapshot.y + (height - snapshot.height) / 2, zoom: snapshot.zoom }, width, height, extent)
}
