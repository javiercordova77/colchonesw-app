import React from 'react';
import { Container, Typography, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import NavBack from '../../components/NavBack';

export default function ConfigGeneral() {
  const navigate = useNavigate();

  const opciones = [
    { t: 'Productos', to: '/config/productos' },
    { t: 'Proveedores', to: '/config/proveedores' },
    { t: 'Categorias', to: '/config/categorias' },
    { t: 'Ubicaciones', to: '/config/ubicaciones' },
    { t: 'Parametros de Sistema', to: '/config/parametros' },
  ];

  return (
    <Box sx={{ background: '#f3f5f7', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Barra de regreso propia */}
        <Box sx={{ mb: 1 }}>
          <NavBack ariaLabel="Volver a Configuración" to="/config" />
        </Box>

        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
          Grupos
        </Typography>

        <List disablePadding sx={{ mt: 1 }}>
          {opciones.map((row, idx) => (
            <React.Fragment key={row.t}>
              <ListItemButton
                onClick={() => navigate(row.to)}
                sx={{ py: 1.25, px: 0 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.primary' }}>
                  <LayersOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={row.t}
                  slotProps={{ primary: { sx: { fontWeight: 300 } } }}  // texto thin
                />
                <ChevronRightIcon color="action" />
              </ListItemButton>
              {idx < opciones.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />
        <Box sx={{ minHeight: 120 }} />
      </Container>
    </Box>
  );
}