import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Button,
  Divider, CircularProgress, Snackbar, Alert, ListItemButton, ListItemText, InputBase, useTheme
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { fetchProductoEdicion, updateProducto } from '../../api';
import NavBack from '../../components/NavBack';

export default function ProductosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [data, setData] = useState(null);

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const d = await fetchProductoEdicion(id);
      setData(d);
      setProducto({ ...d.producto });
      setVariantes((d.variantes || []).map(v => ({ ...v, _cid: `v-${v.id}` })));
    } catch (e) {
      console.error('[ProductosEditar] load:', e);
      setError('No se pudo cargar datos de edición.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Recibe selección desde vistas hijas y limpia el state
  useEffect(() => {
    const pick = location.state?.pick;
    if (!pick) return;
    if (pick.tipo === 'categoria') setProducto(p => ({ ...p, id_categoria: pick.id }));
    if (pick.tipo === 'proveedor') setProducto(p => ({ ...p, id_proveedor: pick.id }));
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const titulo = useMemo(() => producto?.descripcion || 'Producto', [producto]);

  const onSave = async () => {
    if (!producto) return;
    setSaving(true); setError('');
    try {
      await updateProducto(id, { producto, variantes });
      setSnack({ open: true, msg: 'Guardado', severity: 'success' });
      navigate(`/config/productos/${id}/variantes`, { replace: true });
    } catch (e) {
      console.error('[ProductosEditar] save:', e);
      setError('No se pudo guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  const openSelectCategoria = () => {
    navigate(`/config/productos/${id}/seleccionar-categoria`, {
      state: { currentId: producto?.id_categoria ?? null }
    });
  };
  const openSelectProveedor = () => {
    navigate(`/config/productos/${id}/seleccionar-proveedor`, {
      state: { currentId: producto?.id_proveedor ?? null }
    });
  };

  // Estilos
  const pageBg = '#f2f2f7';
  const cellRadius = 2;
  const cellShadow = '0 1px 2px rgba(0,0,0,0.06)';
  const labelColor = '#000';
  const inputColor = theme.palette.grey[700];

  const CellRow = ({ label, children, chevron = false, onClick, first = false }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25,
        cursor: onClick ? 'pointer' : 'default',
        borderTop: first ? 'none' : '1px solid', borderColor: 'divider',
        '&:active': onClick ? { backgroundColor: 'rgba(0,0,0,0.03)' } : undefined
      }}
    >
      <Typography sx={{ flex: '0 0 180px', color: labelColor, fontWeight: 400 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        {children}
        {chevron && <ChevronRightIcon sx={{ color: 'text.secondary' }} />}
      </Box>
    </Box>
  );

  const RightInput = (props) => (
    <InputBase
      {...props}
      sx={{ textAlign: 'right', color: inputColor, '& input': { textAlign: 'right', padding: '6px 0' }, ...props.sx }}
      inputProps={{ ...props.inputProps, 'aria-label': props['aria-label'] || 'input' }}
    />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: pageBg }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: pageBg, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, position: 'relative', gap: 1 }}>
          <NavBack />  {/* Usa el mismo componente de regreso */}
          <Typography
            variant="subtitle1"
            sx={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', fontWeight: 600 }}
          >
            {titulo}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button onClick={onSave} disabled={saving} variant="text">
              {saving ? <CircularProgress size={16} /> : 'Guardar'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {loading || !producto ? (
          <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
              Producto
            </Typography>

            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
              <CellRow label="Descripción" first>
                <RightInput value={producto.descripcion || ''} onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })} placeholder="Ej. Colchón Imperial" />
              </CellRow>
              <CellRow label="Material">
                <RightInput value={producto.material || ''} onChange={(e) => setProducto({ ...producto, material: e.target.value })} placeholder="Ej. resortes" />
              </CellRow>
              <CellRow label="Categoría" chevron onClick={openSelectCategoria}>
                <Typography sx={{ color: inputColor }}>
                  {(data?.lookups?.categorias || []).find(c => c.id === producto.id_categoria)?.nombre || 'Selecciona'}
                </Typography>
              </CellRow>
              <CellRow label="Proveedor" chevron onClick={openSelectProveedor}>
                <Typography sx={{ color: inputColor }}>
                  {(data?.lookups?.proveedores || []).find(p => p.id === producto.id_proveedor)?.nombre || 'Selecciona'}
                </Typography>
              </CellRow>
              <CellRow label="Imagen (ruta)">
                <RightInput value={producto.imagen || ''} onChange={(e) => setProducto({ ...producto, imagen: e.target.value })} placeholder="productos/colchones/chaideimperial.png" />
              </CellRow>
            </Paper>

            <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
              Variantes
            </Typography>

            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
              {variantes.length === 0 ? (
                <Box sx={{ px: 2, py: 2 }}><Typography variant="body2" color="text.secondary">Sin variantes.</Typography></Box>
              ) : (
                variantes.map((v, i) => (
                  <Box key={v._cid} sx={{ borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider' }}>
                    <ListItemButton
                      onClick={() => navigate(`/config/productos/${id}/variantes/${v.id}`, { state: { variante: v, producto } })}
                      sx={{ px: 2, py: 1.25 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: '#000', fontWeight: 400, mr: 1 }}>Medida</Typography>
                            <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>{v.medida || '(sin medida)'}</Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: '#000', fontWeight: 400, mr: 1 }}>Código</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{v.codigo_variante || '—'}</Typography>
                          </Box>
                        }
                      />
                      <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                    </ListItemButton>
                  </Box>
                ))
              )}
              <Divider />
              <Box sx={{ px: 2, py: 1.25 }}>
                <Button fullWidth variant="outlined" onClick={() => navigate(`/config/productos/${id}/variantes/nueva`)}>
                  + Agregar variante
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Container>

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}