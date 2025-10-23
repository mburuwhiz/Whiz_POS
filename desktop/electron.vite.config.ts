import { defineConfig } from 'electron-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['@whiz-pos/shared'],
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['@whiz-pos/shared'],
      },
    },
  },
  renderer: {
    plugins: [svelte()],
    build: {
      rollupOptions: {
        external: ['@whiz-pos/shared'],
      },
    },
  },
});
