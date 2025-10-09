import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function NavbarTop() {
  const { pathname } = useLocation();

  const map = [
    { test: p => p.startsWith('/inventario'), title: 'Inventario', subtitle: 'Colchones Wilson' },
    { test: p => p.startsWith('/producto/'), title: 'Producto', subtitle: 'Detalle' },
    { test: p => p.startsWith('/config'), title: 'Configuración', subtitle: 'Preferencias' },
    { test: p => p.startsWith('/qr'), title: 'QR', subtitle: 'Generador' },
    { test: p => p === '/', title: 'Escanear', subtitle: 'Lector' }
  ];
  const found = map.find(m => m.test(pathname));
  const title = found?.title || 'COLCHONES WILSON';
  const subtitle = found?.subtitle || 'Propietario';

  return (
    <AppBar
      position="fixed"
      elevation={1}
      color="default"
      sx={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'rgba(255,255,255,0.85)'
      }}
    >
      <Toolbar sx={{ minHeight: 56, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.72 }}>
            {subtitle}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}