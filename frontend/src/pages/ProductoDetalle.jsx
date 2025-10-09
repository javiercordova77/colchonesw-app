// ProductoDetalle.jsx (UI refinada)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductoPorCodigo, BASE_URL } from '../api';
import {
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Fade,
  Stack
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ mt: 1 }}>{children}</Box> : null;
}

export default function ProductoDetalle() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState(0);
  const [showVenta, setShowVenta] = useState(true);
  const [showCompra, setShowCompra] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);
    fetchProductoPorCodigo(codigo)
      .then(data => {
        if (cancel) return;
        setProducto(data);
        setLoading(false);
      })
      .catch(err => {
        if (cancel) return;
        setError(
          err.message === 'Network Error'
            ? 'No se pudo conectar al servidor.'
            : 'No se pudo obtener el producto'
        );
        setLoading(false);
      });
    return () => { cancel = true; };
  }, [codigo]);

  const handleCopySKU = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" sx={{ mt: 6, textAlign: 'center' }}>
        {error}
      </Typography>
    );

  if (!producto) return null;

  const imgSrc = producto.imagen
    ? `${BASE_URL}/images/${producto.imagen}`
    : '/logo.png';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f4f5f6', // gris claro base
        pb: 'calc(70px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 760,
          px: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2.5 },
        }}
      >
        {/* Contenedor superior (imagen + nombre + categoría) */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 4,
            background: 'linear-gradient(160deg,#0b7a4f 0%, #0a643a 100%)',
            color: '#fff',
            overflow: 'hidden',
            mb: 2.5,
            minHeight: { xs: 230, sm: 260 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 8px 26px -8px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18)'
          }}
        >
            {/* Botón volver */}
            <IconButton
              aria-label="volver"
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                left: 12,
                top: 12,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '&:hover': { background: 'rgba(255,255,255,0.25)' },
              }}
              size="small"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>

            {/* Imagen */}
            <Fade in timeout={400}>
              <Box
                component="img"
                src={imgSrc}
                alt={producto.descripcion}
                sx={{
                  maxWidth: { xs: '68%', sm: '50%' },
                  maxHeight: { xs: 140, sm: 170 },
                  mx: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.35))'
                }}
              />
            </Fade>

            {/* Info textual inferior */}
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 18
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: 0.3, lineHeight: 1.1 }}
              >
                {producto.descripcion ?? 'Sin descripción'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.92, mt: 0.3 }}
              >
                {producto.categoria ?? ''}
              </Typography>
            </Box>
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            mb: 1,
            px: 0.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                letterSpacing: 0.3,
                minHeight: 42
              },
              '& .MuiTabs-flexContainer': { gap: { xs: 1, sm: 2 } },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 3,
                background: '#0b7a4f'
              }
            }}
          >
            <Tab label="Detalles" />
            <Tab label="Colores & Proveedor" />
          </Tabs>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Contenido principal (sin panel visible) */}
        <Box sx={{}}>
          {/* Tab 0: Detalles */}
          <TabPanel value={tab} index={0}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 1.2, letterSpacing: 0.3 }}
            >
              Datos del Producto
            </Typography>

            {/* Lista de atributos (estilo “plano” sobre fondo) */}
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                background: 'transparent',
                mb: 2
              }}
            >
              {[
                {
                  label: 'Medida',
                  value: producto.medida ?? '-'
                },
                {
                  label: 'Precio Venta',
                  value: showVenta
                    ? `$${Number(producto.precio_venta ?? 0).toFixed(2)}`
                    : '$ *.* *',
                  extraIcon: (
                    <Tooltip
                      title={showVenta ? 'Ocultar precio' : 'Mostrar precio'}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setShowVenta(s => !s)}
                      >
                        {showVenta
                          ? <VisibilityIcon fontSize="small" />
                          : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )
                },
                {
                  label: 'Precio Compra',
                  value: showCompra
                    ? `$${Number(producto.precio_compra ?? 0).toFixed(2)}`
                    : '$ *.* *',
                  extraIcon: (
                    <Tooltip
                      title={showCompra ? 'Ocultar precio compra' : 'Mostrar precio compra'}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setShowCompra(s => !s)}
                      >
                        {showCompra
                          ? <VisibilityIcon fontSize="small" />
                          : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )
                },
                {
                  label: 'Stock',
                  value: producto.cantidad_disponible ?? 0
                },
                {
                  label: 'SKU / Código',
                  value: producto.codigo_variante ?? codigo ?? '-',
                  extraIcon: (
                    <Tooltip title={copied ? 'Copiado' : 'Copiar SKU'}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleCopySKU(producto.codigo_variante ?? codigo ?? '')
                        }
                      >
                        {copied
                          ? <DoneIcon fontSize="small" />
                          : <ContentCopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )
                }
              ].map((row, idx, arr) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.15,
                    px: 1.2,
                    gap: 1,
                    borderBottom: idx === arr.length - 1
                      ? 'none'
                      : '1px solid rgba(0,0,0,0.06)',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.025)'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'text.secondary'
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {row.value}
                  </Typography>
                  {row.extraIcon}
                </Box>
              ))}
            </Box>
          </TabPanel>

            {/* Tab 1: Colores & Proveedor */}
            <TabPanel value={tab} index={1}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.2, letterSpacing: 0.3 }}
              >
                Colores
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  mb: 2,
                  minHeight: 40
                }}
              >
                {producto.colores && producto.colores.length
                  ? producto.colores.map((c, i) => (
                      <Chip
                        key={i}
                        label={c.color}
                        size="small"
                        sx={{
                          backgroundColor: c.codigo_color || '#eee',
                          color:
                            c.codigo_color &&
                            c.codigo_color.toLowerCase() === '#000000'
                              ? '#fff'
                              : '#000',
                          borderRadius: 2,
                          fontWeight: 600,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.18)'
                        }}
                      />
                    ))
                  : (
                    <Typography color="text.secondary">
                      Sin colores
                    </Typography>
                  )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.2, letterSpacing: 0.3 }}
              >
                Proveedor
              </Typography>

              <Box
                sx={{
                  borderRadius: 2,
                  p: 1.6,
                  background: 'linear-gradient(145deg,#ffffff 0%, #fafafa 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
              >
                <Typography sx={{ fontWeight: 800, mb: 0.3 }}>
                  {producto.proveedor?.nombre ?? 'Sin proveedor'}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.35 }}
                >
                  {producto.proveedor?.actividad ?? ''}
                </Typography>
              </Box>
            </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}