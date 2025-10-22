import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, List, ListItemButton, ListItemText,
  CircularProgress, Box, Snackbar, Alert, IconButton, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchProductoEdicion } from '../../api';

export default function SelectProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state?.currentId ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provs, setProvs] = useState([]);

  const normId = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
  const sameId = (a, b) => String(a) === String(b);

  const [selectedId, setSelectedId] = useState(() => normId(preselect));

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchProductoEdicion(id);
        setProvs(d?.lookups?.proveedores || []);
      } catch (e) {
        console.error('[SelectProveedor] load error:', e);
        setError('No se pudieron cargar proveedores');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pick = (pv) => {
    const pickedId = normId(pv.id ?? pv.id_proveedor ?? pv.idProveedor);
    setSelectedId(pickedId); // Solo marcar, el usuario decide cuándo volver
    console.log('[SelectProveedor] pick (marcado):', { pickedId });
  };

  const handleBack = () => {
    if (selectedId != null && !sameId(selectedId, preselect)) {
      navigate(`/config/productos/${id}/editar`, {
        replace: true,
        state: { pick: { tipo: 'proveedor', id: selectedId }, slide: 'right' }
      });
    } else {
      navigate(-1);
    }
  };

  const handleApply = () => {
    if (selectedId == null || sameId(selectedId, preselect)) {
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
          {provs.map((p) => {
            const pid = p.id ?? p.id_proveedor ?? p.idProveedor;
            const isSel = selectedId != null && sameId(pid, selectedId);
            return (
              <ListItemButton key={pid} onClick={() => pick(p)}>
                <ListItemText primary={p.nombre} />
                {isSel && <span style={{ color: 'var(--mui-palette-primary-main)' }}>✓</span>}
              </ListItemButton>
            );
          })}
        </List>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}