<script lang="ts">
  import { untrack } from 'svelte'
  import { useSvelteFlow, type Viewport } from '@xyflow/svelte'
  let { target }: { target: Viewport | null } = $props()
  const { setViewport } = useSvelteFlow()
  // Use the public API so button commands update the pan/zoom gesture state as
  // well as the rendered transform. A bound viewport alone leaves it stale.
  $effect(() => { if (target) { const next = target; untrack(() => void setViewport(next)) } })
</script>
