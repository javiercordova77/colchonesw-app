import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, List, ListItemButton, ListItemText, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import { fetchProductoEdicion } from '../../api';
import NavBack from '../../components/NavBack';

export default function SelectProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state?.currentId ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provs, setProvs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchProductoEdicion(id);
        setProvs(d?.lookups?.proveedores || []);
      } catch {
        setError('No se pudieron cargar proveedores');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pick = (pv) => {
    navigate(`/config/productos/${id}/editar`, {
      replace: true,
      state: { pick: { tipo: 'proveedor', id: pv.id }, slide: 'right' } // fuerza animación de regreso
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f2f2f7' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#f2f2f7', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, position: 'relative' }}>
          <NavBack />
          <Typography variant="subtitle1" sx={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', fontWeight: 600 }}>
            Proveedor
          </Typography>
          <span style={{ width: 40 }} />
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
      ) : (
        <List sx={{ bgcolor: '#fff' }}>
          {provs.map(p => (
            <ListItemButton key={p.id} onClick={() => pick(p)}>
              <ListItemText primary={p.nombre} />
              {preselect === p.id && <span style={{ color: 'var(--mui-palette-primary-main)' }}>✓</span>}
            </ListItemButton>
          ))}
        </List>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}