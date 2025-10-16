import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Stack, Typography, Box, Divider, CircularProgress,
  TextField, InputAdornment, IconButton, Skeleton, Switch, FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import NavBack from '../../components/NavBack';
import {
  fetchProductosResumen,
  getCachedProductosResumen,
  BASE_URL
} from '../../api';

export default function ProductosConfig() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // cuando hay cache y viene actualización
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showImages, setShowImages] = useState(true);
  const navigate = useNavigate();

  // Carga (stale-while-revalidate)
  const load = async ({ useCacheFirst = true, signal } = {}) => {
    setError('');
    if (useCacheFirst) {
      const cached = getCachedProductosResumen({ q, orden: 'nombre_asc', maxAgeMs: 6 * 60 * 1000 });
      if (cached && cached.length) {
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
      const data = await fetchProductosResumen({ q, orden: 'nombre_asc', signal });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[ProductosConfig] resumen error:', e);
      if (!rows.length) setError('No se pudo cargar productos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Inicial + cada vez que cambia q (con debounce ligero)
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      load({ useCacheFirst: true, signal: ctrl.signal });
    }, 180); // pequeño debounce para escritura
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const listado = useMemo(() => {
    return rows.map(p => ({
      id: p.id,
      descripcion: p.descripcion || '-',
      material: p.material || '',
      imagenUrl: p.imagen ? `${BASE_URL}/images/${p.imagen}` : '/logo.png',
      stock_total: Number(p.stock_total || 0)
    }));
  }, [rows]);

  const skeletonItems = Array.from({ length: 6 });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
        <NavBack ariaLabel="Volver a Configuración General" to="/config/general" />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Productos</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Stock total por producto
        </Typography>
        <Box sx={{ flex: 1 }} />
        {refreshing && (
          <CircularProgress size={16} thickness={5} sx={{ mr: 1 }} />
        )}
        <IconButton
            size="small"
            onClick={() => load({ useCacheFirst: false })}
            aria-label="Refrescar"
        >
          <RefreshRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar descripción o material…"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: q && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQ('')}
                  aria-label="Limpiar búsqueda"
                >
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showImages}
              onChange={(e) => setShowImages(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="caption">Imágenes</Typography>}
          sx={{ m: 0, ml: { xs: 0, sm: 1 } }}
        />
      </Stack>

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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.1
                  }}
                >
                  {showImages && <Skeleton variant="rounded" width={56} height={56} />}
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={18} />
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
            <Typography variant="body2" color="text.secondary">Sin productos.</Typography>
          </Box>
        ) : (
          <Box>
            {listado.map((p, idx) => (
              <Box key={p.id}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.0, cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`/config/productos/${p.id}/variantes`, {
                      state: { producto: { id: p.id, descripcion: p.descripcion, imagen: p.imagen } }
                    })
                  }
                >
                  {showImages && (
                    <Box
                      component="img"
                      loading="lazy"
                      src={p.imagenUrl}
                      alt={p.descripcion}
                      onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                      sx={{
                        width: 56,
                        height: 56,
                        objectFit: 'contain',
                        borderRadius: 1.5,
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 600, lineHeight: 1.1 }}
                      title={p.descripcion}
                    >
                      {p.descripcion}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={p.material}
                    >
                      {p.material}
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
                      title={`Stock total: ${p.stock_total}`}
                    >
                      <Typography variant="caption" sx={{ lineHeight: 1 }}>
                        {p.stock_total}
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