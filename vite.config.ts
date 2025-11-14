import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  return {
    plugins: [react()],
    base: isServe ? '/' : './', // Use absolute path for dev and relative for build
  };
});
