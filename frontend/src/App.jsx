import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Escanear from './pages/Escanear';
import ProductoDetalle from './pages/ProductoDetalle';
import Inventario from './pages/Inventario';
import Configuracion from './pages/Configuracion';
import Qr from './pages/Qr';
import NavbarBottom from './components/NavbarBottom';
import NavbarTop from './components/NavbarTop';

export default function App() {
  console.log('[TRACE] App render');
  return (
    <div style={{ minHeight: '100vh' }}>
      <NavbarTop />
      <div
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))'
        }}
      >
        <Routes>
          <Route path="/" element={<Escanear />} />
          <Route path="/producto/:codigo" element={<ProductoDetalle />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/config" element={<Configuracion />} />
          <Route path="/qr" element={<Qr />} />
          <Route path="*" element={<div style={{ padding: 24 }}>No encontrado</div>} />
        </Routes>
      </div>
      <NavbarBottom />
    </div>
  );
}