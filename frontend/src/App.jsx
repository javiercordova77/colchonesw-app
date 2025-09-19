import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Escanear from './pages/Escanear';
import ProductoDetalle from './pages/ProductoDetalle';
import Inventario from './pages/Inventario';
import Configuracion from './pages/Configuracion';
import Qr from './pages/Qr';
import NavbarBottom from './components/NavbarBottom';

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<Escanear />} />
        <Route path="/producto/:codigo" element={<ProductoDetalle />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/config" element={<Configuracion />} />
        <Route path="/qr" element={<Qr />} />
      </Routes>

      <NavbarBottom />
    </div>
  );
}