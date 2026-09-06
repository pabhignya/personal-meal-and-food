import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // relative base path for GitHub Pages and PWA support
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 5000,
    host: true
  }
});
