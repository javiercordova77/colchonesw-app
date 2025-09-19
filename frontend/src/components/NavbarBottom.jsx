import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCodeIcon from '@mui/icons-material/QrCode'; // Nuevo icono para generar QR
import { useNavigate } from 'react-router-dom';

export default function NavbarBottom() {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={6}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          if (newValue === 0) navigate('/');
          if (newValue === 1) navigate('/inventario');
          if (newValue === 2) navigate('/config');
          if (newValue === 3) navigate('/qr'); // Nueva opción para QR
        }}
      >
        <BottomNavigationAction label="Escanear" icon={<QrCodeScannerIcon />} />
        <BottomNavigationAction label="Inventario" icon={<Inventory2Icon />} />
        <BottomNavigationAction label="Configuración" icon={<SettingsIcon />} />
        <BottomNavigationAction label="Generar QR" icon={<QrCodeIcon />} /> {/* Nueva opción */}
      </BottomNavigation>
    </Paper>
  );
}