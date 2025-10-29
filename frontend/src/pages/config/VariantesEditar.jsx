import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Button,
  Divider, Snackbar, Alert, Switch, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavBack from '../../components/NavBack';
import RightInputUncontrolled from '../../components/RightInputUncontrolled';
// Opcional: deja el draft por compatibilidad, pero ya no es necesario si usas pick
import { consumeColorDraft } from '../../utils/drafts';

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 64,
  height: 30,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 4,
    transitionDuration: '200ms',
    '&.Mui-checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& + .MuiSwitch-track': { backgroundColor: '#34C759', opacity: 1, border: 0 }
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 32, height: 22, backgroundColor: '#FFFFFF', borderRadius: 9999,
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.06)'
  },
  '& .MuiSwitch-track': { borderRadius: 9999, backgroundColor: '#E5E5EA', opacity: 1 }
}));

export default function VariantesEditar() {
  const { id, idVariante } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isNew = idVariante === 'nueva';
  const varianteInit = location.state?.variante || {};

  const pageBg = '#f2f2f7';
  const cellRadius = 2;
  const cellShadow = '0 1px 2px rgba(0,0,0,0.06)';
  const labelColor = '#000';
  const valueColor = theme.palette.grey[700];

  const CellRow = ({ label, children, first = false, onClick }) => (
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
        borderTop: first ? 'none' : '1px solid', borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <Typography sx={{ flex: '0 0 180px', color: labelColor, fontWeight: 400 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        {children}
        {onClick && <ChevronRightIcon sx={{ color: 'text.secondary' }} />}
      </Box>
    </Box>
  );

  const toDateInput = (v) => {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return String(v);
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  // Estados locales (solo se consolidan al pulsar Aplicar en esta pantalla)
  const [medida, setMedida] = useState(varianteInit.medida || '');
  const [codigo, setCodigo] = useState(varianteInit.codigo_variante || varianteInit.codigo || '');
  const [precioVenta, setPrecioVenta] = useState(
    varianteInit.precio_venta != null ? String(varianteInit.precio_venta) : ''
  );
  const [precioCompra, setPrecioCompra] = useState(
    varianteInit.precio_compra != null ? String(varianteInit.precio_compra) : ''
  );
  const [fechaIngreso, setFechaIngreso] = useState(toDateInput(varianteInit.fecha_ingreso || varianteInit.fechaIngreso));
  const [activo, setActivo] = useState(() => {
    const raw = varianteInit.activo;
    if (raw === 1 || raw === true || raw === '1') return true;
    if (raw === 0 || raw === false || raw === '0') return false;
    return true;
  });
  const [colores, setColores] = useState(() => Array.isArray(varianteInit.colores) ? varianteInit.colores : []);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });

  const titulo = useMemo(() => medida || 'Variante', [medida]);
  const onToggleActivo = (_e, checked) => setActivo(checked);
  const onAgregarColor = () => {
    navigate(`/config/productos/${id}/variantes/${idVariante}/colores/nuevo`, { state: { slide: 'left' } });
  };

  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  // PICK de ColoresEditar: estacionar y aplicar one-shot
  const pendingPickRef = useRef(null);

  const applyPick = (pick) => {
    if (!pick) return;
    if (pick.tipo === 'color' || pick.tipo === 'colores') {
      console.log('[COLOR PICK RECEIVED]', pick);

      // Caso lista completa
      if (pick.tipo === 'colores' && Array.isArray(pick.colores)) {
        setColores(pick.colores);
        console.log('[COLOR PICK APPLIED] set full list:', pick.colores.length);
        return;
      }

      // Caso un color individual
      const incoming = pick.color || {};
      const idxFromState = Number.isInteger(pick.index) ? pick.index : -1;

      setColores(prev => {
        const list = Array.isArray(prev) ? [...prev] : [];
        // buscar por índice preferente; si no, por id
        let idx = idxFromState;
        if (!(idx >= 0 && idx < list.length)) {
          if (incoming.id != null) {
            idx = list.findIndex(x => String(x.id) === String(incoming.id));
          }
        }
        const item = {
          ...(idx >= 0 ? list[idx] : {}),
          ...incoming
        };
        if (idx >= 0 && idx < list.length) {
          list[idx] = item;
          console.log('[COLOR PICK APPLIED][update]', { idx, item });
        } else {
          list.push(item);
          console.log('[COLOR PICK APPLIED][insert]', item);
        }
        return list;
      });
      return;
    }
  };

  // Llega pick desde ColoresEditar -> aplicar y limpiar del history.state (one-shot)
  useEffect(() => {
    const pick = location.state?.pick;
    if (!pick) return;
    pendingPickRef.current = pick;
    console.log('[COLOR PICK STAGED]', pick);

    applyPick(pick);
    const { pick: _omit, ...rest } = location.state || {};
    navigate(location.pathname, { replace: true, state: rest });
    pendingPickRef.current = null;
  }, [location.state?.pick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compatibilidad: si aún usas drafts para colores, se consumen también
  useEffect(() => {
    const d = consumeColorDraft(id);
    if (!d) return;
    console.log('[COLOR DRAFT FOUND]', d);
    const pickFromDraft = { tipo: 'color', color: d, index: Number.isInteger(d.index) ? d.index : undefined };
    applyPick(pickFromDraft);
    setSnack({ open: true, severity: 'success', msg: 'Color aplicado (sin guardar)' });
  }, [id, location.key]);

  // Aplicar variante: enviar pick al padre ProductosEditar (igual a SelectCategoria/Proveedor)
  const onAplicar = () => {
    const payload = {
      id: isNew ? null : Number(idVariante),
      // enviar _cid para que el padre actualice y no inserte duplicado si aún no hay id
      _cid: (location.state?.variante && location.state.variante._cid) || (varianteInit && varianteInit._cid) || null,
      medida,
      codigo_variante: codigo,
      precio_venta: toNumberOrNull(precioVenta),
      precio_compra: toNumberOrNull(precioCompra),
      fecha_ingreso: fechaIngreso || null,
      activo: !!activo,
      colores
    };
    console.log('[VARIANTE/APLICAR] -> navigate with pick', { productoId: id, idVariante, payload });

    // Volver al padre con pick (one-shot). El padre aplica y limpia state.pick.
    navigate(`/config/productos/${id}/editar`, {
      replace: true,
      state: { pick: { tipo: 'variante', variante: payload }, slide: 'right' }
    });
  };

  useEffect(() => { /* carga adicional si aplica */ }, [idVariante]);

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
            <Button onClick={onAplicar} variant="text">Aplicar</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
          Especificaciones
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          <CellRow label="Medida" first>
            <RightInputUncontrolled
              defaultValue={medida}
              onCommit={(v) => setMedida(v)}
              placeholder="Ej. 2 plazas"
              inputMode="text"
            />
          </CellRow>
          <CellRow label="Código variante">
            <RightInputUncontrolled
              defaultValue={codigo}
              onCommit={(v) => setCodigo(v)}
              placeholder="Ej. ABC-123"
              inputMode="text"
            />
          </CellRow>
          <CellRow label="Precio venta">
            <RightInputUncontrolled
              defaultValue={precioVenta}
              onCommit={(v) => setPrecioVenta(v)}
              placeholder="0.00"
              inputMode="decimal"
            />
          </CellRow>
          <CellRow label="Precio compra">
            <RightInputUncontrolled
              defaultValue={precioCompra}
              onCommit={(v) => setPrecioCompra(v)}
              placeholder="0.00"
              inputMode="decimal"
            />
          </CellRow>
          <CellRow label="Fecha ingreso">
            <RightInputUncontrolled
              type="date"
              defaultValue={fechaIngreso}
              onCommit={(v) => setFechaIngreso(v)}
            />
          </CellRow>
        </Paper>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          <CellRow label="Activar Medida" first>
            <IOSSwitch checked={activo} onChange={onToggleActivo} />
          </CellRow>
        </Paper>

        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
          Colores
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          {Array.isArray(colores) && colores.length > 0 ? (
            colores.map((c, i) => (
              <CellRow
                key={`${c.id ?? i}`}
                label={c.color || c.nombre || 'Color'}
                onClick={() =>
                  navigate(`/config/productos/${id}/variantes/${idVariante}/colores/${c.id ?? i}`, {
                    state: { color: c, index: i, slide: 'left' }
                  })
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.0 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 0.8,
                      background: c.codigo_color || c.codigo || '#e0e0e0',
                      border: '1px solid rgba(0,0,0,0.12)'
                    }}
                  />
                  <Typography sx={{ color: valueColor, minWidth: 72, textAlign: 'right' }}>
                    {c.codigo_color || c.codigo || '-'}
                  </Typography>
                  {/* ChevronRightIcon duplicado eliminado; CellRow ya lo renderiza al tener onClick */}
                </Box>
              </CellRow>
            ))
          ) : (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">Sin colores.</Typography>
            </Box>
          )}

          <Divider />
          <Box sx={{ px: 2, py: 1.25 }}>
            <Button fullWidth variant="outlined" onClick={onAgregarColor}>
              + Agregar color
            </Button>
          </Box>
        </Paper>
        
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