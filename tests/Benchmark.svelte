<script lang="ts">
  import { onMount } from 'svelte'
  import Graph from '../src/lib/Graph.svelte'
  import { multiplyCatalog } from './fixtures.mjs'
  import type { Capability } from '../src/lib/types'
  let source = $state.raw<Capability[]>([])
  let items = $state.raw<Capability[]>([])
  let selected = $state('0:microscope')
  let copies = $state(20)
  let error = $state('')
  function populate() { items = multiplyCatalog(source, copies) }
  onMount(async () => {
    try { source = (await (await fetch('/data/catalog.json')).json()).nodes; populate() }
    catch (e) { error = String(e) }
  })
</script>
<main class="benchmark">
  <header>
    <h1>Rendering benchmark</h1>
    <p>Synthetic catalog copies; the production catalog is unchanged. Use Fit, scroll and zoom to exercise the same graph component.</p>
    <label>Fixture size <select bind:value={copies} onchange={populate}><option value={1}>1,000 nodes</option><option value={10}>10,000 nodes</option><option value={20}>20,000 nodes</option><option value={50}>50,000 nodes</option></select></label>
    <output>{items.length.toLocaleString()} nodes · {items.reduce((n, item) => n + item.parents.length, 0).toLocaleString()} connections</output>
  </header>
  <div class="benchmark-stage">{#if items.length}<Graph {items} {selected} media={{}} select={(id) => selected = id} />{:else}<p>{error || 'Preparing fixture…'}</p>{/if}</div>
</main>
<style>
  .benchmark{height:100dvh;display:flex;flex-direction:column}.benchmark header{padding:14px 20px;border-bottom:1px solid #526247}.benchmark h1{font-size:20px;margin:0 0 7px}.benchmark p{font-size:12px;margin:0 0 9px;color:#b4bea9}.benchmark output{font-size:13px;margin-left:20px}.benchmark select{margin-left:8px;padding:4px}.benchmark-stage{flex:1;position:relative;min-height:0}
</style>
