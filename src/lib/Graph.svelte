<script lang="ts">
  import { SvelteFlow, Background, BackgroundVariant, MiniMap, type Node, type Edge, type Viewport, MarkerType } from '@xyflow/svelte'
  import { Plus, Minus, Maximize, LocateFixed } from '@lucide/svelte'
  import '@xyflow/svelte/dist/style.css'
  import CapabilityNode from './CapabilityNode.svelte'
  import { layoutGraph } from './graph.js'
  import { domainInfo, relations } from './config'
  import type { Capability, WikipediaEntry } from './types'

  let { items, selected, media, select, resetToken = 0 }: {
    items: Capability[]; selected: string; media: Record<string, WikipediaEntry>; select: (id: string) => void; resetToken?: number
  } = $props()
  const nodeTypes = { capability: CapabilityNode }
  let nodes = $state.raw<Node[]>([])
  let edges = $state.raw<Edge[]>([])
  let viewport = $state<Viewport>({ x: 50, y: 50, zoom: 0.85 })
  let width = $state(800)
  let height = $state(600)
  let positions = $derived(layoutGraph(items) as Map<string, { x: number; y: number }>)

  $effect(() => {
    nodes = items.map(entry => ({ id: entry.id, type: 'capability', position: positions.get(entry.id)!,
      data: { entry, media: media[entry.id], active: entry.id === selected, select },
      width: 204, height: 144, draggable: false, connectable: false, selectable: false, focusable: false }))
    const ids = new Set(items.map(n => n.id))
    edges = items.flatMap(n => n.parents.filter(p => ids.has(p.id)).map(p => {
      const active = n.id === selected || p.id === selected
      return { id: `${p.id}--${n.id}`, source: p.id, target: n.id, type: 'smoothstep',
        style: `stroke: ${active ? relations[p.type].color : '#5c6258'}; stroke-width: ${active ? 2.5 : 1.4}; opacity: ${active ? 1 : .65}; ${p.type === 'enabler' ? 'stroke-dasharray: 7 5;' : p.type === 'influence' ? 'stroke-dasharray: 2 5;' : ''}`,
        markerEnd: { type: MarkerType.ArrowClosed, color: active ? relations[p.type].color : '#5c6258', width: 15, height: 15 },
        selectable: false, focusable: false }
    }))
  })
  function center() {
    const p = positions.get(selected) ?? positions.get(items[0]?.id)
    if (p) viewport = { x: width / 2 - (p.x + 102) * .9, y: height / 2 - (p.y + 72) * .9, zoom: .9 }
  }
  $effect(() => {
    positions; selected; resetToken
    center()
  })
  function zoom(factor: number) {
    const next = Math.max(.06, Math.min(1.8, viewport.zoom * factor))
    const ratio = next / viewport.zoom
    viewport = { x: width / 2 - (width / 2 - viewport.x) * ratio, y: height / 2 - (height / 2 - viewport.y) * ratio, zoom: next }
  }
  function fit() {
    const points = [...positions.values()]
    if (!points.length) return
    const minX = Math.min(...points.map(p => p.x)) - 70
    const minY = Math.min(...points.map(p => p.y)) - 70
    const maxX = Math.max(...points.map(p => p.x)) + 274
    const maxY = Math.max(...points.map(p => p.y)) + 214
    const z = Math.max(.06, Math.min(1, width / (maxX - minX), height / (maxY - minY)))
    viewport = { x: (width - (maxX + minX) * z) / 2, y: (height - (maxY + minY) * z) / 2, zoom: z }
  }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height}>
  <SvelteFlow {nodes} {edges} {nodeTypes} bind:viewport colorMode="dark" minZoom={.06} maxZoom={1.8}
    nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKey={[]}
    onlyRenderVisibleElements={true} zoomOnDoubleClick={false} preventScrolling={true}>
    <Background variant={BackgroundVariant.Dots} gap={24} size={1} bgColor="#222623" patternColor="#444a40" />
    <MiniMap pannable zoomable position="bottom-right" nodeColor={(node) => domainInfo[(node.data.entry as Capability).domain].color}
      bgColor="#1b1f1c" maskColor="rgba(13,16,13,.7)" ariaLabel="Technology tree overview" />
  </SvelteFlow>
  <div class="graph-controls">
    <button onclick={() => zoom(1.25)} aria-label="Zoom in" title="Zoom in"><Plus size={18} /></button>
    <span>{Math.round(viewport.zoom * 100)}%</span>
    <button onclick={() => zoom(.8)} aria-label="Zoom out" title="Zoom out"><Minus size={18} /></button>
    <i></i>
    <button onclick={fit} aria-label="Fit visible tree" title="Fit visible tree"><Maximize size={17} /></button>
    <button onclick={center} aria-label="Center selected capability" title="Center selected capability"><LocateFixed size={18} /></button>
  </div>
  <span class="pan-hint">Drag to explore <span>·</span> Scroll to zoom</span>
</div>
