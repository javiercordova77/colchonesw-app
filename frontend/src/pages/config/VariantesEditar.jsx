import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Button,
  Divider, Snackbar, Alert, InputBase, Switch, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavBack from '../../components/NavBack';

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 64,           // más ancho
  height: 30,          // un poco menos alto
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 4,         // deja el thumb “dentro” del track
    transitionDuration: '200ms',
    '&.Mui-checked': {
      transform: 'translateX(24px)', // 64 - 32 - (4*2) = 24
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#34C759',  // ON
        opacity: 1,
        border: 0
      }
    },
    '&.Mui-disabled .MuiSwitch-thumb': { color: theme.palette.grey[100] },
    '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.5 }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 32,         // ovalado (más ancho que alto)
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    border: '1px solid rgba(0,0,0,0.06)'
  },
  '& .MuiSwitch-track': {
    borderRadius: 9999,
    backgroundColor: '#E5E5EA',      // OFF
    opacity: 1,
    transition: theme.transitions.create(['background-color'], { duration: 200 })
  }
}));

export default function VariantesEditar() {
  const { id, idVariante } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme = useTheme();

  const isNew = idVariante === 'nueva';
  const varianteInit = state?.variante || {};

  // Helpers visuales iguales a ProductosEditar
  const pageBg = '#f2f2f7';
  const cellRadius = 2;
  const cellShadow = '0 1px 2px rgba(0,0,0,0.06)';
  const labelColor = '#000';
  const valueColor = theme.palette.grey[700];

  const CellRow = ({ label, children, first = false }) => (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.25,
        borderTop: first ? 'none' : '1px solid', borderColor: 'divider'
      }}
    >
      <Typography sx={{ flex: '0 0 180px', color: labelColor, fontWeight: 400 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        {children}
      </Box>
    </Box>
  );

  const RightInput = (props) => (
    <InputBase
      {...props}
      sx={{
        textAlign: 'right',
        color: valueColor,
        '& input': { textAlign: 'right', padding: '6px 0' },
        ...props.sx
      }}
      inputProps={{ ...props.inputProps, 'aria-label': props['aria-label'] || 'input' }}
    />
  );

  const toDateInput = (v) => {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return String(v);
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  const computeTotalStock = (v) => {
    if (typeof v?.stock_total === 'number') return Number(v.stock_total) || 0;
    if (Array.isArray(v?.stock_ubicaciones)) {
      return v.stock_ubicaciones.reduce((acc, u) => acc + Number(u?.cantidad_disponible || 0), 0);
    }
    if (typeof v?.stock === 'number') return Number(v.stock) || 0;
    if (v?.stock?.ubicaciones) {
      return (v.stock.ubicaciones || []).reduce((a, u) => a + Number(u?.cantidad_disponible || 0), 0);
    }
    return 0;
  };

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

  const [colores, setColores] = useState(() => (
    Array.isArray(varianteInit.colores) ? varianteInit.colores : []
  ));

  const totalStock = useMemo(() => computeTotalStock(varianteInit), [varianteInit]);

  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });

  const titulo = useMemo(() => medida || 'Variante', [medida]);

  const onToggleActivo = (e, checked) => {
    if (!checked && totalStock > 0) {
      setSnack({ open: true, severity: 'warning', msg: 'No puedes desactivar la medida: tiene stock disponible.' });
      return;
    }
    setActivo(checked);
  };

  const onAgregarColor = () => {
    setSnack({ open: true, severity: 'info', msg: 'Seleccionar color: pendiente de implementar.' });
  };

  const onAplicar = () => {
    const patch = {
      id: isNew ? undefined : Number(idVariante),
      medida: medida?.trim() || '',
      codigo_variante: codigo?.trim() || '',
      precio_venta: precioVenta === '' ? null : Number(String(precioVenta).replace(',', '.')),
      precio_compra: precioCompra === '' ? null : Number(String(precioCompra).replace(',', '.')),
      fecha_ingreso: fechaIngreso || null,
      activo: activo ? 1 : 0,
      colores
    };

    navigate(`/config/productos/${id}/editar`, {
      replace: true,
      state: { variantePatch: patch, slide: 'right' }
    });
  };

  useEffect(() => {
    // Si necesitas cargar por idVariante desde backend, aquí iría.
  }, [idVariante]);

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
        {/* ESPECIFICACIONES */}
        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
          Especificaciones
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          <CellRow label="Medida" first>
            <RightInput value={medida} onChange={(e) => setMedida(e.target.value)} placeholder="Ej. 2 plazas" />
          </CellRow>
          <CellRow label="Código variante">
            <RightInput value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. ABC-123" />
          </CellRow>
          <CellRow label="Precio venta">
            <RightInput
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              placeholder="0.00"
              inputProps={{ inputMode: 'decimal' }}
            />
          </CellRow>
          <CellRow label="Precio compra">
            <RightInput
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              placeholder="0.00"
              inputProps={{ inputMode: 'decimal' }}
            />
          </CellRow>
          <CellRow label="Fecha ingreso">
            <RightInput
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              sx={{ minWidth: 180 }}
            />
          </CellRow>
        </Paper>

        {/* Activo (sin título de bloque) */}
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          <CellRow label="Activar Medida" first>
            <IOSSwitch checked={activo} onChange={onToggleActivo} />
          </CellRow>
          {totalStock > 0 && (
            <Box sx={{ px: 2, py: 1, pt: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Nota: no se puede desactivar la medida si tiene stock disponible (stock actual: {totalStock}).
              </Typography>
            </Box>
          )}
        </Paper>

        {/* COLORES */}
        <Typography variant="overline" sx={{ color: 'text.secondary', px: 1, letterSpacing: 0.6 }}>
          Colores
        </Typography>

        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: cellRadius, boxShadow: cellShadow, overflow: 'hidden', mb: 2 }}>
          {Array.isArray(colores) && colores.length > 0 ? (
            colores.map((c, i) => (
              <Box
                key={`${c.color || c.nombre || 'color'}-${i}`}
                sx={{ borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider', px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
              >
                <Typography sx={{ color: labelColor }}>{c.color || c.nombre || 'Color'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: 0.8, background: c.codigo_color || c.codigo || '#e0e0e0', border: '1px solid rgba(0,0,0,0.12)' }} />
                  <Typography sx={{ color: valueColor }}>{c.codigo_color || c.codigo || '-'}</Typography>
                </Box>
              </Box>
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