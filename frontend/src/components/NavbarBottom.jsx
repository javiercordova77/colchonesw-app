import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = ['/', '/inventario', '/config', '/qr'];

export default function NavbarBottom() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = React.useMemo(() => {
    const p = location.pathname;
    if (p === '/') return 0;
    if (p.startsWith('/inventario')) return 1;
    if (p.startsWith('/config')) return 2;
    if (p.startsWith('/qr')) return 3;
    return 0;
  }, [location.pathname]);

  const handleChange = (_e, newValue) => {
    if (newValue !== currentIndex) navigate(routes[newValue]);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 10,
        zIndex: 1400,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',        // permite que solo el panel interno reciba eventos
        pb: 'env(safe-area-inset-bottom)'
      }}
    >
      <Paper
        component="nav"
        elevation={8}
        sx={{
          pointerEvents: 'auto',
            // tamaño / centrado
          width: 'min(520px, calc(100% - 32px))',
          borderRadius: 26,
          px: 1,
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          border: '1px solid rgba(36,100,64,0.18)',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <BottomNavigation
          showLabels
          value={currentIndex}
          onChange={handleChange}
          sx={{
            background: 'transparent',
            minHeight: 60,
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(36,100,64,0.55)',
              fontSize: 11,
              fontWeight: 500,
              paddingTop: 0.25,
              paddingBottom: 0.25,
              transition: 'color .25s, transform .25s',
              '& .MuiSvgIcon-root': {
                fontSize: 26,
                transition: 'transform .25s'
              }
            },
            '& .Mui-selected': {
              color: 'var(--brand-main)',
              fontWeight: 600,
            },
            '& .Mui-selected .MuiSvgIcon-root': {
              transform: 'scale(1.07)'
            }
          }}
        >
          <BottomNavigationAction label="Escanear" icon={<QrCodeScannerIcon />} />
          <BottomNavigationAction label="Inventario" icon={<Inventory2Icon />} />
          <BottomNavigationAction label="Configuración" icon={<SettingsIcon />} />
          <BottomNavigationAction label="Generar QR" icon={<QrCodeIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}