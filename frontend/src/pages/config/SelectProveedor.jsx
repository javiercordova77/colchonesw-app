import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, List, ListItemButton, ListItemText,
  CircularProgress, Box, Snackbar, Alert, IconButton, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const normId = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const sameId = (a, b) => String(a) === String(b);

export default function SelectProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const preselect = normId(location.state?.currentId ?? null);
  const items = useMemo(
    () => (Array.isArray(location.state?.list) ? location.state.list : []),
    [location.state?.list]
  );

  const [selectedId, setSelectedId] = useState(preselect);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[SelectProveedor] mount state:', location.state);
    if (!items.length) {
      console.warn('[SelectProveedor] no hay list en location.state; verifica openSelectProveedor()');
    } else {
      console.log('[SelectProveedor] proveedores recibidos:', items.length, 'preselect:', preselect);
    }
  }, [items.length, preselect, location.state]);

  const onPick = (p) => {
    const pickedId = normId(p.id ?? p.id_proveedor ?? p.idProveedor);
    setSelectedId(pickedId);
    console.log('[SelectProveedor] pick (solo marcado):', { pickedId });
  };

  const handleBack = () => {
    console.log('[SelectProveedor] back pressed', { selectedId, preselect, willApply: false });
    navigate(-1);
  };

  const handleApply = () => {
    const willApply = selectedId != null && !sameId(selectedId, preselect);
    console.log('[SelectProveedor] apply pressed', { selectedId, preselect, willApply });
    if (!willApply) {
      navigate(-1);
      return;
    }
    navigate(`/config/productos/${id}/editar`, {
      replace: true,
      state: { pick: { tipo: 'proveedor', id: selectedId }, slide: 'right' }
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f2f2f7' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#f2f2f7', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, position: 'relative', gap: 1 }}>
          <IconButton onClick={handleBack} edge="start" aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', pointerEvents: 'none', fontWeight: 600 }}>
            Proveedor
          </Typography>
          <Button onClick={handleApply} variant="text" sx={{ minWidth: 64 }}>
            Aplicar
          </Button>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <List sx={{ bgcolor: '#fff' }}>
          {items.map((p) => {
            const pid = p.id ?? p.id_proveedor ?? p.idProveedor;
            const isSel = selectedId != null && sameId(pid, selectedId);
            return (
              <ListItemButton key={pid} onClick={() => onPick(p)}>
                <ListItemText primary={p.nombre} />
                {isSel && <span style={{ color: 'var(--mui-palette-primary-main)' }}>✓</span>}
              </ListItemButton>
            );
          })}
          {!items.length && (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">Sin proveedores.</Typography>
            </Box>
          )}
        </List>
      )}

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}