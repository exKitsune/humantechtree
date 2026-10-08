<script lang="ts">
  import { ChevronRight } from '@lucide/svelte'
  import { relations } from './config'
  import type { Capability, Parent } from './types'
  let { source, target, relation, destination, follow, expanded = false }: {
    source: Capability; target: Capability; relation: Parent; destination: Capability
    follow: (id: string) => void; expanded?: boolean
  } = $props()
</script>

<button class="connection-card" onclick={() => follow(destination.id)} aria-label={`Follow connection to ${destination.title}`}>
  <span class="relation-bar" style:--relation={relations[relation.type].color}></span>
  <span class="connection-body">
    <strong>{destination.title}</strong>
    <small style:color={relations[relation.type].color}>{relations[relation.type].label}</small>
    <span class="connection-direction">{source.title} → {target.title}</span>
    <span class="reason">{relation.reason}</span>
    {#if expanded && relation.directContribution}<span class="direct-contribution"><b>Direct role</b>{relation.directContribution}</span>{/if}
    <span class="connection-follow">Follow connection <ChevronRight size={12} /></span>
  </span>
</button>
