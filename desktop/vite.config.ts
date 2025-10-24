import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    svelte(),
    electron(),
  ],
})
