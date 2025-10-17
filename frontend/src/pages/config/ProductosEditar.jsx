import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Container, Stack, Typography, Box, TextField, MenuItem, IconButton,
  Button, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';
import NavBack from '../../components/NavBack';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { fetchProductoEdicion, updateProducto, getImagenUrl } from '../../api';

export default function ProductosEditar() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const d = await fetchProductoEdicion(id);
      setData(d);
    } catch (e) {
      console.error('[ProductosEditar] load:', e);
      setError('No se pudo cargar datos de edición.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Copias editables
  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);

  useEffect(() => {
    if (!data) return;
    setProducto({ ...data.producto });
    setVariantes((data.variantes || []).map(v => ({ ...v, colores: [...(v.colores || [])] })));
  }, [data]);

  const titulo = useMemo(() => producto?.descripcion || 'Editar producto', [producto]);
  const imgUrl = producto?.imagen ? getImagenUrl(producto.imagen) : null;

  const onAddVar = () => setVariantes(prev => [...prev, {
    id: 0, id_producto: Number(id), medida: '', codigo_variante: '', precio_venta: 0, precio_compra: 0, fecha_ingreso: '', colores: []
  }]);
  const onDelVar = (idx) => setVariantes(prev => prev.filter((_, i) => i !== idx));
  const onVarChange = (idx, key, val) => setVariantes(prev => prev.map((v, i) => i === idx ? { ...v, [key]: val } : v));
  const onAddColor = (idx) => setVariantes(prev => prev.map((v, i) => i === idx ? { ...v, colores: [...(v.colores || []), { color: '', codigo_color: '' }] } : v));
  const onDelColor = (idx, cidx) => setVariantes(prev => prev.map((v, i) => i === idx ? { ...v, colores: v.colores.filter((_, j) => j !== cidx) } : v));
  const onColorChange = (idx, cidx, key, val) => setVariantes(prev => prev.map((v, i) => {
    if (i !== idx) return v;
    const cols = v.colores.map((c, j) => j === cidx ? { ...c, [key]: val } : c);
    return { ...v, colores: cols };
  }));

  const onSave = async () => {
    if (!producto) return;
    setSaving(true); setError('');
    try {
      // Nota: este endpoint actualiza variantes existentes; para nuevas (id=0) deberías agregar INSERT en backend.
      await updateProducto(id, { producto, variantes });
      navigate(`/config/productos/${id}/variantes`, { replace: true });
    } catch (e) {
      console.error('[ProductosEditar] save:', e);
      setError('No se pudo guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <NavBack ariaLabel="Volver a Variantes" to={`/config/productos/${id}/variantes`} />
        {imgUrl && (
          <Box component="img" src={imgUrl} alt={titulo}
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
               sx={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 0.5 }} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{titulo}</Typography>
        <Box sx={{ flex: 1 }} />
        {loading && <CircularProgress size={16} thickness={5} sx={{ mr: 1 }} />}
        <IconButton size="small" onClick={load} title="Refrescar"><RefreshRoundedIcon fontSize="small" /></IconButton>
      </Stack>

      {loading || !producto ? (
        <Typography variant="body2" color="text.secondary">Cargando…</Typography>
      ) : (
        <>
          <Box sx={{ display: 'grid', gap: 16, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Producto</Typography>
              <TextField fullWidth label="Descripción" value={producto.descripcion || ''}
                         onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })} sx={{ mb: 1 }} />
              <TextField fullWidth label="Material" value={producto.material || ''}
                         onChange={(e) => setProducto({ ...producto, material: e.target.value })} sx={{ mb: 1 }} />
              <TextField select fullWidth label="Categoría" value={producto.id_categoria || ''}
                         onChange={(e) => setProducto({ ...producto, id_categoria: Number(e.target.value) || null })} sx={{ mb: 1 }}>
                {(data?.lookups?.categorias || []).map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Proveedor" value={producto.id_proveedor || ''}
                         onChange={(e) => setProducto({ ...producto, id_proveedor: Number(e.target.value) || null })} sx={{ mb: 1 }}>
                {(data?.lookups?.proveedores || []).map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Imagen (ruta)" value={producto.imagen || ''}
                         onChange={(e) => setProducto({ ...producto, imagen: e.target.value })} />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Variantes</Typography>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={onAddVar} sx={{ mb: 1 }}>Agregar variante</Button>
              <Stack spacing={2}>
                {variantes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Sin variantes.</Typography>
                ) : variantes.map((v, idx) => (
                  <Box key={idx} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">Variante {idx + 1}</Typography>
                      <Box sx={{ flex: 1 }} />
                      <IconButton color="error" size="small" onClick={() => onDelVar(idx)} title="Quitar variante">
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <TextField fullWidth label="Medida" value={v.medida || ''} sx={{ mb: 1 }}
                               onChange={(e) => onVarChange(idx, 'medida', e.target.value)} />
                    <TextField fullWidth label="Código variante" value={v.codigo_variante || ''} sx={{ mb: 1 }}
                               onChange={(e) => onVarChange(idx, 'codigo_variante', e.target.value)} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                      <TextField type="number" fullWidth label="Precio venta" value={v.precio_venta ?? ''} 
                                 onChange={(e) => onVarChange(idx, 'precio_venta', e.target.value)} />
                      <TextField type="number" fullWidth label="Precio compra" value={v.precio_compra ?? ''} 
                                 onChange={(e) => onVarChange(idx, 'precio_compra', e.target.value)} />
                      <TextField type="date" fullWidth label="Fecha ingreso" InputLabelProps={{ shrink: true }}
                                 value={v.fecha_ingreso ? String(v.fecha_ingreso).slice(0,10) : ''}
                                 onChange={(e) => onVarChange(idx, 'fecha_ingreso', e.target.value)} />
                    </Stack>
                    <Typography variant="body2" sx={{ mb: 1 }}>Colores</Typography>
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onAddColor(idx)} sx={{ mb: 1 }}>
                      Agregar color
                    </Button>
                    <Stack spacing={1}>
                      {(v.colores || []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Sin colores.</Typography>
                      ) : (v.colores || []).map((c, cidx) => (
                        <Stack key={cidx} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <TextField label="Color" value={c.color || ''} onChange={(e) => onColorChange(idx, cidx, 'color', e.target.value)} />
                          <TextField label="Código color" value={c.codigo_color || ''} onChange={(e) => onColorChange(idx, cidx, 'codigo_color', e.target.value)} />
                          <IconButton color="error" size="small" onClick={() => onDelColor(idx, cidx)}><DeleteRoundedIcon /></IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(`/config/productos/${id}/variantes`)}>Cancelar</Button>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={saving} onClick={onSave}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </Stack>

          <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
            <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
}