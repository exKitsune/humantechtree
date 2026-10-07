export const NODE_WIDTH = 204
export const MIN_NODE_HEIGHT = 144
const PORT_SPACING = 12

/** Test the actual routed segments, including detours beyond the endpoints. */
export function routeIntersectsRect(points, rect) {
  return points.some((point, i) => {
    if (!i) return false
    const previous = points[i - 1]
    return Math.max(point.x, previous.x) >= rect.x && Math.min(point.x, previous.x) <= rect.x + rect.width
      && Math.max(point.y, previous.y) >= rect.y && Math.min(point.y, previous.y) <= rect.y + rect.height
  })
}

/** Lay out exactly the supplied view, routing every relationship independently.
 * No coordinates, canvas size, or domain-specific placements are prescribed.
 * Distinct ports prevent outgoing links from becoming one indistinguishable bus.
 */
export async function layoutGraph(nodes, elk) {
  if (!nodes.length) return { nodes: [], edges: [], width: 0, height: 0 }
  const ordered = [...nodes].sort((a,b) => a.year - b.year || a.id.localeCompare(b.id))
  const ids = new Set(ordered.map(n => n.id))
  const edges = ordered.flatMap(n => n.parents.filter(p => ids.has(p.id)).map(p => ({
    id: `${p.id}--${n.id}`, source: p.id, target: n.id,
    sourceHandle: `${p.id}--${n.id}:out`, targetHandle: `${p.id}--${n.id}:in`,
  })))
  const ports = new Map(ordered.map(n => [n.id, []]))
  for (const edge of edges) {
    ports.get(edge.source).push({ id: edge.sourceHandle, side: 'EAST', type: 'source' })
    ports.get(edge.target).push({ id: edge.targetHandle, side: 'WEST', type: 'target' })
  }
  const graph = await elk.layout({
    id: 'view',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.padding': '[top=100,left=100,bottom=100,right=100]',
      'elk.spacing.nodeNode': '120',
      'elk.spacing.componentComponent': '260',
      'elk.spacing.edgeNode': '60',
      'elk.spacing.edgeEdge': '26',
      'elk.layered.spacing.nodeNodeBetweenLayers': '260',
      'elk.layered.spacing.edgeNodeBetweenLayers': '60',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '26',
      'elk.layered.mergeEdges': 'false',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.randomSeed': '1',
    },
    children: ordered.map(node => {
      const ps = ports.get(node.id)
      const count = Math.max(ps.filter(p => p.type === 'source').length, ps.filter(p => p.type === 'target').length)
      return {
        id: node.id, width: NODE_WIDTH, height: Math.max(MIN_NODE_HEIGHT, (count + 1) * PORT_SPACING),
        layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE', 'elk.spacing.portPort': String(PORT_SPACING) },
        ports: ps.map(p => ({ id: p.id, width: 0, height: 0, layoutOptions: { 'elk.port.side': p.side } })),
      }
    }),
    edges: edges.map(e => ({ id: e.id, sources: [e.sourceHandle], targets: [e.targetHandle] })),
  })
  const routed = new Map(graph.edges.map(e => [e.id, e]))
  return {
    width: graph.width, height: graph.height,
    nodes: graph.children.map(n => ({
      id: n.id, x: n.x, y: n.y, width: n.width, height: n.height,
      ports: n.ports.map(p => ({ id: p.id, x: p.x, y: p.y, type: p.id.endsWith(':out') ? 'source' : 'target' })),
    })),
    edges: edges.map(e => {
      const sections = routed.get(e.id)?.sections
      if (sections?.length !== 1) throw new Error(`Missing route for ${e.id}`)
      const section = sections[0]
      return { ...e, points: [section.startPoint, ...(section.bendPoints ?? []), section.endPoint] }
    }),
  }
}
