<script lang="ts">
  import { categoryFor } from './categories.js'
  import { domainInfo, formatYear } from './config'
  import type { Capability, WikipediaEntry, LayoutPort } from './types'
  let { entry, media, active, select, ports, height }: { entry: Capability; media?: WikipediaEntry; active: boolean; select: (id: string) => void; ports: LayoutPort[]; height: number } = $props()
  let info = $derived(domainInfo[entry.domain])
  let failed = $state(false)
  $effect(() => { media; failed = false })
</script>

<button class="capability-node" class:active style:--domain={info.color}
  style:height={`${height}px`} title={categoryFor(entry)?.label}
  onclick={() => select(entry.id)} aria-label={`Explore ${entry.title}`}>
  <span class="node-art" style:height={`${height - 67}px`}>
    {#if media?.thumbnail && !failed}
      <img src={media.thumbnail} alt="" loading="lazy" draggable="false" onerror={() => failed = true} />
    {:else}
      <info.icon size={42} strokeWidth={1.2} />
    {/if}
    <span class="node-kind">{entry.kind}</span>
  </span>
  <span class="node-caption"><strong>{entry.title}</strong><span>c. {formatYear(entry.year)}</span></span>
  {#each ports as port (port.id)}<span class="node-port" style:top={`${port.y}px`} style:left={port.type === 'target' ? '-4px' : 'auto'} aria-hidden="true"></span>{/each}
</button>
