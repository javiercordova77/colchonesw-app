import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: false,
    allowedHosts: ["localhost"],
    https: {
      key: fs.readFileSync('./cert/keyXentra.pem'),
      cert: fs.readFileSync('./cert/certXentra.pem'),
    }
  }
});