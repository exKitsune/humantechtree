<script lang="ts">
  import { BaseEdge } from '@xyflow/svelte'
  import type { Point } from './types'
  let { id, points, style, markerEnd }: { id: string; points: Point[]; style: string; markerEnd: string } = $props()
  let path = $derived.by(() => {
    if (!points?.length) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1], b = points[i], c = points[i + 1]
      const before = Math.hypot(b.x - a.x, b.y - a.y), after = Math.hypot(c.x - b.x, c.y - b.y)
      const r = Math.min(8, before / 2, after / 2)
      if (!r) continue
      d += ` L ${b.x + (a.x-b.x)*r/before} ${b.y + (a.y-b.y)*r/before}`
      d += ` Q ${b.x} ${b.y} ${b.x + (c.x-b.x)*r/after} ${b.y + (c.y-b.y)*r/after}`
    }
    const end = points[points.length - 1]
    return `${d} L ${end.x} ${end.y}`
  })
</script>

<!-- A small break at an unavoidable crossing makes it clear that the two
     connections cross each other rather than join into a shared connection. -->
<path d={path} fill="none" stroke="#222623" stroke-width="8" stroke-linejoin="round" pointer-events="none" aria-hidden="true" />
<BaseEdge {id} {path} {style} {markerEnd} interactionWidth={0} />
