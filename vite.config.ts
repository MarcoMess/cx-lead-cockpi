import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.API_PORT ?? process.env.PORT ?? '3000';

export default defineConfig({
  root: 'src/web',
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
});
