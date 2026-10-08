<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { SvelteFlow, ViewportPortal, type Viewport } from '@xyflow/svelte'
  import { Plus, Minus, Maximize, LocateFixed } from '@lucide/svelte'
  import '@xyflow/svelte/dist/style.css'
  import CapabilityNode from './CapabilityNode.svelte'
  import ViewportController from './ViewportController.svelte'
  import { createLayoutClient } from './layout-client.js'
  import { createScene, planFrame, hitTest, linkDestination } from './scene.js'
  import { drawScene, drawOverview } from './draw-scene.js'
  import { contentExtent, clampViewport } from './viewport.js'
  import { domainInfo, relations } from './config'
  import { categoryInfo } from './categories.js'
  import type { Capability, WikipediaEntry, GraphLayout, LayoutNode, TimeBand, Domain, CategoryRegion } from './types'

  let { items, selected, media, select, resetToken = 0, fitToContents = false }: {
    items: Capability[]; selected: string; media: Record<string, WikipediaEntry>; select: (id: string) => void; resetToken?: number; fitToContents?: boolean
  } = $props()
  let layoutClient = $state.raw<ReturnType<typeof createLayoutClient> | null>(null)
  let scene = $state.raw<ReturnType<typeof createScene> | null>(null)
  let arranging = $state(true)
  let layoutError = $state('')
  let hoveredLink = $state.raw<GraphLayout['edges'][number] | null>(null)
  let linkLabel = $derived(hoveredLink && scene ? `Follow to ${scene.byId.get(linkDestination(hoveredLink, selected))?.entry.title ?? ''}` : '')
  let latestRequest = 0
  let viewport = $state<Viewport>({ x: 50, y: 50, zoom: .85 })
  let requestedViewport = $state.raw<Viewport | null>(null)
  let flowReady = $state(false)
  const AXIS_HEIGHT = 54
  let width = $state(800), outerHeight = $state(600)
  let height = $derived(Math.max(1, outerHeight - AXIS_HEIGHT))
  let graphElement: HTMLDivElement
  let canvas = $state<HTMLCanvasElement>()
  let overview = $state<HTMLCanvasElement>()
  let panExtent = $derived(contentExtent(scene?.layout ?? { nodes: [], edges: [] }) as [[number, number], [number, number]])
  let minZoom = $derived(Math.max(.000001, Math.min(.06, width / (scene?.layout.width || 1), Math.max(80, height - 140) / (scene?.layout.height || 1)) * .8))
  let frame = $derived(scene ? planFrame(scene, viewport, width, height, selected) : null)
  let bandLabels: (GraphLayout['bands'][number] & { screenY: number })[] = $derived((scene?.layout.bands ?? []).flatMap((band: GraphLayout['bands'][number]) => {
    const y = band.y * viewport.zoom + viewport.y, h = band.height * viewport.zoom
    return y + h >= 26 && y < height && h >= 18 ? [{ ...band, screenY: AXIS_HEIGHT + Math.max(8, y + 3) }] : []
  }))
  let categoryLabels: (CategoryRegion & { domain: Domain; label: string; screenY: number })[] = $derived((scene?.layout.bands ?? []).flatMap((band: GraphLayout['bands'][number]) => {
    const branchLabel = bandLabels.find(label => label.id === band.id)
    return (band.categories ?? []).flatMap(group => {
      const y = group.y * viewport.zoom + viewport.y, h = group.height * viewport.zoom
      const screenY = Math.max(AXIS_HEIGHT + 32, AXIS_HEIGHT + y + 4, (branchLabel?.screenY ?? 0) + 24)
      return h >= 44 && screenY + 22 < AXIS_HEIGHT + Math.min(height, y + h)
        ? [{ ...group, domain: band.id, label: group.category ? categoryInfo[group.category].label : 'Other capabilities', screenY }] : []
    })
  }))
  const clipPeriod = (period: { x: number; width: number }) => {
    const left = Math.max(0, period.x * viewport.zoom + viewport.x)
    const right = Math.min(width, (period.x + period.width) * viewport.zoom + viewport.x)
    return { left, width: Math.max(0, right - left) }
  }
  let timeLabels = $derived((scene?.layout.timeBands ?? []).map((era: TimeBand) => ({
    ...era, screen: clipPeriod(era),
    subdivisions: era.subdivisions.map(period => ({ ...period, screen: clipPeriod(period) }))
      .filter(period => period.screen.width >= 72),
  })).filter((era: TimeBand & { screen: { width: number } }) => era.screen.width > 0))

  function resetClient() { layoutClient?.destroy(); layoutClient = createLayoutClient() }
  onMount(() => {
    resetClient()
    return () => { latestRequest++; layoutClient?.destroy() }
  })
  $effect(() => {
    if (!layoutClient) return
    arranging = true; layoutError = ''
    const pendingItems = items, request = ++latestRequest
    layoutClient.layout(items).then((result: unknown) => {
      if (request !== latestRequest) return
      scene = createScene(result as GraphLayout, pendingItems)
      arranging = false
    }).catch((error: Error) => {
      if (request !== latestRequest) return
      console.error('Layout failed:', error); layoutError = error.message; arranging = false
    })
  })
  $effect(() => {
    const c = canvas, mini = overview, s = scene, f = frame, v = viewport, w = width, h = height, id = selected, hover = hoveredLink?.id
    if (!c || !s || !f) return
    const raf = requestAnimationFrame(() => {
      const start = performance.now()
      drawScene(c, s, f, v, w, h, id, domainInfo, relations, hover)
      if (mini) drawOverview(mini, s, v, w, h, domainInfo)
      c.dataset.drawMs = (performance.now() - start).toFixed(2)
    })
    return () => cancelAnimationFrame(raf)
  })
  function setView(next: Viewport) { requestedViewport = clampViewport(next, width, height, panExtent) }
  function focusNode(node: LayoutNode) {
    setView({ x: width / 2 - (node.x + node.width / 2) * .9, y: height / 2 - (node.y + node.height / 2) * .9, zoom: .9 })
  }
  function center() {
    if (!flowReady) return
    const node = scene?.byId.get(selected) ?? scene?.nodes[0]
    if (node) focusNode(node)
  }
  $effect(() => {
    width; height
    untrack(() => { if (flowReady) setView(viewport) })
  })
  let centeredScene: typeof scene = null
  $effect(() => {
    scene; selected; resetToken; flowReady; fitToContents
    untrack(() => {
      if (!flowReady || !scene) return
      if (fitToContents && scene !== centeredScene) fit()
      else center()
      centeredScene = scene
    })
  })
  function zoom(factor: number) {
    const next = Math.max(minZoom, Math.min(1.8, viewport.zoom * factor)), ratio = next / viewport.zoom
    setView({ x: width / 2 - (width / 2 - viewport.x) * ratio, y: height / 2 - (height / 2 - viewport.y) * ratio, zoom: next })
  }
  function fitRect(x: number, y: number, w: number, h: number, maximum = 1) {
    const z = Math.max(minZoom, Math.min(maximum, Math.max(80, width - 70) / (w + 100), Math.max(80, height - 140) / (h + 100)))
    setView({ x: width / 2 - (x + w / 2) * z, y: height / 2 - (y + h / 2) * z, zoom: z })
  }
  function fit() { if (scene) fitRect(0, 0, scene.layout.width, scene.layout.height) }
  $effect(() => { scene; viewport; selected; arranging; width; height; hoveredLink = null })
  function pointerHit(event: MouseEvent) {
    if (!scene || !frame || arranging) return null
    const bounds = graphElement.getBoundingClientRect()
    const point = { x: (event.clientX - bounds.left - viewport.x) / viewport.zoom, y: (event.clientY - bounds.top - AXIS_HEIGHT - viewport.y) / viewport.zoom }
    return hitTest(scene, frame, point, viewport.zoom)
  }
  function hoverLink(event: PointerEvent) {
    hoveredLink = event.buttons ? null : pointerHit(event)?.edge ?? null
  }
  function pick({ event }: { event: MouseEvent }) {
    if (!scene) return
    const hit = pointerHit(event)
    hoveredLink = null
    if (hit?.node) { select(hit.node.id); focusNode(hit.node) }
    else if (hit?.edge) {
      const node = scene.byId.get(linkDestination(hit.edge, selected))
      if (node) { select(node.id); focusNode(node) }
    }
    else if (hit?.cluster) {
      const b = hit.cluster
      if (b.count === 1) {
        const node = scene.nodeIndex.query({ x: b.minX, y: b.minY, width: b.maxX - b.minX, height: b.maxY - b.minY }, 1)[0]
        if (node) { select(node.id); focusNode(node) }
      } else fitRect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY)
    }
  }
  function miniPick(event: MouseEvent) {
    if (!scene || !overview) return
    const bounds = overview.getBoundingClientRect()
    const scale = Math.min(140 / scene.layout.width, 78 / scene.layout.height)
    const x = (event.clientX - bounds.left - (150 - scene.layout.width * scale) / 2) / scale
    const y = (event.clientY - bounds.top - (88 - scene.layout.height * scale) / 2) / scale
    setView({ ...viewport, x: width / 2 - x * viewport.zoom, y: height / 2 - y * viewport.zoom })
  }
  function keyboard(event: KeyboardEvent) {
    if (event.target !== graphElement) return
    const delta: Record<string, [number, number]> = { ArrowLeft: [120, 0], ArrowRight: [-120, 0], ArrowUp: [0, 120], ArrowDown: [0, -120] }
    if (delta[event.key]) { event.preventDefault(); const [x, y] = delta[event.key]; setView({ ...viewport, x: viewport.x + x, y: viewport.y + y }) }
    else if (event.key === '+' || event.key === '=') zoom(1.25)
    else if (event.key === '-') zoom(.8)
    else if (event.key === 'Home') { event.preventDefault(); fit() }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (This graph implements keyboard pan/zoom and exposes named button controls.) -->
<div class="graph" bind:this={graphElement} bind:clientWidth={width} bind:clientHeight={outerHeight} aria-busy={arranging}
  role="application" aria-label="Technology tree canvas. Arrow keys pan, plus and minus zoom, Home fits the tree. Click a connection to follow it. Search above to find any capability."
  tabindex="0" onkeydown={keyboard} data-lod={frame?.mode} data-rendered-cards={frame?.cards.length ?? 0} data-rendered-marks={frame?.marks.length ?? 0} data-rendered-edges={frame?.edges.length ?? 0}>
  <!-- svelte-ignore a11y_no_static_element_interactions (Pointer hover only; pane clicks handle navigation and sidebar buttons provide keyboard access.) -->
  <div class="graph-surface" class:link-hovered={!!hoveredLink} title={linkLabel || undefined}
    onpointermove={hoverLink} onpointerleave={() => hoveredLink = null} onpointerdown={() => hoveredLink = null}>
  <canvas bind:this={canvas} class="graph-raster" aria-hidden="true"></canvas>
  <SvelteFlow bind:viewport colorMode="dark" {minZoom} maxZoom={1.8} oninit={() => flowReady = true}
    nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKey={[]}
    zoomOnDoubleClick={false} preventScrolling={true} onpaneclick={pick}
    panOnDrag={true} panOnScroll={true} zoomOnScroll={false} zoomOnPinch={true} paneClickDistance={5}
    translateExtent={panExtent}>
    <ViewportController target={requestedViewport} extent={panExtent} {minZoom} />
    <ViewportPortal target="front">
      {#each frame?.cards ?? [] as node (node.id)}
        <div class="lod-card nodrag nopan" style:transform={`translate(${node.x}px, ${node.y}px)`}>
          <CapabilityNode entry={node.entry} media={media[node.id]} active={node.id === selected} {select} ports={node.ports} height={node.height} />
        </div>
      {/each}
    </ViewportPortal>
  </SvelteFlow>
  </div>
  <nav class="time-axis" aria-label="Era bands and date subdivisions">
    {#each timeLabels as era (era.id)}
      <button class="time-era-label" style:left={`${era.screen.left}px`} style:width={`${era.screen.width}px`}
        title={`${era.label} · ${era.count.toLocaleString()} capabilities. Width adapts to population; click to fit this era.`}
        onclick={() => fitRect(era.x, 0, era.width, scene!.layout.height)}>
        <span>{era.label}</span>{#if era.screen.width >= 150}<small>{era.count.toLocaleString()}</small>{/if}
      </button>
      {#each era.subdivisions as period (period.id)}
        <button class="period-label" style:left={`${period.screen.left}px`} style:width={`${period.screen.width}px`}
          title={`${period.label} · ${period.count.toLocaleString()} capabilities. Click to fit this period.`}
          onclick={() => fitRect(period.x, 0, period.width, scene!.layout.height)}>{period.label}</button>
      {/each}
    {/each}
  </nav>
  <div class="band-labels" aria-label="Visible branch bands">
    {#each bandLabels as band (band.id)}
      <button class="band-label" style:top={`${band.screenY}px`} style:--domain={domainInfo[band.id].color}
        onclick={() => fitRect(0, band.y, scene!.layout.width, band.height)} title={`Fit ${domainInfo[band.id].label} band`}>
        {domainInfo[band.id].label}<small>{band.count.toLocaleString()}</small>
      </button>
    {/each}
  </div>
  <div class="category-labels" aria-label="Visible categories within branches">
    {#each categoryLabels as group (group.id)}
      <button class="category-label" style:top={`${group.screenY}px`} style:--domain={domainInfo[group.domain].color}
        title={`Fit ${group.label} · ${group.count} capabilities in this view`}
        onclick={() => fitRect(group.x, group.y, group.width, group.height)}>
        <span>{group.label}</span><small>{group.count.toLocaleString()}</small>
      </button>
    {/each}
  </div>
  {#if arranging}<div class="layout-status" role="status">Arranging {items.length.toLocaleString()} capabilities…</div>{/if}
  {#if layoutError}<div class="layout-status layout-error" role="alert">Unable to arrange this view.<button onclick={resetClient}>Try again</button></div>{/if}
  <div class="lod-status" aria-live="polite">{frame?.mode === 'density' ? 'Branch density · click a group to zoom' : frame?.mode === 'nodes' ? 'Simplified nodes · click to explore' : 'Detailed cards'}{#if frame?.mode === 'density'}<span>Zoom in for connections</span>{:else if frame?.edgeLimited}<span>Dense connections · zoom in for more</span>{:else if frame?.selectedOnly}<span>Selected connections</span>{/if}</div>
  <button class="canvas-overview" aria-label="Technology tree overview. Click to pan; press Enter to fit the tree." onclick={miniPick} onkeydown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fit() } }}>
    <canvas bind:this={overview} style="width:150px;height:88px" aria-hidden="true"></canvas>
  </button>
  <div class="graph-controls">
    <button onclick={() => zoom(1.25)} aria-label="Zoom in" title="Zoom in"><Plus size={18} /></button>
    <span>{viewport.zoom < .1 ? (viewport.zoom * 100).toPrecision(2) : Math.round(viewport.zoom * 100)}%</span>
    <button onclick={() => zoom(.8)} aria-label="Zoom out" title="Zoom out"><Minus size={18} /></button>
    <i></i>
    <button onclick={fit} aria-label="Fit visible tree" title="Fit visible tree"><Maximize size={17} /></button>
    <button onclick={center} aria-label="Center selected capability" title="Center selected capability"><LocateFixed size={18} /></button>
  </div>
  <span class="pan-hint">{#if linkLabel}{linkLabel}{:else}Click a link to follow <span>·</span> Scroll or drag to pan{/if} <span>·</span> Pinch or Ctrl/⌘ + scroll to zoom</span>
</div>
