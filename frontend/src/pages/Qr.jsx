import React, { useRef, useState } from 'react';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

export default function Qr() {
  const [codigo, setCodigo] = useState('');
  const [mostrarQR, setMostrarQR] = useState(false);
  const qrRef = useRef(null);

  const handleGenerar = () => {
    if (codigo.trim() !== '') setMostrarQR(true);
  };

  const handleDescargar = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${codigo}.png`;
    link.click();
  };

  return (
    <Box className="app-bg">
      <Box className="container" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Generar código QR</Typography>
        <TextField
          label="Código de producto"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleGenerar}>Generar QR</Button>

        {mostrarQR && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }} ref={qrRef}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <QRCodeCanvas value={codigo} size={256} />
            </Paper>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={handleDescargar}>Descargar QR</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}