import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Relative assets work on both username.github.io and /repository/ Pages sites.
export default defineConfig({ plugins: [svelte()], base: './' })
