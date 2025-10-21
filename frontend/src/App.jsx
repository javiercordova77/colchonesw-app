import React from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './route-transitions.css';

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
import ProductosEditar from './pages/config/ProductosEditar';
import VariantesEditar from './pages/config/VariantesEditar';
import SelectCategoria from './pages/config/SelectCategoria';
import SelectProveedor from './pages/config/SelectProveedor';

function AnimatedRoutes() {
  const location = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'

  // Permite forzar dirección desde location.state.slide = 'left' | 'right'
  const forced = location.state && location.state.slide;
  const classNames = forced
    ? (forced === 'right' ? 'slide-right' : 'slide-left')
    : (navType === 'POP' ? 'slide-right' : 'slide-left');

  return (
    <TransitionGroup component={null}>
      <CSSTransition key={location.key} classNames={classNames} timeout={300}>
        <Routes location={location}>
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
          <Route path="/config/productos/:id/editar" element={<ProductosEditar />} />
          <Route path="/config/productos/:id/variantes/nueva" element={<VariantesEditar />} />
          <Route path="/config/productos/:id/variantes/:idVariante" element={<VariantesEditar />} />
          <Route path="/config/productos/:id/seleccionar-categoria" element={<SelectCategoria />} />
          <Route path="/config/productos/:id/seleccionar-proveedor" element={<SelectProveedor />} />
          <Route path="/qr" element={<Qr />} />
          <Route path="*" element={<div style={{ padding: 24 }}>No encontrado</div>} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <NavbarTop />
      <div
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
          overflowX: 'hidden'
        }}
      >
        <AnimatedRoutes />
      </div>
      <NavbarBottom />
    </div>
  );
}