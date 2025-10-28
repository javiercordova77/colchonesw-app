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
import ColoresEditar from './pages/config/ColoresEditar';

function AnimatedRoutes() {
  const location = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'

  // Dirección: forzar con state.slide o inferir por tipo de navegación
  const forced = location.state && location.state.slide;
  const classNames = forced
    ? (forced === 'right' ? 'slide-right' : 'slide-left')
    : (navType === 'POP' ? 'slide-right' : 'slide-left');

  // nodeRef por pathname para evitar findDOMNode y permitir overlap
  const refsMap = React.useRef(new Map());
  const getNodeRef = (key) => {
    if (!refsMap.current.has(key)) refsMap.current.set(key, React.createRef());
    return refsMap.current.get(key);
  };

  const key = location.pathname;
  const nodeRef = getNodeRef(key);

  return (
    <TransitionGroup component={null}>
      {/* Overlap: ambas pantallas conviven mientras se animan */}
      <CSSTransition key={key} classNames={classNames} timeout={260} nodeRef={nodeRef}>
        <div ref={nodeRef} className="route-page">
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
            <Route path="/config/productos/:id/variantes/:idVariante/colores/nuevo" element={<ColoresEditar />} />
            <Route path="/config/productos/:id/variantes/:idVariante/colores/:idColor" element={<ColoresEditar />} />
            <Route path="/config/productos/:id/seleccionar-categoria" element={<SelectCategoria />} />
            <Route path="/config/productos/:id/seleccionar-proveedor" element={<SelectProveedor />} />
            <Route path="/qr" element={<Qr />} />
            <Route path="*" element={<div style={{ padding: 24 }}>No encontrado</div>} />
          </Routes>
        </div>
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
          position: 'relative',              // importante para overlap absoluto
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
          overflowX: 'hidden',
          minHeight: 'calc(100vh - 56px - 64px)'
        }}
      >
        <AnimatedRoutes />
      </div>
      <NavbarBottom />
    </div>
  );
}