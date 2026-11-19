import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.API_PORT ?? process.env.PORT ?? '3000';

export default defineConfig({
  root: 'src/web',
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    // Datenbank und Zugangsdaten nie über den Entwicklungsserver ausliefern (Befund 1 der Prüfung E1-S1).
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/data/**', '**/*.sqlite*'] },
    proxy: { '/api/v1': `http://localhost:${apiPort}` },
  },
});
