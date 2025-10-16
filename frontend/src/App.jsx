import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Escanear from './pages/Escanear';
import ProductoDetalle from './pages/ProductoDetalle';
import Inventario from './pages/Inventario';
import Configuracion from './pages/Configuracion';
import Qr from './pages/Qr';
import NavbarBottom from './components/NavbarBottom';
import NavbarTop from './components/NavbarTop';
import ConfigGeneral from './pages/config/ConfigGeneral';
import ProductosConfig from './pages/config/ProductosConfig';
import ProveedoresConfig from './pages/config/ProveedoresConfig';
import CategoriasConfig from './pages/config/CategoriasConfig';
import UbicacionesConfig from './pages/config/UbicacionesConfig';
import ParametrosSistema from './pages/config/ParametrosSistema';
import VariantesConfig from './pages/config/VariantesConfig';

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
          <Route path="/config/general" element={<ConfigGeneral />} />
          <Route path="/config/productos" element={<ProductosConfig />} />
          <Route path="/config/proveedores" element={<ProveedoresConfig />} />
          <Route path="/config/categorias" element={<CategoriasConfig />} />
          <Route path="/config/ubicaciones" element={<UbicacionesConfig />} />
          <Route path="/config/parametros" element={<ParametrosSistema />} />
          <Route path="/config/productos/:id/variantes" element={<VariantesConfig />} />
          <Route path="/qr" element={<Qr />} />
          {/* Ruta comodín al final */}
          <Route path="*" element={<div style={{ padding: 24 }}>No encontrado</div>} />
        </Routes>
      </div>
      <NavbarBottom />
    </div>
  );
}