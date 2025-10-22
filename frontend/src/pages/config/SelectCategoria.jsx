import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, List, ListItemButton, ListItemText,
  CircularProgress, Box, Snackbar, Alert, IconButton, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBack from '../../components/NavBack';
import { fetchProductoEdicion } from '../../api';

export default function SelectCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state?.currentId ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cats, setCats] = useState([]);

  const normId = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
  const sameId = (a, b) => String(a) === String(b);

  const [selectedId, setSelectedId] = useState(() => normId(preselect));

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchProductoEdicion(id);
        setCats(d?.lookups?.categorias || []);
      } catch (e) {
        console.error('[SelectCategoria] load error:', e);
        setError('No se pudieron cargar categorías');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pick = (cat) => {
    const pickedId = normId(cat.id ?? cat.id_categoria ?? cat.idCategoria);
    setSelectedId(pickedId); // Solo marcar, el usuario decide cuándo volver
    console.log('[SelectCategoria] pick (marcada):', { pickedId });
  };

  const handleBack = () => {
    if (selectedId != null && !sameId(selectedId, preselect)) {
      // Regresa al padre con la selección aplicada
      navigate(`/config/productos/${id}/editar`, {
        replace: true,
        state: { pick: { tipo: 'categoria', id: selectedId }, slide: 'right' }
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
      state: { pick: { tipo: 'categoria', id: selectedId }, slide: 'right' }
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
            Categoría
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
          {cats.map((c) => {
            const cid = c.id ?? c.id_categoria ?? c.idCategoria;
            const isSel = selectedId != null && sameId(cid, selectedId);
            return (
              <ListItemButton key={cid} onClick={() => pick(c)}>
                <ListItemText primary={c.nombre} />
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