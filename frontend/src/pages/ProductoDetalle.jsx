// src/pages/ProductoDetalle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductoPorCodigo, BASE_URL } from '../api';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
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
    console.debug('[ProductoDetalle] Param codigo recibido:', codigo);
    let cancel = false;
    setLoading(true);
    setError(null);

    fetchProductoPorCodigo(codigo)
      .then(data => {
        if (cancel) return;
        console.debug('[ProductoDetalle] Producto OK:', data);
        setProducto(data);
        setLoading(false);
      })
      .catch(err => {
        if (cancel) return;
        console.error('[ProductoDetalle] Error fetchProductoPorCodigo (final):', err);
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
    } catch (e) {
      console.warn('Copy failed', e);
    }
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

  const imgSrc = producto.imagen ? `${BASE_URL}/images/${producto.imagen}` : '/logo.jpg';

  return (
    <Box className="app-bg">
      <Box
        className="container"
        sx={{
          // mt: 2,  // eliminado: el wrapper global ya reserva espacio bajo el NavbarTop
          pb: 2,    // antes: 'calc(80px + env(safe-area-inset-bottom))' (duplicaba el padding inferior global)
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 680,
            borderRadius: 3,
            overflow: 'hidden',
            // height: { xs: '86vh', sm: '78vh', md: '72vh' }, // si causa scroll incómodo, comenta esta línea
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sección superior: 30% */}
          <Box
            sx={{
              flex: '0 0 30%', // ocupa aproximadamente 30% del alto del Paper
              background: 'linear-gradient(180deg,#0b7a4f 0%, #0a703f 100%)',
              color: '#fff',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              px: { xs: 2, sm: 3 },
            }}
          >
            {/* Botón Volver (flotante) */}
            <IconButton
              aria-label="volver"
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                left: 12,
                top: 12,
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                '&:hover': { background: 'rgba(255,255,255,0.18)' },
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>

            {/* Imagen centrada */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <Fade in timeout={400}>
                <Box
                  component="img"
                  src={imgSrc}
                  alt={producto.descripcion}
                  sx={{
                    maxWidth: { xs: '70%', sm: '60%' },
                    maxHeight: { xs: 110, sm: 140, md: 160 },
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.25))',
                  }}
                />
              </Fade>
            </Box>

            {/* Nombre y categoría en la parte inferior del área verde */}
            <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 16 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                {producto.descripcion ?? 'Sin descripción'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                {producto.categoria ?? ''}
              </Typography>
            </Box>
          </Box>

          {/* Sección inferior: 70% (tabs y contenido) */}
          <Box
            sx={{
              flex: '1 1 70%',
              background: '#fff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Tabs header */}
            <Box sx={{ px: 1.5, pt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Tabs
                  value={tab}
                  onChange={(e, v) => setTab(v)}
                  variant="standard"
                  sx={{
                    '& .MuiTabs-indicator': { backgroundColor: '#0b7a4f' },
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minWidth: 120 },
                  }}
                >
                  <Tab label="Detalles" />
                  <Tab label="Colores & Proveedor" />
                </Tabs>
              </Stack>
              <Divider sx={{ mt: 1 }} />
            </Box>

            {/* Contenido con scroll interno si hace falta */}
            <Box sx={{ p: 2, overflowY: 'auto' }}>
              {/* Detalles */}
              <TabPanel value={tab} index={0}>
                <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 700 }}>
                  Datos Informativos
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxWidth: 560,
                    mx: 'auto',
                    background: '#fff',
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': { py: 1.25, px: 2 },
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: '46%', fontWeight: 500, color: 'text.secondary' }}>Medida</TableCell>
                        <TableCell align="right" className="data-nums" sx={{ fontWeight: 700 }}>
                          {producto.medida ?? '-'}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Precio Venta</TableCell>
                        <TableCell
                          align="right"
                          className="data-nums"
                          sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}
                        >
                          {showVenta ? (
                            <Typography sx={{ fontWeight: 900, fontSize: '1rem' }} className="data-nums">
                              ${Number(producto.precio_venta ?? 0).toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontWeight: 900 }}>$ *.* *</Typography>
                          )}
                          <Tooltip title={showVenta ? 'Ocultar precio' : 'Mostrar precio'}>
                            <IconButton size="small" onClick={() => setShowVenta(s => !s)}>
                              {showVenta ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Precio Compra</TableCell>
                        <TableCell
                          align="right"
                          className="data-nums"
                          sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}
                        >
                          {showCompra ? (
                            <Typography sx={{ fontWeight: 800 }} className="data-nums">
                              ${Number(producto.precio_compra ?? 0).toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontWeight: 800 }}>$ *.* *</Typography>
                          )}
                          <Tooltip title={showCompra ? 'Ocultar precio compra' : 'Mostrar precio compra'}>
                            <IconButton size="small" onClick={() => setShowCompra(s => !s)}>
                              {showCompra ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>Stock</TableCell>
                        <TableCell align="right" className="data-nums">
                          <Typography sx={{ fontWeight: 800 }} className="data-nums">
                            {producto.cantidad_disponible ?? 0}
                          </Typography>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>SKU / Código</TableCell>
                        <TableCell align="right" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ letterSpacing: 1 }}>{producto.codigo_variante ?? codigo ?? '-'}</Typography>
                          <Tooltip title={copied ? 'Copiado' : 'Copiar SKU'}>
                            <IconButton size="small" onClick={() => handleCopySKU(producto.codigo_variante ?? codigo ?? '')}>
                              {copied ? <DoneIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </TabPanel>

              {/* Colores & Proveedor */}
              <TabPanel value={tab} index={1}>
                <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 700 }}>
                  Colores
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {producto.colores && producto.colores.length ? (
                    producto.colores.map((c, idx) => (
                      <Chip
                        key={idx}
                        label={c.color}
                        sx={{
                          backgroundColor: c.codigo_color || '#eee',
                          color: c.codigo_color && c.codigo_color.toLowerCase() === '#000000' ? '#fff' : '#000',
                          borderRadius: 2,
                          px: 1.5,
                          fontWeight: 600,
                        }}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">Sin colores</Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 1.2, fontWeight: 700 }}>
                  Proveedor
                </Typography>
                <Paper variant="outlined" sx={{ mt: 1, p: 2, borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>{producto.proveedor?.nombre ?? 'Sin proveedor'}</Typography>
                  <Typography variant="body2" color="text.secondary">{producto.proveedor?.actividad ?? ''}</Typography>
                </Paper>
              </TabPanel>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}