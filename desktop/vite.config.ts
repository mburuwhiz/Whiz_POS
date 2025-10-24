import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    svelte(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
      // Optional: Use this if you want to use the same transpiler for the renderer process
      renderer: {},
    }),
  ],
})
