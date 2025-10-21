import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Container, Stack, Typography, Box, TextField, IconButton, Button,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import NavBack from '../../components/NavBack';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { fetchProductoEdicion, updateProducto, canDeleteVariante, deleteVariante } from '../../api';

export default function VariantesEditar() {
  const { id, idVariante } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const isNew = idVariante === 'nueva';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [v, setV] = useState({
    id: 0,
    id_producto: 0,
    medida: '',
    codigo_variante: '',
    precio_venta: '',
    precio_compra: '',
    fecha_ingreso: ''
  });

  const [canDelete, setCanDelete] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(null);

  const titulo = useMemo(() => (isNew ? 'Nueva Medida' : (v.medida || 'Variante')), [isNew, v.medida]);

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const d = await fetchProductoEdicion(id);
      setData(d);

      if (isNew) {
        setV({
          id: 0,
          id_producto: Number(id),
          medida: '',
          codigo_variante: '',
          precio_venta: '',
          precio_compra: '',
          fecha_ingreso: ''
        });
        setCanDelete(false);
        setStockDisponible(null);
      } else {
        const varFromState = state?.variante;
        const vv = varFromState?.id ? varFromState : (d.variantes || []).find(x => String(x.id) === String(idVariante));
        if (!vv) {
          setError('No se encontró la variante.');
        } else {
          setV({
            id: vv.id,
            id_producto: Number(id),
            medida: vv.medida ?? '',
            codigo_variante: vv.codigo_variante ?? '',
            precio_venta: vv.precio_venta != null ? String(vv.precio_venta) : '',
            precio_compra: vv.precio_compra != null ? String(vv.precio_compra) : '',
            fecha_ingreso: vv.fecha_ingreso ? String(vv.fecha_ingreso).slice(0, 10) : ''
          });
          try {
            const res = await canDeleteVariante(vv.id);
            setCanDelete(!!res?.canDelete);
            setStockDisponible(typeof res?.stock === 'number' ? res.stock : null);
          } catch {
            setCanDelete(true);
            setStockDisponible(null);
          }
        }
      }
    } catch (e) {
      console.error('[VariantesEditar] load:', e);
      setError('No se pudo cargar la variante.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, idVariante]);

  const onSave = async () => {
    if (!data) return;
    setSaving(true); setError('');
    try {
      const variantesActuales = data.variantes || [];
      let nuevasVariantes;
      if (isNew) {
        const nueva = {
          id: 0,
          id_producto: Number(id),
          medida: v.medida,
          codigo_variante: v.codigo_variante,
          precio_venta: Number(v.precio_venta || 0),
          precio_compra: Number(v.precio_compra || 0),
          fecha_ingreso: v.fecha_ingreso || null,
          colores: []
        };
        nuevasVariantes = [...variantesActuales, nueva];
      } else {
        nuevasVariantes = variantesActuales.map(x =>
          x.id === v.id
            ? {
                ...x,
                medida: v.medida,
                codigo_variante: v.codigo_variante,
                precio_venta: Number(v.precio_venta || 0),
                precio_compra: Number(v.precio_compra || 0),
                fecha_ingreso: v.fecha_ingreso || null
              }
            : x
        );
      }

      await updateProducto(id, { producto: data.producto, variantes: nuevasVariantes });
      navigate(`/config/productos/${id}/variantes`, { replace: true });
    } catch (e) {
      console.error('[VariantesEditar] save:', e);
      setError('No se pudo guardar la variante.');
    } finally {
      setSaving(false);
    }
  };

  const [confirmDel, setConfirmDel] = useState(false);
  const onDelete = async () => {
    if (isNew || !v.id) return;
    setSaving(true); setError('');
    try {
      await deleteVariante(v.id);
      navigate(`/config/productos/${id}/variantes`, { replace: true });
    } catch (e) {
      console.error('[VariantesEditar] delete:', e);
      const status = e?.status || e?.response?.status;
      const code = e?.data?.code || e?.response?.data?.code;
      const stock = e?.data?.stock ?? e?.response?.data?.stock;
      if (status === 409 || code === 'VARIANTE_CON_STOCK') {
        setError(`No se puede eliminar: stock disponible ${typeof stock === 'number' ? stock : 'en ubicaciones'}.`);
        try {
          const res = await canDeleteVariante(v.id);
          setCanDelete(!!res?.canDelete);
          setStockDisponible(typeof res?.stock === 'number' ? res.stock : null);
        } catch {}
      } else {
        setError('No se pudo eliminar la variante.');
      }
    } finally {
      setSaving(false);
      setConfirmDel(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <NavBack ariaLabel="Volver a Variantes" to={`/config/productos/${id}/variantes`} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {titulo}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {loading && <CircularProgress size={16} thickness={5} sx={{ mr: 1 }} />}
        {!isNew && (
          <IconButton color="error" onClick={() => setConfirmDel(true)} title="Eliminar variante" disabled={!canDelete}>
            <DeleteRoundedIcon />
          </IconButton>
        )}
        <IconButton size="small" onClick={load} title="Refrescar"><RefreshRoundedIcon fontSize="small" /></IconButton>
      </Stack>

      {loading ? (
        <Box sx={{ height: 120, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            <TextField
              fullWidth label="Medida" value={v.medida}
              onChange={(e) => setV(s => ({ ...s, medida: e.target.value }))}
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              fullWidth label="Código variante" value={v.codigo_variante}
              onChange={(e) => setV(s => ({ ...s, codigo_variante: e.target.value }))}
              inputProps={{ autoComplete: 'off' }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                type="text" inputMode="decimal" pattern="[0-9]*"
                fullWidth label="Precio venta" value={v.precio_venta}
                onChange={(e) => setV(s => ({ ...s, precio_venta: e.target.value }))}
              />
              <TextField
                type="text" inputMode="decimal" pattern="[0-9]*"
                fullWidth label="Precio compra" value={v.precio_compra}
                onChange={(e) => setV(s => ({ ...s, precio_compra: e.target.value }))}
              />
              <TextField
                type="date" fullWidth label="Fecha ingreso" InputLabelProps={{ shrink: true }}
                value={v.fecha_ingreso}
                onChange={(e) => setV(s => ({ ...s, fecha_ingreso: e.target.value }))}
              />
            </Stack>
            {!isNew && stockDisponible != null && (
              <Alert severity={canDelete ? 'success' : 'warning'}>
                Stock disponible: {stockDisponible}. {canDelete ? 'Se puede eliminar.' : 'No se puede eliminar hasta que sea 0.'}
              </Alert>
            )}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate(`/config/productos/${id}/variantes`)}>
              Cancelar
            </Button>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={saving} onClick={onSave}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </Stack>
        </>
      )}

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle>Eliminar variante</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {canDelete
              ? '¿Deseas eliminar esta variante?'
              : 'No se puede eliminar: hay stock disponible en ubicaciones.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button color="error" variant="contained" startIcon={<DeleteRoundedIcon />} onClick={onDelete} disabled={!canDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}