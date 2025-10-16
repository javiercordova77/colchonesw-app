import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Container, Stack, Typography, Box, Divider, CircularProgress,
  TextField, InputAdornment, IconButton, Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import NavBack from '../../components/NavBack';
import {
  fetchProductoById,
  getCachedProductoById,
  fetchVariantesResumen,
  getCachedVariantesResumen,
  getImagenUrl
} from '../../api';

export default function VariantesConfig() {
  const { id } = useParams(); // id de producto
  const navigate = useNavigate();
  const { state } = useLocation();

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [producto, setProducto] = useState(() => state?.producto || null);

  // Cargar info del producto (para el título)
  useEffect(() => {
    let cancel = false;
    if (producto?.descripcion) return;
    const cached = getCachedProductoById(id);
    if (cached) {
      setProducto(cached);
      return;
    }
    (async () => {
      try {
        const data = await fetchProductoById(id);
        if (!cancel) setProducto(data);
      } catch (e) {
        console.error('[VariantesConfig] fetchProductoById:', e);
      }
    })();
    return () => { cancel = true; };
  }, [id, producto]);

  // Cargar variantes (SWR simple)
  const load = async ({ useCacheFirst = true, signal } = {}) => {
    setError('');
    if (useCacheFirst) {
      const cached = getCachedVariantesResumen({ idProducto: id, q, orden: 'medida_asc', maxAgeMs: 6 * 60 * 1000 });
      if (cached) {
        setRows(cached);
        setLoading(false);
        setRefreshing(true);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    try {
      const data = await fetchVariantesResumen({ idProducto: id, q, orden: 'medida_asc', signal });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[VariantesConfig] fetchVariantesResumen:', e);
      if (!rows.length) setError('No se pudo cargar variantes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => load({ useCacheFirst: true, signal: ctrl.signal }), 150);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, q]);

  const listado = useMemo(() => {
    return rows.map(v => ({
      id: v.id,
      medida: v.medida || '-',
      codigo: v.codigo_variante || '',
      stock_total: Number(v.stock_total || 0)
    }));
  }, [rows]);

  const skeletonItems = Array.from({ length: 6 });
  const titulo = producto?.descripcion || 'Variantes';
  const imagenUrl = producto?.imagen ? getImagenUrl(producto.imagen) : null;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <NavBack ariaLabel="Volver a Productos" to="/config/productos" />
        {imagenUrl && (
          <Box
            component="img"
            src={imagenUrl}
            alt={titulo}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            sx={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 0.5 }}
          />
        )}
        <Typography variant="h6" sx={{ fontWeight: 800 }} title={titulo}>
          {titulo}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {refreshing && <CircularProgress size={16} thickness={5} sx={{ mr: 1 }} />}
        <IconButton size="small" onClick={() => load({ useCacheFirst: false })} aria-label="Refrescar">
          <RefreshRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar medida o código…"
        size="small"
        fullWidth
        sx={{ mb: 1.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }}
      />

      <Box
        sx={{
          borderRadius: 2,
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          minHeight: 160
        }}
      >
        {loading && !rows.length ? (
          <Box>
            {skeletonItems.map((_, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="50%" height={18} />
                    <Skeleton variant="text" width="40%" height={14} />
                  </Box>
                  <Skeleton variant="circular" width={28} height={28} />
                </Box>
                {i < skeletonItems.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="error.main">{error}</Typography>
          </Box>
        ) : listado.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Sin variantes.</Typography>
          </Box>
        ) : (
          <Box>
            {listado.map((v, idx) => (
              <Box key={v.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.0 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }} title={v.medida}>
                      {v.medida}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap title={v.codigo}>
                      {v.codigo}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.paper'
                      }}
                      title={`Stock total: ${v.stock_total}`}
                    >
                      <Typography variant="caption" sx={{ lineHeight: 1 }}>
                        {v.stock_total}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {idx < listado.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}