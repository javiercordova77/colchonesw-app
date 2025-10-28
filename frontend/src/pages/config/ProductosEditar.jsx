import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Button,
  Divider, CircularProgress, Snackbar, Alert, useTheme
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavBack from '../../components/NavBack';
import RightInputUncontrolled from '../../components/RightInputUncontrolled';
import { focusHandlers, logMount, logRender } from '../../utils/focusDebug';
import { fetchProductoEdicion, updateProducto } from '../../api';
import { consumeVarianteDraft, clearAllDraftsForProducto } from '../../utils/drafts';

export default function ProductosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  // Logs de render y montaje
  const renderRef = useRef(0);
  logRender('ProductosEditar', renderRef);
  useEffect(() => logMount('ProductosEditar'), []);
  useEffect(() => {
    console.log('[LOCATION]', location.pathname, location.state);
  }, [location.pathname, location.state]);

  // Estado base
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [data, setData] = useState(null);

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);

  // Para rollback si el usuario sale sin guardar
  const savedRef = useRef(false);

  // Helpers
  const normId = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

  // Carga de datos
  const load = async () => {
    setError(''); setLoading(true);
    try {
      const d = await fetchProductoEdicion(id);
      const p = {
        ...d.producto,
        id_categoria: normId(d.producto?.id_categoria),
        id_proveedor: normId(d.producto?.id_proveedor),
      };
      setData(d);
      setProducto(p);
      setVariantes((d.variantes || []).map(v => ({ ...v, _cid: `v-${v.id}` })));
    } catch (e) {
      console.error('[ProductosEditar] load error:', e);
      setError('No se pudo cargar datos de edición.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [id]);

  // Consumir draft de variante cuando regresamos desde VariantesEditar
  useEffect(() => {
    const d = consumeVarianteDraft(id);
    if (!d) return;
    console.log('[DRAFT VARIANTE FOUND]', d);
    setVariantes(prev => {
      const list = Array.isArray(prev) ? [...prev] : [];
      if (d.id != null) {
        const idx = list.findIndex(x => String(x.id) === String(d.id));
        if (idx >= 0) list[idx] = { ...list[idx], ...d, _cid: list[idx]._cid || `v-${d.id}` };
        else list.push({ ...d, _cid: `v-${d.id}` });
      } else {
        list.push({ ...d, _cid: `v-new-${Date.now()}` });
      }
      return list;
    });
    setSnack({ open: true, severity: 'success', msg: 'Cambios de variante aplicados (sin guardar)' });
  }, [location.key, id]);

  // PICK: estacionar y aplicar cuando corresponda (evita que el fetch lo pise)
  const pendingPickRef = useRef(null);

  const applyPick = (pickToApply) => {
    if (!pickToApply) return;
    console.log('[PICK RECEIVED]', pickToApply, 'producto antes:', producto);
    const pickedId = pickToApply.id === '' || pickToApply.id == null ? null : Number(pickToApply.id);
    setProducto(prev => {
      if (!prev) return prev;
      const updated =
        pickToApply.tipo === 'categoria'
          ? { ...prev, id_categoria: pickedId }
          : pickToApply.tipo === 'proveedor'
          ? { ...prev, id_proveedor: pickedId }
          : prev;
      console.log('[PICK APPLIED]', { tipo: pickToApply.tipo, pickedId, productoDespues: updated });
      return updated;
    });
  };

  // Llega pick desde SelectCategoria/SelectProveedor -> estacionar y aplicar si ya hay producto
  useEffect(() => {
    const pick = location.state?.pick;
    if (!pick) return;
    pendingPickRef.current = pick;
    console.log('[PICK STAGED]', pick);

    if (producto) {
      applyPick(pick);
      const { pick: _omit, ...rest } = location.state || {};
      navigate(location.pathname, { replace: true, state: rest });
      pendingPickRef.current = null;
    }
  }, [location.state?.pick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuando termina de cargar el producto, si hay pick pendiente, aplicarlo y limpiar del state
  useEffect(() => {
    if (!producto || !pendingPickRef.current) return;
    applyPick(pendingPickRef.current);
    const { pick: _omit, ...rest } = location.state || {};
    navigate(location.pathname, { replace: true, state: rest });
    pendingPickRef.current = null;
  }, [producto]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estilos
  const pageBg = '#f2f2f7';
  const cellRadius = 2;
  const cellShadow = '0 1px 2px rgba(0,0,0,0.06)';
  const labelColor = '#000';
  const inputColor = theme.palette.grey[700];

  // Fila tipo iOS con protección de eventos
  const CellRow = ({ label, children, chevron = false, onClick, first = false }) => (
    <Box
      onClick={onClick}
      onMouseDownCapture={(e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) e.stopPropagation();
      }}
      onTouchStartCapture={(e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) e.stopPropagation();
      }}
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

  // Debug de foco/nodo para "Descripción" (opcional)
  const descRef = useRef(null);
  const prevNodeRef = useRef(null);
  useEffect(() => {
    if (prevNodeRef.current && prevNodeRef.current !== descRef.current) {
      console.log('[NODE REPLACED] descripcion input', {
        was: prevNodeRef.current,
        now: descRef.current,
        active: document.activeElement?.tagName
      });
    }
    prevNodeRef.current = descRef.current;
  });
  const descFH = focusHandlers('Producto.descripcion');

  // Título estable
  const titulo = useMemo(() => producto?.descripcion || 'Producto', [producto]);

  // Navegación a selects (pasando la lista para filtro local)
  const openSelectCategoria = () => {
    navigate(`/config/productos/${id}/seleccionar-categoria`, {
      state: {
        currentId: producto?.id_categoria ?? null,
        list: data?.lookups?.categorias ?? [],
        slide: 'left'
      }
    });
  };
  const openSelectProveedor = () => {
    navigate(`/config/productos/${id}/seleccionar-proveedor`, {
      state: {
        currentId: producto?.id_proveedor ?? null,
        list: data?.lookups?.proveedores ?? [],
        slide: 'left'
      }
    });
  };

  // Guardar definitivo (commit) y limpiar drafts
  const onSave = async () => {
    if (!producto) return;
    setSaving(true); setError('');
    try {
      await updateProducto(id, { producto, variantes }); // único punto que toca la base
      savedRef.current = true;
      clearAllDraftsForProducto(id); // limpiar borradores al confirmar
      setSnack({ open: true, msg: 'Guardado', severity: 'success' });
      navigate(`/config/productos/${id}/variantes`, { replace: true });
    } catch (e) {
      console.error('[ProductosEditar] save:', e);
      setError('No se pudo guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  // Si el usuario sale sin guardar, descarta drafts (rollback)
  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        clearAllDraftsForProducto(id);
      }
    };
  }, [id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: pageBg }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: pageBg, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, position: 'relative', gap: 1 }}>
          <NavBack />
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
            {/* PRODUCTO */}
            <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
              Producto
            </Typography>

            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
              <CellRow label="Descripción" first>
                <RightInputUncontrolled
                  key={`desc-${producto?.id ?? 'new'}`}
                  ref={descRef}
                  {...descFH}
                  defaultValue={producto.descripcion || ''}
                  onCommit={(v) => setProducto(prev => prev ? ({ ...prev, descripcion: v }) : prev)}
                  placeholder="Ej. Colchón Imperial"
                  inputMode="text"
                />
              </CellRow>
              <CellRow label="Material">
                <RightInputUncontrolled
                  key={`mat-${producto?.id ?? 'new'}`}
                  defaultValue={producto.material || ''}
                  onCommit={(v) => setProducto(prev => prev ? ({ ...prev, material: v }) : prev)}
                  placeholder="Ej. resortes"
                  inputMode="text"
                />
              </CellRow>
              <CellRow label="Categoría" chevron onClick={openSelectCategoria}>
                <Typography sx={{ color: inputColor }}>
                  {(data?.lookups?.categorias || [])
                    .find(c => String((c.id ?? c.id_categoria ?? c.idCategoria)) === String(producto.id_categoria))
                    ?.nombre || 'Selecciona'}
                </Typography>
              </CellRow>
              <CellRow label="Proveedor" chevron onClick={openSelectProveedor}>
                <Typography sx={{ color: inputColor }}>
                  {(data?.lookups?.proveedores || [])
                    .find(p => String((p.id ?? p.id_proveedor ?? p.idProveedor)) === String(producto.id_proveedor))
                    ?.nombre || 'Selecciona'}
                </Typography>
              </CellRow>
              <CellRow label="Imagen (ruta)">
                <RightInputUncontrolled
                  key={`img-${producto?.id ?? 'new'}`}
                  defaultValue={producto.imagen || ''}
                  onCommit={(v) => setProducto(prev => prev ? ({ ...prev, imagen: v }) : prev)}
                  placeholder="productos/colchones/chaideimperial.png"
                  inputMode="text"
                />
              </CellRow>
            </Paper>

            {/* VARIANTES */}
            <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
              Variantes
            </Typography>

            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
              {variantes.length === 0 ? (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">Sin variantes.</Typography>
                </Box>
              ) : (
                variantes.map((v, i) => (
                  <CellRow
                    key={v._cid || v.id || i}
                    label="Medida"
                    onClick={() => navigate(`/config/productos/${id}/variantes/${v.id ?? 'nueva'}`, { state: { variante: v, producto, slide: 'left' } })}
                    first={i === 0}
                    chevron
                  >
                    <Typography variant="body1" sx={{ color: inputColor }}>
                      {v.medida || '(sin medida)'}
                    </Typography>
                  </CellRow>
                ))
              )}

              <Divider />
              <Box sx={{ px: 2, py: 1.25 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/config/productos/${id}/variantes/nueva`, { state: { slide: 'left' } })}
                >
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
      <Snackbar open={snack.open} autoHideDuration={2200} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}