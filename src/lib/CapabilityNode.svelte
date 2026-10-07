<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'
  import { domainInfo, formatYear } from './config'
  import type { Capability, WikipediaEntry } from './types'
  let { data }: NodeProps = $props()
  let entry = $derived(data.entry as Capability)
  let media = $derived(data.media as WikipediaEntry | undefined)
  let info = $derived(domainInfo[entry.domain])
  let failed = $state(false)
  $effect(() => { media; failed = false })
</script>

<Handle type="target" position={Position.Left} isConnectable={false} tabindex={-1} aria-hidden="true" />
<button class="capability-node" class:active={data.active} style:--domain={info.color}
  onclick={() => (data.select as (id: string) => void)(entry.id)} aria-label={`Explore ${entry.title}`}>
  <span class="node-art">
    {#if media?.thumbnail && !failed}
      <img src={media.thumbnail} alt="" loading="lazy" draggable="false" onerror={() => failed = true} />
    {:else}
      <info.icon size={42} strokeWidth={1.2} />
    {/if}
    <span class="node-kind">{entry.kind}</span>
  </span>
  <span class="node-caption"><strong>{entry.title}</strong><span>c. {formatYear(entry.year)}</span></span>
  <span class="node-port"></span>
</button>
<Handle type="source" position={Position.Right} isConnectable={false} tabindex={-1} aria-hidden="true" />
