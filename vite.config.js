import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
