import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function Escanear() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const processedRef = useRef(false);
  const navigatingRef = useRef(false);
  const navigate = useNavigate();
  const [qrBoxSize, setQrBoxSize] = useState(320);

  // Ajuste dinámico del recuadro (75% del menor lado)
  useEffect(() => {
    const calc = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.75;
      setQrBoxSize(Math.max(220, Math.min(size, 480)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // Limpia el contenedor DOM del lector
  const hardClearDom = () => {
    const c = document.getElementById('qr-reader-full');
    if (c) c.innerHTML = '';
  };

  // Detener y limpiar instancia
  const stopAndClear = () => {
    const inst = scannerRef.current;
    scannerRef.current = null;
    if (!inst) {
      hardClearDom();
      return;
    }
    inst
      .stop()
      .catch(e => console.debug('[SCAN] stop() error (ignorado):', e))
      .finally(() => {
        try {
          inst.clear && inst.clear();
        } catch (e) {
          console.debug('[SCAN] clear() error (ignorado):', e);
        }
        hardClearDom();
        console.debug('[SCAN] Cámara detenida y limpiada');
      });
  };

  const resetToIdle = () => {
    console.debug('[SCAN] Reset a estado inicial');
    setScanning(false);
    processedRef.current = false;
    navigatingRef.current = false;
    setError(null);
    setTimeout(() => stopAndClear(), 0);
  };

  // Sanitiza / normaliza código
  function extractCode(raw) {
    console.debug('[SCAN] RAW:', JSON.stringify(raw), 'len=', raw.length);
    let text = raw.replace(/[\r\n\t]/g, '').trim();
    // Quitar comillas envolventes si vienen
    text = text.replace(/^"+|"+$/g, '');
    // Si es URL tomar último segmento
    try {
      const u = new URL(text);
      let path = u.pathname.replace(/\/+$/, '');
      const segments = path.split('/').filter(Boolean);
      if (segments.length) {
        text = segments.at(-1);
        console.debug('[SCAN] URL detectada. Segmento usado:', text);
      }
    } catch {
      // no era URL
    }
    // Quitar query / fragment
    text = text.split(/[?#]/)[0];
    // Quitar espacios internos
    text = text.replace(/\s+/g, '');
    // Filtrar caracteres no permitidos (ajusta según tu codificación)
    text = text.replace(/[^A-Za-z0-9._-]/g, '');
    console.debug('[SCAN] Sanitizado:', text);
    return text;
  }

  // Limpieza al desmontar
  useEffect(() => () => stopAndClear(), []);

  // Si scanning pasa a false, asegúrate de limpiar
  useEffect(() => {
    if (!scanning) stopAndClear();
  }, [scanning]);

  // Iniciar lector cuando scanning = true
  useEffect(() => {
    if (!scanning) return;

    console.debug('[SCAN] Iniciando cámara...');
    setError(null);
    processedRef.current = false;
    navigatingRef.current = false;

    const targetId = 'qr-reader-full';
    if (!document.getElementById(targetId)) {
      console.error('[SCAN] Contenedor no encontrado');
      resetToIdle();
      return;
    }

    const html5Qrcode = new Html5Qrcode(targetId, { verbose: false });
    scannerRef.current = html5Qrcode;

    const config = {
      fps: 12,
      qrbox: { width: qrBoxSize, height: qrBoxSize }
    };

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        config,
        // ÉXITO (decoded)
        decodedText => {
          if (processedRef.current) return;
          processedRef.current = true;

          const code = extractCode(decodedText);
          if (!code) {
            console.warn('[SCAN] Código vacío tras sanitizar');
            setError('Código no válido');
            resetToIdle();
            return;
          }
          console.debug('[SCAN] Navegando a /producto/', code);
          navigatingRef.current = true;
          navigate(`/producto/${encodeURIComponent(code)}`);
          resetToIdle();
        },
        // Errores de frame (ruido) – se ignoran
        () => {}
      )
      .then(() => console.debug('[SCAN] Cámara iniciada'))
      .catch(err => {
        console.error('[SCAN] Error iniciando cámara:', err);
        let msg = 'No se pudo acceder a la cámara.';
        if (window.isSecureContext === false) msg += ' Usa HTTPS o localhost.';
        setError(msg);
        resetToIdle();
      });

    return () => {
      stopAndClear();
    };
  }, [scanning, qrBoxSize, navigate]);

  const startScan = () => {
    console.debug('[SCAN] startScan()');
    setError(null);
    setScanning(true);
  };

  const stopScanner = () => {
    console.debug('[SCAN] stopScanner() solicitado');
    if (navigatingRef.current) return;
    resetToIdle();
  };

  return (
    <Box className="app-bg">
      {!scanning && (
        <Box className="container" sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            startIcon={<CameraAltIcon sx={{ color: '#fff' }} />}
            onClick={startScan}
            sx={{
              backgroundColor: 'var(--brand-main)',
              color: '#fff',
              width: '82%',
              maxWidth: 360,
              px: 4,
              py: 2,
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: 2,
              letterSpacing: 0.5,
              '&:hover': { backgroundColor: '#1e5233' }
            }}
          >
            ESCANEAR
          </Button>

          <Box sx={{ mt: 6 }}>
            <img
              src="/logo.png"
              alt="logo"
              style={{ width: 240, height: 'auto', opacity: 0.9 }}
            />
          </Box>

          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 3, maxWidth: 340, mx: 'auto' }}
            >
              {error}
            </Typography>
          )}
        </Box>
      )}

      {scanning && (
        <Box
          id="scanner-overlay"
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2100,
            background: '#000',
            overflow: 'hidden'
          }}
        >
          <Box
            id="qr-reader-full"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%'
            }}
          />

          <style>
            {`
              #qr-reader-full video {
                width:100% !important;
                height:100% !important;
                object-fit: cover;
              }
              #qr-reader-full img { display:none !important; }
            `}
          </style>

          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: qrBoxSize,
              height: qrBoxSize,
              transform: 'translate(-50%, -50%)',
              border: '2px dashed rgba(255,255,255,0.9)',
              borderRadius: 8,
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.55)',
              pointerEvents: 'none'
            }}
          />

          <IconButton
            onClick={stopScanner}
            sx={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 10px)',
              right: 14,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.7)' }
            }}
            aria-label="Cerrar escáner"
          >
            <CloseIcon />
          </IconButton>

            <Box
              sx={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom) + 70px)',
                left: 0,
                right: 0,
                textAlign: 'center',
                px: 2
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#fff', fontWeight: 500, letterSpacing: 0.4 }}
              >
                Alinea el código dentro del recuadro
              </Typography>
              {error && (
                <Typography
                  variant="caption"
                  sx={{ mt: 1, color: '#ff6161', display: 'block' }}
                >
                  {error}
                </Typography>
              )}
            </Box>
        </Box>
      )}
    </Box>
  );
}