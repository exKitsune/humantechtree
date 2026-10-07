<script lang="ts">
  import { untrack } from 'svelte'
  import { useSvelteFlow, useStore, type Viewport } from '@xyflow/svelte'
  let { target, extent, minZoom }: { target: Viewport | null; extent: [[number, number], [number, number]]; minZoom: number } = $props()
  const { setViewport } = useSvelteFlow()
  const store = useStore()
  // Svelte Flow 1.7 only passes these props to the gesture engine at creation.
  // Its public store setters keep gesture bounds in sync after worker layouts.
  $effect(() => {
    if (!extent || !store.viewportInitialized) return
    const bounds = extent, minimum = minZoom
    untrack(() => { store.setTranslateExtent(bounds); store.setMinZoom(minimum) })
  })
  // Use the public API so button commands update the pan/zoom gesture state as
  // well as the rendered transform. A bound viewport alone leaves it stale.
  $effect(() => { if (target) { const next = target; untrack(() => void setViewport(next)) } })
</script>
