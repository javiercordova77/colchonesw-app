import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Inventario() {
  return (
    <Box className="container">
      <Typography variant="h6">Inventario</Typography>
      <Typography variant="body2" color="text.secondary">Aquí implementaremos la lista de existencias.</Typography>
    </Box>
  );
}