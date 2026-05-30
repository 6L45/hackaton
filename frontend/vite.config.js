import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During dev, /api requests are proxied to the Node backend so the front
// and back can run on different ports without CORS hassle.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
