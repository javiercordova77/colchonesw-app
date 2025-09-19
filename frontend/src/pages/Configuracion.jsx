import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Configuracion() {
  return (
    <Box className="container">
      <Typography variant="h6">Configuración</Typography>
      <Typography variant="body2" color="text.secondary">Ajustes de la app.</Typography>
    </Box>
  );
}