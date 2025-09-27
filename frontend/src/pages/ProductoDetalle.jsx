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
  Button,
  Tooltip,
  Fade
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
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
    setLoading(true);
    fetchProductoPorCodigo(codigo)
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo obtener el producto');
        setLoading(false);
      });
  }, [codigo]);

  const handleCopySKU = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  if (loading)
    return (
      <Box className="app-bg">
        <Box className="container" sx={{ mt: 4, pb: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box className="app-bg">
        <Box className="container" sx={{ mt: 4, pb: 10 }}>
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );

  if (!producto) return null;

  const imgSrc = producto.imagen ? `${BASE_URL}/images/${producto.imagen}` : '/logo.jpg';

  return (
    <Box className="app-bg">
      {/* pb evita solaparse con un NavbarBottom fijo */}
      <Box className="container" sx={{ mt: 2, pb: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top card compacta */}
          <Paper
            elevation={6}
            sx={{
              mx: 2,
              mt: 2,
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(180deg,#0b7a4f 0%, #0a703f 100%)',
              color: '#fff',
              position: 'relative',
            }}
          >
            <IconButton
              aria-label="volver"
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                left: 12,
                top: 12,
                zIndex: 9,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '&:hover': { background: 'rgba(255,255,255,0.22)' },
                boxShadow: 2,
                borderRadius: 1,
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>

            {/* Contenedor de imagen más bajo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 1, sm: 1.5 },
                minHeight: { xs: 88, sm: 110 },
                position: 'relative',
              }}
            >
              <Fade in timeout={500}>
                <Box
                  component="img"
                  src={imgSrc}
                  alt={producto.descripcion}
                  sx={{
                    maxWidth: { xs: '68%', sm: '58%' },
                    maxHeight: { xs: 88, sm: 110 },
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.25))',
                  }}
                />
              </Fade>
            </Box>

            {/* Descripción/categoría con menos padding vertical */}
            <Box sx={{ p: 1.25, pt: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {producto.descripcion ?? 'Sin descripción'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                {producto.categoria ?? ''}
              </Typography>
            </Box>
          </Paper>

          {/* Contenido */}
          <Box sx={{ mx: 2, mt: 2 }}>
            <Paper sx={{ p: 1.5, borderRadius: 3, boxShadow: 3 }}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': { backgroundColor: '#0b7a4f' },
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 },
                }}
              >
                <Tab label="Detalles" />
                <Tab label="Colores & Proveedor" />
              </Tabs>

              <Divider sx={{ my: 1 }} />

              {/* Detalles */}
              <TabPanel value={tab} index={0}>
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.2, fontWeight: 700 }}>
                    Datos Informativos
                  </Typography>

                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', maxWidth: 480, mx: 'auto' }}>
                    <Table
                      size="small"
                      sx={{
                        '& .MuiTableCell-root': { py: 0.5, px: 1.25 },
                      }}
                    >
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '42%', fontWeight: 400 }}>Medida</TableCell>
                          <TableCell align="right">{producto.medida ?? '-'}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ fontWeight: 400 }}>Precio Venta</TableCell>
                          <TableCell
                            align="right"
                            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.75 }}
                          >
                            {showVenta ? (
                              <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                ${Number(producto.precio_venta ?? 0).toFixed(2)}
                              </Typography>
                            ) : (
                              <Typography sx={{ fontWeight: 800 }}>$ *.* *</Typography>
                            )}
                            <Tooltip title={showVenta ? 'Ocultar precio' : 'Mostrar precio'}>
                              <IconButton size="small" onClick={() => setShowVenta((s) => !s)}>
                                {showVenta ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ fontWeight: 400 }}>Precio Compra</TableCell>
                          <TableCell
                            align="right"
                            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.75 }}
                          >
                            {showCompra ? (
                              <Typography sx={{ fontWeight: 800 }}>${Number(producto.precio_compra ?? 0).toFixed(2)}</Typography>
                            ) : (
                              <Typography sx={{ fontWeight: 800 }}>$ *.* *</Typography>
                            )}
                            <Tooltip title={showCompra ? 'Ocultar precio compra' : 'Mostrar precio compra'}>
                              <IconButton size="small" onClick={() => setShowCompra((s) => !s)}>
                                {showCompra ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ fontWeight: 400 }}>Stock</TableCell>
                          <TableCell align="right">{producto.cantidad_disponible ?? 0}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell sx={{ fontWeight: 400 }}>SKU / Código</TableCell>
                          <TableCell
                            align="right"
                            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.75 }}
                          >
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
                </Box>
              </TabPanel>

              {/* Colores & Proveedor */}
              <TabPanel value={tab} index={1}>
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.2, fontWeight: 700 }}>
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

                  <Typography variant="subtitle1" sx={{ mb: 1.2, fontWeight: 700 }}>
                    Proveedor
                  </Typography>
                  <Paper variant="outlined" sx={{ mt: 1, p: 2, borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 800 }}>{producto.proveedor?.nombre ?? 'Sin proveedor'}</Typography>
                    <Typography variant="body2" color="text.secondary">{producto.proveedor?.actividad ?? ''}</Typography>
                  </Paper>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}