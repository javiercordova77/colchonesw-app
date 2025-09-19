// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",  //Conexiones desde cualquier IP en la red
    port: 5173,
    strictPort: false,
    allowedHosts: ["28a7671f8f59.ngrok-free.app"] // <-- Agrega aquí tu host ngrok
  }
});