<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'
  import { domainInfo, formatYear } from './config'
  import type { Capability, WikipediaEntry, LayoutPort } from './types'
  let { data }: NodeProps = $props()
  let entry = $derived(data.entry as Capability)
  let media = $derived(data.media as WikipediaEntry | undefined)
  let info = $derived(domainInfo[entry.domain])
  let ports = $derived((data.ports ?? []) as LayoutPort[])
  let height = $derived((data.height as number) ?? 144)
  let failed = $state(false)
  $effect(() => { media; failed = false })
</script>

{#each ports as port (port.id)}
  <Handle id={port.id} type={port.type} position={port.type === 'target' ? Position.Left : Position.Right}
    style={`top: ${port.y}px;`} isConnectable={false} tabindex={-1} aria-hidden="true" />
{/each}
<button class="capability-node" class:active={data.active} style:--domain={info.color}
  style:height={`${height}px`}
  onclick={() => (data.select as (id: string) => void)(entry.id)} aria-label={`Explore ${entry.title}`}>
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
