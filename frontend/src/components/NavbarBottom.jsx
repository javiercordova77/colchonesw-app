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
        bottom: 8,
        zIndex: 1400,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        pb: 'env(safe-area-inset-bottom)'
      }}
    >
      <Paper
        component="nav"
        elevation={6}
        sx={{
          pointerEvents: 'auto',
          width: 'min(520px, calc(100% - 32px))',
          borderRadius: 24,
          px: 0.5,
          background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid rgba(36,100,64,0.18)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <BottomNavigation
          showLabels
            value={currentIndex}
          onChange={handleChange}
          sx={{
            background: 'transparent',
            minHeight: 54,
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(36,100,64,0.55)',
              fontSize: 10,
              fontWeight: 500,
              paddingTop: 0.3,
              paddingBottom: 0.15,
              minWidth: 0,
              transition: 'color .25s, transform .25s',
              '& .MuiBottomNavigationAction-label': {
                fontSize: 10,
                lineHeight: 1,
                transform: 'translateY(2px)',
                transition: 'font-size .25s, opacity .25s'
              },
              '& .MuiSvgIcon-root': {
                fontSize: 22,
                transition: 'transform .28s cubic-bezier(.34,1.56,.4,1)'
              }
            },
            '& .Mui-selected': {
              color: 'var(--brand-main)',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.04)'
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: 10.5,
                fontWeight: 600
              }
            }
          }}
        >
          <BottomNavigationAction label="Escanear" icon={<QrCodeScannerIcon />} />
          <BottomNavigationAction label="Inventario" icon={<Inventory2Icon />} />
          <BottomNavigationAction label="Config" icon={<SettingsIcon />} />
          <BottomNavigationAction label="Generar" icon={<QrCodeIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}