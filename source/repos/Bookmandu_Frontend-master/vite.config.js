import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ensure this matches your development server port
    proxy: {
      '/api': {
        target: 'http://localhost:5036', // Backend server URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep the /api prefix
      },
    },
  },
});