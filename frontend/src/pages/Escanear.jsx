import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function Escanear() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(()=>{});
        scannerRef.current.clear().catch(()=>{});
        scannerRef.current = null;
      }
    };
  }, []);

  // Inicia el escáner solo cuando el div existe
  useEffect(() => {
    if (!scanning) return;
    setError(null);

    // Espera a que el div esté en el DOM
    const qrDiv = document.getElementById("qr-reader");
    if (!qrDiv) return;

    const html5QrcodeScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrcodeScanner;

    const config = { fps: 10, qrbox: { width: 260, height: 260 } };

    html5QrcodeScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        html5QrcodeScanner.stop().then(() => {
          html5QrcodeScanner.clear().catch(()=>{});
          scannerRef.current = null;
          setScanning(false);
          try {
            const u = new URL(decodedText);
            const parts = u.pathname.split('/');
            const codigo = parts[parts.length - 1] || decodedText;
            navigate(`/producto/${encodeURIComponent(codigo)}`);
          } catch (e) {
            navigate(`/producto/${encodeURIComponent(decodedText)}`);
          }
        }).catch(() => {
          setScanning(false);
          try {
            const u = new URL(decodedText);
            const parts = u.pathname.split('/');
            const codigo = parts[parts.length - 1] || decodedText;
            navigate(`/producto/${encodeURIComponent(codigo)}`);
          } catch (e) {
            navigate(`/producto/${encodeURIComponent(decodedText)}`);
          }
        });
      },
      (errorMessage) => {
        // lectura fallida ocasional
      }
    ).catch((err) => {
      console.error('Error iniciando cámara:', err);
      setError('No se pudo acceder a la cámara. Revisa permisos o usa HTTPS en producción.');
      setScanning(false);
    });

    // Limpieza si scanning cambia
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(()=>{});
        scannerRef.current.clear().catch(()=>{});
        scannerRef.current = null;
      }
    };
  }, [scanning, navigate]);

  const handleScanClick = () => setScanning(true);

  const stopScanner = () => {
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.stop().then(()=> {
        scannerRef.current.clear().catch(()=>{});
        scannerRef.current = null;
      }).catch(()=> {
        scannerRef.current = null;
      });
    }
  };

  return (
    <Box className="app-bg">
      <Box className="container">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Paper elevation={3} className="preview-box" sx={{ width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {scanning && (
              <div id="qr-reader" style={{ width: 260, height: 260, borderRadius: 8, overflow: 'hidden' }} />
            )}
          </Paper>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          {!scanning ? (
            <Button className="scan-button" startIcon={<CameraAltIcon />} onClick={handleScanClick}>
              Escanear
            </Button>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button variant="outlined" sx={{ mt: 1 }} onClick={stopScanner}>Cancelar</Button>
              {error && <Typography color="error">{error}</Typography>}
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <img src="/logo.png" alt="logo" className="logo-center" />
        </Box>
      </Box>
    </Box>
  );
}