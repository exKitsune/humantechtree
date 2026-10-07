<script lang="ts">
  import { onMount } from 'svelte'
  import { SvelteFlow, Background, BackgroundVariant, MiniMap, ViewportPortal, type Node, type Viewport } from '@xyflow/svelte'
  import { Plus, Minus, Maximize, LocateFixed } from '@lucide/svelte'
  import '@xyflow/svelte/dist/style.css'
  import CapabilityNode from './CapabilityNode.svelte'
  import RoutedEdge from './RoutedEdge.svelte'
  import ViewportController from './ViewportController.svelte'
  import { createLayoutClient } from './layout-client.js'
  import { routeIntersectsRect } from './layout.js'
  import { domainInfo, relations } from './config'
  import type { Capability, WikipediaEntry, GraphLayout } from './types'

  let { items, selected, media, select, resetToken = 0 }: {
    items: Capability[]; selected: string; media: Record<string, WikipediaEntry>; select: (id: string) => void; resetToken?: number
  } = $props()
  const nodeTypes = { capability: CapabilityNode }
  const arrows = { muted: '#697161', foundation: relations.foundation.color, enabler: relations.enabler.color, influence: relations.influence.color }
  let layoutClient = $state.raw<ReturnType<typeof createLayoutClient> | null>(null)
  let layout = $state.raw<GraphLayout>({ nodes: [], edges: [], width: 0, height: 0 })
  let renderedItems = $state.raw<Capability[]>([])
  let arranging = $state(true)
  let layoutError = $state('')
  let retry = $state(0)
  let latestRequest = 0
  let nodes = $state.raw<Node[]>([])
  let edges = $state.raw<(GraphLayout['edges'][number] & { active: boolean; style: string; markerEnd: string })[]>([])
  let viewport = $state<Viewport>({ x: 50, y: 50, zoom: 0.85 })
  let requestedViewport = $state.raw<Viewport | null>(null)
  let flowReady = $state(false)
  let width = $state(800)
  let height = $state(600)
  let positions = $derived(new Map(layout.nodes.map(n => [n.id, n])))
  let minZoom = $derived(Math.max(.001, Math.min(.06, width / (layout.width || 1), height / (layout.height || 1)) * .8))
  let visibleEdges = $derived(edges.filter(edge => routeIntersectsRect(edge.points, {
    x: (-viewport.x - 40) / viewport.zoom, y: (-viewport.y - 40) / viewport.zoom,
    width: (width + 80) / viewport.zoom, height: (height + 80) / viewport.zoom,
  })))

  onMount(() => {
    const client = createLayoutClient()
    layoutClient = client
    return () => { latestRequest++; client.destroy() }
  })
  $effect(() => {
    retry
    if (!layoutClient) return
    arranging = true
    layoutError = ''
    const pendingItems = items
    const request = ++latestRequest
    layoutClient.layout(items).then((result: GraphLayout) => {
      if (request !== latestRequest) return
      renderedItems = pendingItems
      layout = result
      arranging = false
    }).catch((error: Error) => {
      if (request !== latestRequest) return
      console.error('Layout failed:', error)
      layoutError = error.message
      arranging = false
    })
  })
  $effect(() => {
    const index = new Map(renderedItems.map(n => [n.id, n]))
    nodes = layout.nodes.map(placed => {
      const entry = index.get(placed.id)!
      return { id: entry.id, type: 'capability', position: { x: placed.x, y: placed.y },
        data: { entry, media: media[entry.id], active: entry.id === selected, select, ports: placed.ports, height: placed.height },
        width: placed.width, height: placed.height, draggable: false, connectable: false, selectable: false, focusable: false }
    })
    edges = layout.edges.map(route => {
      const parent = index.get(route.target)!.parents.find(p => p.id === route.source)!
      const active = route.target === selected || route.source === selected
      const color = active ? relations[parent.type].color : '#697161'
      return { ...route, active,
        style: `stroke: ${color}; stroke-width: ${active ? 2.5 : 1.5}; opacity: ${active ? 1 : .8}; ${parent.type === 'enabler' ? 'stroke-dasharray: 7 5;' : parent.type === 'influence' ? 'stroke-dasharray: 2 5;' : ''}`,
        markerEnd: `url(#route-arrow-${active ? parent.type : 'muted'})` }
    }).sort((a, b) => Number(a.active) - Number(b.active))
  })
  function center() {
    if (!flowReady) return
    const p = positions.get(selected) ?? layout.nodes[0]
    if (p) requestedViewport = { x: width / 2 - (p.x + p.width / 2) * .9, y: height / 2 - (p.y + p.height / 2) * .9, zoom: .9 }
  }
  $effect(() => { positions; selected; resetToken; center() })
  function zoom(factor: number) {
    const next = Math.max(minZoom, Math.min(1.8, viewport.zoom * factor))
    const ratio = next / viewport.zoom
    requestedViewport = { x: width / 2 - (width / 2 - viewport.x) * ratio, y: height / 2 - (height / 2 - viewport.y) * ratio, zoom: next }
  }
  function fit() {
    if (!layout.nodes.length) return
    // Router bounds include long connections routed around intermediate layers.
    const z = Math.max(minZoom, Math.min(1, width / layout.width, height / layout.height))
    requestedViewport = { x: (width - layout.width * z) / 2, y: (height - layout.height * z) / 2, zoom: z }
  }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height} aria-busy={arranging}>
  <SvelteFlow {nodes} {nodeTypes} bind:viewport colorMode="dark" {minZoom} maxZoom={1.8}
    oninit={() => flowReady = true}
    nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKey={[]}
    onlyRenderVisibleElements={true} zoomOnDoubleClick={false} preventScrolling={true}
    panOnDrag={true} panOnScroll={true} zoomOnScroll={false} zoomOnPinch={true}
    translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}>
    <ViewportController target={requestedViewport} />
    <Background variant={BackgroundVariant.Dots} gap={24} size={1} bgColor="#222623" patternColor="#444a40" />
    <!-- Edge visibility must follow the routed path, not the endpoint cards. -->
    <ViewportPortal target="back" style="pointer-events: none;">
      <svg class="routed-connections" width="1" height="1" style="overflow: visible; position: absolute; pointer-events: none;" aria-hidden="true">
        <defs>
          {#each Object.entries(arrows) as [name, color]}
            <marker id={`route-arrow-${name}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={color} /></marker>
          {/each}
        </defs>
        {#each visibleEdges as edge (edge.id)}<RoutedEdge id={edge.id} points={edge.points} style={edge.style} markerEnd={edge.markerEnd} />{/each}
      </svg>
    </ViewportPortal>
    <MiniMap pannable zoomable position="bottom-right" nodeColor={(node) => domainInfo[(node.data.entry as Capability).domain].color}
      bgColor="#1b1f1c" maskColor="rgba(13,16,13,.7)" ariaLabel="Technology tree overview" />
  </SvelteFlow>
  {#if arranging}<div class="layout-status" role="status">Arranging {items.length.toLocaleString()} capabilities…</div>{/if}
  {#if layoutError}<div class="layout-status layout-error" role="alert">Unable to arrange this view.<button onclick={() => retry++}>Try again</button></div>{/if}
  <div class="graph-controls">
    <button onclick={() => zoom(1.25)} aria-label="Zoom in" title="Zoom in"><Plus size={18} /></button>
    <span>{viewport.zoom < .1 ? (viewport.zoom * 100).toFixed(1) : Math.round(viewport.zoom * 100)}%</span>
    <button onclick={() => zoom(.8)} aria-label="Zoom out" title="Zoom out"><Minus size={18} /></button>
    <i></i>
    <button onclick={fit} aria-label="Fit visible tree" title="Fit visible tree"><Maximize size={17} /></button>
    <button onclick={center} aria-label="Center selected capability" title="Center selected capability"><LocateFixed size={18} /></button>
  </div>
  <span class="pan-hint">Scroll or drag to pan <span>·</span> Pinch or Ctrl/⌘ + scroll to zoom</span>
</div>
