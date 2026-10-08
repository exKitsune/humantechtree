<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { Search, Network, ChevronRight, ChevronLeft, ChevronDown, X, ArrowUpRight, BookOpen, SlidersHorizontal, Info, Layers, Menu, RotateCcw, GitBranch, ImageOff } from '@lucide/svelte'
  import Graph from './lib/Graph.svelte'
  import ConnectionCard from './lib/ConnectionCard.svelte'
  import { connectionBetween, rememberView } from './lib/navigation.js'
  import { categories, categoryInfo, categoryFor, categoryGroups } from './lib/categories.js'
  import { domains, domainInfo, eras, relations, formatYear } from './lib/config'
  import { neighborhood, matchesFilters, searchNodes } from './lib/graph.js'
  import type { Capability, Catalog, WikipediaEntry, Domain, NavigationView, FollowedConnection, CameraSnapshot } from './lib/types'

  let catalog = $state.raw<Capability[]>([])
  let media = $state.raw<Record<string, WikipediaEntry>>({})
  let offlineIndex = $state.raw<Record<string, { found: boolean; archive?: string }>>({})
  let loading = $state(true)
  let error = $state('')
  let selectedId = $state('microscope')
  let focused = $state(true)
  let domain = $state<Domain | 'all'>('all')
  let eraId = $state('all')
  let category = $state('all')
  let query = $state('')
  let searchOpen = $state(false)
  let searchInput: HTMLInputElement
  let detailsOpen = $state(true)
  let sidebarOpen = $state(false)
  let aboutOpen = $state(false)
  let detailsTab = $state<'overview' | 'connections'>('overview')
  let resetToken = $state(0)
  let imageFailed = $state(false)
  let aboutDialog: HTMLDialogElement
  let searchIndex = $state(0)
  let graph = $state<ReturnType<typeof Graph>>()
  let detailScroll = $state<HTMLDivElement>()
  let expandedGroups = $state<string[]>([])
  let pastViews = $state.raw<NavigationView[]>([])
  let followedConnection = $state.raw<FollowedConnection | null>(null)
  let restoreView = $state.raw<{ token: number; viewport: CameraSnapshot | null } | null>(null)
  let restoredScroll = $state<number | null>(null)
  let restoreToken = 0
  let previousView = $derived(pastViews.at(-1))

  let index = $derived(new Map(catalog.map(n => [n.id, n])))
  let selected = $derived(index.get(selectedId))
  let selectedMedia = $derived(media[selectedId])
  let era = $derived(eras.find(e => e.id === eraId)!)
  let filtered = $derived(catalog.filter(n => matchesFilters(n, domain, era, category)))
  let visible = $derived(focused ? neighborhood(filtered, selectedId, 2) as Capability[] : filtered)
  let results = $derived(searchNodes(catalog, query).slice(0, 30) as Capability[])
  let children = $derived(catalog.filter(n => n.parents.some(p => p.id === selectedId)))
  let childGroups = $derived(categoryGroups(children) as { id: string; domain: Domain; category?: string; label?: string; nodes: Capability[] }[])
  let availableCategories = $derived(categories.filter(c => domain === 'all' || c.domain === domain))
  let categoryCounts = $derived(Object.fromEntries(categories.map(c => [c.id, catalog.filter(n => n.category === c.id).length])))
  let groupDevelopments = $derived(children.length > 6 || detailsTab === 'connections')
  let parents = $derived(selected?.parents.filter(p => index.has(p.id)) ?? [])
  let counts = $derived(Object.fromEntries(domains.map(d => [d.id, catalog.filter(n => n.domain === d.id).length])))
  let edgeCount = $derived(catalog.reduce((sum, n) => sum + n.parents.length, 0))
  let pictureCount = $derived(Object.values(media).filter(m => m.thumbnail).length)
  let offlineCount = $derived(Object.values(offlineIndex).filter(m => m.found).length)

  function readHash() {
    const id = new URLSearchParams(location.hash.slice(1)).get('node')
    if (id && index.has(id) && id !== selectedId) { saveView(); followedConnection = connectionBetween(index, selectedId, id); selectedId = id; domain = 'all'; eraId = 'all'; category = 'all'; detailsOpen = true; expandedGroups = [] }
  }
  async function load() {
    loading = true; error = ''
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/catalog.json`)
      if (!response.ok) throw new Error(`Catalog could not load (${response.status}).`)
      const data: Catalog = await response.json()
      if (!data.nodes.length) throw new Error('The catalog is being prepared. Please try again shortly.')
      catalog = data.nodes
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}data/wikipedia.json`)
        if (r.ok) media = await r.json()
      } catch { /* The tree remains usable without optional local media. */ }
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}data/offline-index.json`)
        if (r.ok) offlineIndex = await r.json()
      } catch { /* Reference matching status is optional. */ }
      const id = new URLSearchParams(location.hash.slice(1)).get('node')
      if (id && data.nodes.some(n => n.id === id)) selectedId = id
      else if (!data.nodes.some(n => n.id === selectedId)) selectedId = data.nodes[0].id
    } catch (e) { error = e instanceof Error ? e.message : 'Unable to load the catalog.' }
    finally { loading = false }
  }
  onMount(() => {
    detailsOpen = window.innerWidth > 800
    load()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  })
  $effect(() => { selectedId; imageFailed = false })
  $effect(() => { query; searchIndex = 0 })
  $effect(() => { if (aboutDialog) { if (aboutOpen && !aboutDialog.open) aboutDialog.showModal(); else if (!aboutOpen && aboutDialog.open) aboutDialog.close() } })
  $effect(() => {
    selectedId
    const element = detailScroll, top = restoredScroll
    if (element) untrack(() => { element.scrollTop = top ?? 0 })
  })
  function saveView() {
    pastViews = rememberView(pastViews, {
      label: focused ? selected?.title ?? selectedId : category !== 'all' ? categoryInfo[category].label : domain !== 'all' ? domainInfo[domain].label : 'All capabilities',
      selectedId, focused, domain, eraId, category, detailsTab, detailsOpen,
      expandedGroups, connection: followedConnection, viewport: graph?.captureView() ?? null,
      detailScroll: detailScroll?.scrollTop ?? 0,
    })
    restoreView = null; restoredScroll = null
  }
  function goBack() {
    const view = pastViews.at(-1)
    if (!view) return
    pastViews = pastViews.slice(0, -1)
    selectedId = view.selectedId; focused = view.focused; domain = view.domain; eraId = view.eraId; category = view.category
    detailsTab = view.detailsTab; detailsOpen = view.detailsOpen; expandedGroups = [...view.expandedGroups]
    followedConnection = view.connection; searchOpen = false; sidebarOpen = false
    restoredScroll = view.detailScroll; restoreView = { token: ++restoreToken, viewport: view.viewport }
    window.history.replaceState(null, '', `#${new URLSearchParams({ node: selectedId })}`)
  }
  function select(id: string, clearFilters = false, focus = false, connection = connectionBetween(index, selectedId, id)) {
    if (!index.has(id)) return
    if (id === selectedId && !clearFilters && !focus && !connection) { detailsOpen = true; resetToken++; return }
    saveView()
    followedConnection = connection
    if (id !== selectedId) expandedGroups = []
    selectedId = id; detailsOpen = true; searchOpen = false; query = ''; sidebarOpen = false
    if (clearFilters) { domain = 'all'; eraId = 'all'; category = 'all' }
    if (focus) focused = true
    location.hash = new URLSearchParams({ node: id }).toString()
  }
  function follow(id: string) { select(id, true, true) }
  function followEdge(source: string, target: string, destination: string) { select(destination, false, false, connectionBetween(index, source, target)) }
  function filterDomain(value: Domain | 'all') { saveView(); followedConnection = null; domain = value; category = 'all'; focused = false; sidebarOpen = false }
  function filterCategory(value: string) {
    saveView(); followedConnection = null; category = value
    if (value !== 'all') domain = categoryInfo[value].domain as Domain
    focused = false; sidebarOpen = false; resetToken++
  }
  function browseGroup(group: { category?: string; domain: string }) {
    if (group.category) filterCategory(group.category)
    else filterDomain(group.domain as Domain)
    eraId = 'all'
  }
  function toggleGroup(id: string) { expandedGroups = expandedGroups.includes(id) ? expandedGroups.filter(value => value !== id) : [...expandedGroups, id] }
  function filterEra(value: string) { saveView(); followedConnection = null; eraId = value; focused = false }
  function reset() { saveView(); followedConnection = null; domain = 'all'; eraId = 'all'; category = 'all'; focused = false; resetToken++ }
  function focusSelection() { saveView(); followedConnection = null; domain = 'all'; eraId = 'all'; category = 'all'; focused = true; resetToken++ }
  function fullTree() { if (!focused) return; saveView(); followedConnection = null; focused = false }
  function keyboard(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (event.key === 'Escape') { searchOpen = false; sidebarOpen = false; if (!aboutOpen) detailsOpen = false }
    if ((event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) || ((event.ctrlKey || event.metaKey) && event.key === 'k')) {
      event.preventDefault(); searchInput?.focus(); searchOpen = true
    }
  }
  function searchKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); searchIndex = Math.min(searchIndex + 1, results.length - 1) }
    if (event.key === 'ArrowUp') { event.preventDefault(); searchIndex = Math.max(0, searchIndex - 1) }
    if (event.key === 'Enter' && results[searchIndex]) { event.preventDefault(); select(results[searchIndex].id, true, true) }
  }
  function wikiUrl(node: Capability) { return media[node.id]?.url ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(node.wiki.replaceAll(' ', '_'))}` }
</script>

<svelte:window onkeydown={keyboard} />

<div class="app-shell">
  <header class="app-header">
    <button class="mobile-menu icon-button" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle categories"><Menu size={22} /></button>
    <a href="./" class="brand" onclick={(event) => { event.preventDefault(); reset() }} aria-label="Humanity home">
      <span class="brand-mark"><Network size={24} strokeWidth={1.7} /></span>
      <span>HUMANITY<small>THE TECHNOLOGY TREE</small></span>
    </a>
    <div class="header-divider"></div>
    <span class="header-caption">Everything builds on something.</span>
    <div class="search-wrap">
      <div class="search-field"><Search size={17} /><input bind:this={searchInput} bind:value={query}
        onfocus={() => searchOpen = true} onkeydown={searchKey} placeholder="Find a discovery, tool, or idea…" aria-label="Search all capabilities" role="combobox"
        aria-expanded={searchOpen && query.trim().length > 0} aria-controls="search-results" aria-autocomplete="list" aria-activedescendant={results[searchIndex] ? `result-${results[searchIndex].id}` : undefined} />
        {#if query}<button onclick={() => { query = ''; searchInput.focus() }} aria-label="Clear search"><X size={15} /></button>{:else}<kbd>/</kbd>{/if}
      </div>
      {#if searchOpen && query.trim()}
        <div class="search-results" id="search-results" role="listbox" aria-label="Search results">
          <div class="result-heading">SEARCH ALL {catalog.length.toLocaleString()} CAPABILITIES</div>
          {#each results as result, i}
            {@const info = domainInfo[result.domain]}
            <button role="option" aria-selected={i === searchIndex} id={`result-${result.id}`} class:highlighted={i === searchIndex}
              onclick={() => { select(result.id, true, true) }}><info.icon size={18} style={`color:${info.color}`} /><span><strong>{result.title}</strong><small>{info.label} · c. {formatYear(result.year)}</small></span><ChevronRight size={15} /></button>
          {:else}<p class="empty-search">No matches. Try “microscope”, “treaty”, or “lathe”.</p>{/each}
        </div>
      {/if}
    </div>
    <button class="header-about" onclick={() => aboutOpen = true}><Info size={17} /><span>About the tree</span></button>
  </header>

  <div class="workspace">
    <aside class="sidebar" class:mobile-open={sidebarOpen} aria-label="Tree filters">
      <div class="sidebar-top"><span class="eyebrow">EXPLORE THE TREE</span><button class="mobile-menu icon-button" onclick={() => sidebarOpen = false} aria-label="Close categories"><X size={18} /></button></div>
      <button class="domain-button all-domains" class:chosen={domain === 'all'} aria-pressed={domain === 'all'} onclick={() => filterDomain('all')}><Network size={18} /><span>All capabilities</span><small>{catalog.length.toLocaleString()}</small></button>
      <div class="sidebar-label">BRANCHES OF HUMANITY</div>
      <nav class="domain-list">
        {#each domains as item}<button class="domain-button" class:chosen={domain === item.id} aria-pressed={domain === item.id} onclick={() => filterDomain(item.id)} style:--domain={item.color}>
          <item.icon size={18} strokeWidth={1.6} /><span>{item.label}</span><small>{counts[item.id] || 0}</small></button>{/each}
      </nav>
      {#if availableCategories.length}
        <label class="sidebar-label" for="category-filter">CATEGORIES</label>
        <select id="category-filter" class="category-filter" value={category} onchange={event => filterCategory(event.currentTarget.value)}>
          <option value="all">All categories</option>
          {#each availableCategories as item}<option value={item.id}>{item.label} ({categoryCounts[item.id] || 0})</option>{/each}
        </select>
      {/if}
      <div class="sidebar-rule"></div>
      <div class="sidebar-label">A FEW STARTING POINTS</div>
      <div class="starting-points">
        {#each [['microscope', 'Seeing the invisible'], ['precision-machining', 'Machines making machines'], ['cities', 'Living together'], ['internet', 'A connected world']] as [id, label]}
          <button onclick={() => { select(id, true, true) }}><span>{label}</span><ChevronRight size={14} /></button>
        {/each}
      </div>
      <div class="sidebar-bottom"><span class="edition-label">HUMANITY / FIRST EDITION</span><p>A connected history of what we<br />learned to understand, make,<br />and organize.</p><button onclick={() => aboutOpen = true}><BookOpen size={15} /> How to read this tree</button></div>
    </aside>

    <main class="main-workspace">
      {#if previousView}
        <div class="navigation-history"><button onclick={goBack} title="Restore previous selection, filters, position, and zoom"><ChevronLeft size={16} />Back to {previousView.label}</button></div>
      {:else if category !== 'all' && selected}
        <div class="navigation-history"><button onclick={focusSelection}><ChevronLeft size={16} />Return to {selected.title}’s connections</button></div>
      {/if}
      <div class="tree-heading">
        <div><div class="breadcrumb view-context"><span>{focused && selected ? `Around ${selected.title}` : category !== 'all' ? categoryInfo[category].label : domain === 'all' ? 'All branches of humanity' : domainInfo[domain].label}</span><span>· {visible.length.toLocaleString()} capabilities</span>{#if domain !== 'all' || eraId !== 'all' || category !== 'all'}<button onclick={reset} aria-label="Reset filters" title="Reset filters"><RotateCcw size={12} /></button>{/if}</div><h1>The technology tree<span class="beta-label">EXPLORATORY ATLAS</span></h1></div>
        <div class="view-switch" aria-label="Tree view"><button class:active={!focused} aria-pressed={!focused} onclick={fullTree}><Layers size={15} />Full tree</button><button class:active={focused} aria-pressed={focused} onclick={focusSelection}><GitBranch size={15} />Connections</button></div>
      </div>
      <div class="era-bar"><span class="era-label"><SlidersHorizontal size={14} />ERA</span><div class="era-options">{#each eras as item}<button class:active={eraId === item.id} aria-pressed={eraId === item.id} onclick={() => filterEra(item.id)}>{item.label}</button>{/each}</div></div>
      <div class="canvas-area">
        {#if loading}<div class="canvas-message"><Network size={36} /><h2>Opening the atlas</h2><p>Loading the local catalog…</p></div>
        {:else if error}<div class="canvas-message"><Info size={32} /><h2>Unable to open the tree</h2><p>{error}</p><button class="primary-button" onclick={load}>Try again</button></div>
        {:else if visible.length === 0}<div class="canvas-message"><Search size={32} /><h2>No capabilities in this view</h2><p>Try another era or branch.</p><button class="primary-button" onclick={reset}>Reset filters</button></div>
        {:else}
          <Graph bind:this={graph} {restoreView} {followEdge} items={visible} selected={selectedId} {media} {select} {resetToken} fitToContents={category !== 'all'} />
        {/if}
        {#if selected && !detailsOpen}<button class="reopen-detail" onclick={() => detailsOpen = true}><Info size={16} />{selected.title}<ChevronLeft size={15} /></button>{/if}
      </div>
      <footer class="tree-footer"><div class="legend">{#each Object.entries(relations) as [id, relation]}<span title={relation.description}><i class={id} style:--relation={relation.color}></i>{relation.label}</span>{/each}</div><button onclick={() => aboutOpen = true}>{edgeCount.toLocaleString()} connections <Info size={13} /></button></footer>
    </main>

    {#if selected && detailsOpen}
      {@const info = domainInfo[selected.domain]}
      <aside class="detail-panel" aria-label={`Details for ${selected.title}`}>
        <div class="detail-top"><span><info.icon size={15} style={`color:${info.color}`} />{info.label}</span><button class="icon-button" onclick={() => detailsOpen = false} aria-label="Close details"><X size={18} /></button></div>
        <div class="detail-scroll" bind:this={detailScroll}>
          {#if followedConnection}
            <section class="followed-connection" aria-label="Connection you followed" aria-live="polite">
              <span class="eyebrow">CONNECTION YOU FOLLOWED</span>
              <strong>{index.get(followedConnection.source)?.title} → {index.get(followedConnection.target)?.title}</strong>
              <small style:color={relations[followedConnection.type].color}>{relations[followedConnection.type].label}</small>
              <p>{followedConnection.reason}</p>
              {#if previousView}<button onclick={goBack}><ChevronLeft size={14} />Back to {previousView.label}</button>{/if}
            </section>
          {/if}
          <div class="detail-image" style:--domain={info.color}>
            {#if selectedMedia?.thumbnail && !imageFailed}<img src={selectedMedia.thumbnail} alt={selectedMedia.imageDescription || selected.title} onerror={() => imageFailed = true} />
            {:else}<info.icon size={74} strokeWidth={1} /><span>{imageFailed ? 'Image unavailable' : 'Archive image pending'}</span>{/if}
            <span class="kind-label">{selected.kind}</span>
          </div>
          {#if selectedMedia?.imagePage && !imageFailed}<a class="image-credit" href={selectedMedia.imagePage} target="_blank" rel="noreferrer">{selectedMedia.imageArtist || 'Image source'}{selectedMedia.imageLicense ? ` · ${selectedMedia.imageLicense}` : ''}<ArrowUpRight size={11} /></a>{/if}
          <div class="detail-content">
            <div class="detail-date">c. {formatYear(selected.year)} <span>APPROXIMATE MILESTONE</span></div>
            <h2>{selected.title}</h2>
            {#if categoryFor(selected)}
              <button class="detail-category" onclick={() => browseGroup({ category: selected.category, domain: selected.domain })} title="Explore this category">{categoryFor(selected)!.label}<ChevronRight size={13} /></button>
            {/if}
            <div class="detail-tabs"><button class:active={detailsTab === 'overview'} onclick={() => detailsTab = 'overview'}>Overview</button><button class:active={detailsTab === 'connections'} onclick={() => detailsTab = 'connections'}>Connections <span>{parents.length + children.length}</span></button></div>
            {#if detailsTab === 'overview'}
              <p class="summary">{selected.summary}</p>
              <button class="focus-button" onclick={focusSelection}><GitBranch size={16} />Explore its connections</button>
            {/if}
            <div class="connection-heading"><span>BUILT ON</span><small>{parents.length}</small></div>
            {#each parents as parent}
              {@const entry = index.get(parent.id)!}
              <ConnectionCard source={entry} target={selected} relation={parent} destination={entry} {follow} expanded={detailsTab === 'connections'} />
            {:else}<p class="empty-connections">A starting point in this edition. Earlier foundations may still be added.</p>{/each}
            <div class="connection-heading"><span>HELPED MAKE POSSIBLE</span><small>{children.length}</small></div>
            {#if groupDevelopments}
              {#if detailsTab === 'overview'}<p class="connection-help">Expand a category to see the developments and what {selected.title} contributed.</p>{/if}
              <div class="development-groups">
                {#each childGroups as group (group.id)}
                  {@const open = detailsTab === 'connections' || expandedGroups.includes(group.id)}
                  <div class="development-group">
                    {#if detailsTab === 'connections'}
                      <div class="connection-category">{group.label ?? domainInfo[group.domain].label}<small>{group.nodes.length}</small></div>
                    {:else}
                      <button class="development-toggle" onclick={() => toggleGroup(group.id)} aria-expanded={open} aria-controls={`developments-${selected.id}-${group.id}`}>
                        <span>{group.label ?? domainInfo[group.domain].label}<small>{group.nodes.length} {group.nodes.length === 1 ? 'development' : 'developments'}</small></span><ChevronDown size={16} class={open ? 'expanded' : ''} />
                      </button>
                    {/if}
                    <div id={`developments-${selected.id}-${group.id}`} hidden={!open}>
                      {#if open}{#each group.nodes as child (child.id)}
                        <ConnectionCard source={selected} target={child} relation={child.parents.find(p => p.id === selectedId)!} destination={child} {follow} expanded={detailsTab === 'connections'} />
                      {/each}{/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              {#each children.slice(0, 4) as child (child.id)}
                <ConnectionCard source={selected} target={child} relation={child.parents.find(p => p.id === selectedId)!} destination={child} {follow} />
              {/each}
            {/if}
            {#if children.length === 0}<p class="empty-connections">This branch continues beyond the current catalog.</p>{/if}
            {#if detailsTab === 'overview' && children.length > 4}<button class="text-button" onclick={() => detailsTab = 'connections'}>Show all {children.length} developments</button>{/if}
            <div class="source-block"><a href={wikiUrl(selected)} target="_blank" rel="noreferrer"><BookOpen size={16} />Read on Wikipedia<ArrowUpRight size={14} /></a><p>{offlineIndex[selectedId]?.found ? 'Reference matched in the August 2026 offline archive.' : selectedMedia && !selectedMedia.missing ? 'Wikipedia reference located.' : 'Suggested reference · awaiting archive review.'} Dates and connections are editorial interpretations, not universal prerequisites.</p></div>
          </div>
        </div>
      </aside>
    {/if}
  </div>
</div>

<dialog bind:this={aboutDialog} onclose={() => aboutOpen = false} class="about-dialog">
  <div class="dialog-heading"><span class="eyebrow">ABOUT THIS ATLAS</span><button class="icon-button" onclick={() => aboutOpen = false} aria-label="Close about dialog"><X size={20} /></button></div>
  <h2>What made it possible?</h2>
  <p>Humanity is a tree of human capabilities: things people learned to understand, make, and organize. Machines, discoveries, infrastructure, and institutions all belong here.</p>
  <p>Each connection describes an immediate contribution. Trace earlier discoveries through their intermediate steps. Older tools and materials can also contribute directly when the later work uses them. History has many paths, and the graph preserves those branches.</p>
  <div class="about-relations">{#each Object.entries(relations) as [key, relation]}<div><i class={key} style:--relation={relation.color}></i><div><h3>{relation.label}</h3><p>{relation.description}</p></div></div>{/each}</div>
  <h3>An evolving, editorial catalog</h3><p>This first edition contains {catalog.length.toLocaleString()} nodes and {edgeCount.toLocaleString()} connections. Summaries and relationship explanations are original editorial drafts. Wikipedia articles provide references; their presence does not verify every date or connection. Dates indicate approximate milestones and may differ by region. Era labels are navigation aids, not universal historical periods.</p>
  <h3>Sources & images</h3><p>Our research workflow uses an offline English Wikipedia archive from Kiwix. {offlineCount.toLocaleString()} references have been matched to local articles; matching an article does not verify its proposed connections. {pictureCount.toLocaleString()} catalog images link directly to Wikimedia’s image servers. Missing pictures use a category symbol. Article and image links preserve source attribution; individual image licenses vary.</p>
  <p class="dialog-note">Scroll or drag to pan. Pinch, Ctrl/⌘ + scroll, or the buttons zoom. Search with / at any scale. Full tree applies your branch, category, and era filters; Connections shows two steps before and after a capability. Horizontal bands represent branches, with named categories inside Information. Related milestones such as sorting algorithms stay together. Use the category filter or a category label to explore them. Categories organize topics; only connections describe historical contributions. Vertical bands represent eras. Crowded periods split into decades or years, and expand to fit their capabilities. Era widths reflect population, not elapsed time. Click a band or date label to fit that region. Expand a development category in the details panel to read its individual connections without moving the graph. Click a connection to follow it; its direction and explanation stay in the destination panel. Use Back to restore your previous view, zoom, and expanded groups. Hover over a graph link to see its destination. Panning stops beyond the outermost nodes and routes with a margin. Zoomed-out groups show how many capabilities they contain; click a group to zoom in, or a simple node to open its card. Each view arranges its nodes and outbound connections automatically.</p>
</dialog>
